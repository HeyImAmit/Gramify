from difflib import get_close_matches
import nltk
import spacy
import pandas as pd
from typing import Optional, Tuple, Set, List, Dict, Union

from extraction import RecipeMeasurementExtractor, RecipeConverter

from predict_missing_densities_updated import predict_densities, add_prediction_to_db
from predict_category_update import get_ingredient_category
from valid_ing import is_valid_ingredient

from database import get_mongo_collection, get_ingredients_dataframe, load_ingredients_dataframe

from config import SPACY_MODEL

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

def get_suggestion(ingredient: str, known_ingredients: list) -> Optional[str]:
    """
    Finds a close match for an ingredient in a list of known ingredients.
    """
    if not ingredient:
        print("Warning: get_suggestion received None or empty ingredient.")
        return None
    lower_known = [name.lower() for name in known_ingredients]
    suggestion = get_close_matches(ingredient.lower(), lower_known, n=1, cutoff=0.75)
    return suggestion[0] if suggestion else None


# --- Main processing function ---

def process_ingredient(
    recipe_text: str,
    collection, 
    df: pd.DataFrame, 
    extractor: RecipeMeasurementExtractor, 
    converter: RecipeConverter, 
    confirm: bool = False,
    confirmed_ingredient: Optional[str] = None
) -> dict:
    
    results = extractor.extract_measurements(recipe_text)

    if not results or results[0]['quantity'] is None or results[0]['unit'] is None:
        return {
            "message": "Could not identify quantity or unit. Please rephrase.",
            "confirm_conversion": False
        }
    
    quantity = results[0]['quantity']
    unit = results[0]['unit']
    extracted_ingredient = results[0]['ingredient']
    target_unit = results[0]['target_unit'] 

    final_ingredient_name = extracted_ingredient 

    if extracted_ingredient is None:
        if not confirm:
            return {
                "message": f"Could not identify the ingredient for '{recipe_text}'. Please specify it more clearly or confirm to predict.",
                "confirm_conversion": False
            }
        else:
            if confirmed_ingredient is None:
                return {
                    "message": "Cannot predict properties for an unknown ingredient without a specified ingredient name (e.g., 'confirmed_ingredient' parameter).",
                    "confirm_conversion": False
                }
            final_ingredient_name = confirmed_ingredient.lower() 

    # --- Handle confirmed_ingredient first ---
    if confirmed_ingredient:
        final_ingredient_name = confirmed_ingredient.lower()
        ingredient_exists_in_df = final_ingredient_name in df['name'].values

        if not ingredient_exists_in_df and confirm:
            pass
        elif ingredient_exists_in_df:
            row = df[df['name'] == final_ingredient_name]
            if row.empty:
                return {
                    "message": f"Confirmed ingredient '{final_ingredient_name}' found in DB but row could not be retrieved.",
                    "confirm_conversion": False
                }
            
            row = row.iloc[0]
            typ = row['type'].lower() if 'type' in row and not pd.isna(row['type']) else None
            grams_per_cup = row['grams_per_cup'] if 'grams_per_cup' in row and not pd.isna(row['grams_per_cup']) else None
            density_g_per_ml = row['density_g_per_ml'] if 'density_g_per_ml' in row and not pd.isna(row['density_g_per_ml']) else None

            if unit in ["grams","gm","gms","gram","grms","grm","ml","mililitre","mlitre","cc","milliliter","millil","l","litre","liter","quart", "quarts", "qt","quart", "quarts", "qt","pint", "pints", "pt","fl oz", "fluid ounce", "fluid ounces","kilogram","ounce","pound"]:
                converted_qty, converted_unit_name = converter.convert_to_vague_units(
                    quantity, unit, typ, grams_per_cup, density_g_per_ml, target_unit
                )
                if converted_qty is None:
                    return {
                        "message": f"Could not convert {quantity} {unit} of {final_ingredient_name} to {target_unit} after confirmation. Ensure quantity and unit are clear and ingredient properties are available.",
                        "confirm_conversion": True
                    }
                return {
                    "message": f"{quantity} {unit} of {final_ingredient_name} is approximately {converted_qty:.2f} {converted_unit_name}.",
                    "confirm_conversion": True
                }
            else: 
                grams = converter.convert_to_grams(quantity, unit, final_ingredient_name, df)
                if grams is None:
                    return {
                        "message": "Could not convert the ingredient after confirmation. Ensure quantity and unit are clear.",
                        "confirm_conversion": True
                    }
                elif typ in ["Solid","solid"]:
                    return {
                        "message": f"{quantity} {unit} of {final_ingredient_name} weighs approximately {grams:.2f} grams.",
                        "confirm_conversion": True
                    }
                elif typ in ["Liquid","liquid"]:
                    return {
                        "message": f"{quantity} {unit} of {final_ingredient_name} weighs approximately {grams:.2f} mililitre.",
                        "confirm_conversion": True
                    }
    
    # --- Handle fuzzy matching and unknown ingredients for the first pass or unconfirmed attempts ---
    ingredient_exists_in_df = final_ingredient_name in df['name'].values

    if not ingredient_exists_in_df:
        suggestion = get_suggestion(final_ingredient_name, df['name'].tolist())

        if suggestion and not confirm:
            return {
                "message": f"Ingredient '{final_ingredient_name}' not found. Did you mean '{suggestion}'?",
                "suggested_ingredient": suggestion,
                "confirm_conversion": False
            }
        else:
            if confirm:
                try:
                    if not is_valid_ingredient(final_ingredient_name):
                        return {
                            "message": f"'{final_ingredient_name}' does not appear to be a valid cooking ingredient. Please revise and try again.",
                            "confirm_conversion": False
                        }

                    predicted_name, density, grams_per_cup_pred, cate, typ_pred = predict_densities(final_ingredient_name)
                    add_prediction_to_db(predicted_name, density, grams_per_cup_pred, typ_pred, cate, collection)
                    
                    global ingredients_df
                    ingredients_df = load_ingredients_dataframe()

                    row = ingredients_df[ingredients_df['name'] == predicted_name]
                    if row.empty:
                        raise ValueError(f"Predicted ingredient '{predicted_name}' not found in reloaded DataFrame.")

                    row = row.iloc[0]
                    typ_reloaded = row['type'].lower() if 'type' in row and not pd.isna(row['type']) else None
                    grams_per_cup_reloaded = row['grams_per_cup'] if 'grams_per_cup' in row and not pd.isna(row['grams_per_cup']) else None
                    density_g_per_ml_reloaded = row['density_g_per_ml'] if 'density_g_per_ml' in row and not pd.isna(row['density_g_per_ml']) else None

                    if unit in ["grams","gm","gms","gram","grms","grm","ml","mililitre","mlitre","cc","milliliter","millil","l","litre","liter","quart", "quarts", "qt","quart", "quarts", "qt","pint", "pints", "pt","fl oz", "fluid ounce", "fluid ounces","kilogram","ounce","pound"]:
                        converted_qty, converted_unit_name = converter.convert_to_vague_units(
                            quantity, unit, typ_reloaded, grams_per_cup_reloaded, density_g_per_ml_reloaded, target_unit
                        )
                        if converted_qty is None:
                            return {
                                "message": "Successfully predicted properties, but could not convert to target unit. Ensure quantity and unit are clear.",
                                "confirm_conversion": True
                            }
                        return {
                            "message": f"{quantity} {unit} of {predicted_name} is approximately {converted_qty:.2f} {converted_unit_name}.",
                            "confirm_conversion": True
                        }
                    else: 
                        grams = converter.convert_to_grams(quantity, unit, predicted_name, ingredients_df)
                        if grams is None:
                            return {
                                "message": "Successfully predicted properties, but could not convert. Ensure quantity and unit are clear.",
                                "confirm_conversion": True
                            }
                        elif typ in ["Solid","solid"]:
                            return {
                                "message": f"{quantity} {unit} of {final_ingredient_name} weighs approximately {grams:.2f} grams.",
                                "confirm_conversion": True
                            }
                        elif typ in ["Liquid","liquid"]:
                            return {
                                "message": f"{quantity} {unit} of {final_ingredient_name} weighs approximately {grams:.2f} mililitre.",
                                "confirm_conversion": True
                            }
                except Exception as e:
                    return {
                        "message": f"Could not predict properties for '{final_ingredient_name}'. Error: {str(e)}",
                        "confirm_conversion": False
                    }
            else:
                try:
                    if not is_valid_ingredient(final_ingredient_name):
                        return {
                            "message": f"'{final_ingredient_name}' does not appear to be a valid cooking ingredient. Please revise and try again.",
                            "confirm_conversion": False
                        }

                    predicted_name, density, grams_per_cup_pred, cate, typ_pred = predict_densities(final_ingredient_name)
                    add_prediction_to_db(predicted_name, density, grams_per_cup_pred, typ_pred, cate, collection)
                    
                    ingredients_df = load_ingredients_dataframe()

                    row = ingredients_df[ingredients_df['name'] == predicted_name]
                    if row.empty:
                        raise ValueError(f"Predicted ingredient '{predicted_name}' not found in reloaded DataFrame.")

                    row = row.iloc[0]
                    typ_reloaded = row['type'].lower() if 'type' in row and not pd.isna(row['type']) else None
                    grams_per_cup_reloaded = row['grams_per_cup'] if 'grams_per_cup' in row and not pd.isna(row['grams_per_cup']) else None
                    density_g_per_ml_reloaded = row['density_g_per_ml'] if 'density_g_per_ml' in row and not pd.isna(row['density_g_per_ml']) else None

                    if unit in ["grams","gm","gms","gram","grms","grm","ml","mililitre","mlitre","cc","milliliter","millil","l","litre","liter","quart", "quarts", "qt","quart", "quarts", "qt","pint", "pints", "pt","fl oz", "fluid ounce", "fluid ounces","kilogram","ounce","pound"]:
                        converted_qty, converted_unit_name = converter.convert_to_vague_units(
                            quantity, unit, typ_reloaded, grams_per_cup_reloaded, density_g_per_ml_reloaded, target_unit
                        )
                        if converted_qty is None:
                            return {
                                "message": "Successfully predicted properties, but could not convert to target unit. Ensure quantity and unit are clear.",
                                "confirm_conversion": True
                            }
                        return {
                            "message": f"{quantity} {unit} of {predicted_name} is approximately {converted_qty:.2f} {converted_unit_name}.",
                            "confirm_conversion": True
                        }
                    else: 
                        grams = converter.convert_to_grams(quantity, unit, predicted_name, ingredients_df)
                        if grams is None:
                            return {
                                "message": "Successfully predicted properties, but could not convert. Ensure quantity and unit are clear.",
                                "confirm_conversion": True
                            }
                        elif typ in ["Solid","solid"]:
                            return {
                                "message": f"{quantity} {unit} of {final_ingredient_name} weighs approximately {grams:.2f} grams.",
                                "confirm_conversion": True
                            }
                        elif typ in ["Liquid","liquid"]:
                            return {
                                "message": f"{quantity} {unit} of {final_ingredient_name} weighs approximately {grams:.2f} mililitre.",
                                "confirm_conversion": True
                            }
                except Exception as e:
                    return {
                        "message": f"Could not predict properties for '{final_ingredient_name}'. Error: {str(e)}",
                        "confirm_conversion": False
                    }
    
   
    row = df[df['name'] == final_ingredient_name]
    if row.empty:
        return {
            "message": f"Ingredient '{final_ingredient_name}' unexpectedly not found in DataFrame.",
            "confirm_conversion": False
        }

    row = row.iloc[0]
    typ = row['type'].lower() if 'type' in row and not pd.isna(row['type']) else None
    grams_per_cup = row['grams_per_cup'] if 'grams_per_cup' in row and not pd.isna(row['grams_per_cup']) else None
    density_g_per_ml = row['density_g_per_ml'] if 'density_g_per_ml' in row and not pd.isna(row['density_g_per_ml']) else None

    if unit in ["grams","gm","gms","gram","grms","grm","ml","mililitre","mlitre","cc","milliliter","millil","l","litre","liter","quart", "quarts", "qt","quart", "quarts", "qt","pint", "pints", "pt","fl oz", "fluid ounce", "fluid ounces","kilogram","ounce","pound"]:
        converted_qty, converted_unit_name = converter.convert_to_vague_units(
            quantity, unit, typ, grams_per_cup, density_g_per_ml, target_unit
        )
    
        if converted_qty is None:
            return {
                "message": f"Could not convert {quantity} {unit} of {final_ingredient_name} to {target_unit}. Ensure quantity and unit are clear and ingredient properties are available.",
                "confirm_conversion": True
            }
        return {
            "message": f"{quantity} {unit} of {final_ingredient_name} is approximately {converted_qty:.2f} {converted_unit_name}.",
            "confirm_conversion": True
        }
    else:
        grams = converter.convert_to_grams(quantity, unit, final_ingredient_name, df)
        if grams is None:
            return {
                "message": "Could not convert the ingredient. Ensure quantity and unit are clear or ingredient is known.",
                "confirm_conversion": True
            }

        elif typ in ["Solid","solid"]:
            return {
                "message": f"{quantity} {unit} of {final_ingredient_name} weighs approximately {grams:.2f} grams.",
                "confirm_conversion": True
            }
        elif typ in ["Liquid","liquid"]:
            return {
                "message": f"{quantity} {unit} of {final_ingredient_name} weighs approximately {grams:.2f} mililitre.",
                "confirm_conversion": True
            }
