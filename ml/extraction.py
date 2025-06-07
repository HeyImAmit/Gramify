from typing import Optional, Tuple, List, Dict, Union, Set
import spacy
from word2number import w2n
import re
from fractions import Fraction
import logging
import pandas as pd

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def convert_text_numbers(text: str) -> str:
    """
    Converts number words (e.g., 'one and a half', 'two and quarter') to digits.
    """
    def replace_number_words(match):
        original = match.group(0)
        num_text = original.lower().replace('-', ' ').strip()

        if " and " in num_text:
            parts = num_text.split(" and ")
            if len(parts) == 2:
                try:
                    whole = w2n.word_to_num(parts[0])
                    if "half" in parts[1]:
                        return str(whole + 0.5)
                    elif "quarter" in parts[1]:
                        return str(whole + 0.25)
                except ValueError:
                    pass

        try:
            return str(w2n.word_to_num(num_text))
        except ValueError:
            return original

    number_words = [
        'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
        'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
        'eighteen', 'nineteen', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy',
        'eighty', 'ninety', 'hundred', 'thousand', 'million', 'billion', 'and', 'a', 'an',
        'half', 'quarter'
    ]

    pattern = re.compile(
        r'\b(?:' + '|'.join(number_words) + r')(?:[\s-]+(?:' + '|'.join(number_words) + r'))*\b',
        re.IGNORECASE
    )
    return pattern.sub(replace_number_words, text)

class RecipeMeasurementExtractor:
    def __init__(self, nlp_model=None):
        self.nlp = nlp_model if nlp_model else self._load_spacy_model()
        self.unit_mapping = self._get_unit_mapping()
        self.number_words = self._get_number_words()
        
    def _load_spacy_model(self):
        try:
            return spacy.load("en_core_web_sm")
        except OSError:
            logger.error("spaCy model 'en_core_web_sm' not found. Please install it using: python -m spacy download en_core_web_sm")
            raise ImportError("Required spaCy model not available")
    
    def _get_unit_mapping(self) -> Dict[str, str]:
        return {
            'tsp': 'teaspoon', 'teaspoon': 'teaspoon', 't': 'teaspoon', 'teaspoons': 'teaspoon',
            'tbsp': 'tablespoon', 'tablespoon': 'tablespoon', 'tbs': 'tablespoon', 'tablespoons': 'tablespoon',
            'fl oz': 'fluid ounce', 'fluid ounce': 'fluid ounce', 'fluid ounces': 'fluid ounce',
            'cup': 'cup', 'cups': 'cup', 'c': 'cup',
            'pint': 'pint', 'pints': 'pint', 'pt': 'pint',
            'quart': 'quart', 'quarts': 'quart', 'qt': 'quart',
            'gallon': 'gallon', 'gallons': 'gallon', 'gal': 'gallon',
            'ml': 'milliliter', 'milliliter': 'milliliter', 'millilitre': 'milliliter', 'cc': 'milliliter',
            'l': 'liter', 'liter': 'liter', 'litre': 'liter',
            'g': 'gram', 'gram': 'gram', 'grams': 'gram', 'gm': 'gram', 'gms': 'gram', 'grms': 'gram', 'grm': 'gram',
            'kg': 'kilogram', 'kilogram': 'kilogram', 'kilograms': 'kilogram', 'kilo': 'kilogram', 'kilos': 'kilogram',
            'oz': 'ounce', 'ounce': 'ounce', 'ounces': 'ounce',
            'lb': 'pound', 'pound': 'pound', 'lbs': 'pound', 'pounds': 'pound',
            'clove': 'clove', 'cloves': 'clove',
            'piece': 'piece', 'pieces': 'piece',
            'slice': 'slice', 'slices': 'slice',
            'can': 'can', 'cans': 'can',
            'package': 'package', 'packages': 'package',
            'sprig': 'sprig', 'sprigs': 'sprig',
            'head': 'head', 'heads': 'head',
            'stalk': 'stalk', 'stalks': 'stalk',
            'leaf': 'leaf', 'leaves': 'leaf',
            'pinch': 'pinch', 'pinches': 'pinch',
            'dash': 'dash', 'dashes': 'dash',
            'to taste': 'to taste'
        }
    
    def _get_number_words(self) -> Set[str]:
        return {
            'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
            'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
            'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'thirty',
            'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'thousand', 'million',
            'half', 'quarter', 'a', 'an'
        }

    def _parse_quantity(self, text: str) -> Optional[float]:
        text = text.strip().lower()
        if not text:
            return None

        match_fraction = re.match(r'(\d+)?\s*(\d+/\d+)', text)
        if match_fraction:
            whole = float(match_fraction.group(1)) if match_fraction.group(1) else 0
            fraction_part = float(Fraction(match_fraction.group(2)))
            return whole + fraction_part

        match_decimal = re.match(r'^\d*\.?\d+$', text)
        if match_decimal:
            return float(text)

        try:
            if text in ['a', 'an']:
                return 1.0
            if text == 'half':
                return 0.5
            if text == 'quarter':
                return 0.25
            if text in ['a half', 'half']:
                return 0.5
            return float(w2n.word_to_num(text))
        except ValueError:
            pass
        
        return None

    def extract_measurements(self, recipe_text: str) -> List[Dict[str, Union[float, str, None]]]:
        recipe_text = convert_text_numbers(recipe_text)
        doc = self.nlp(recipe_text)
        
        quantity = None
        unit = None
        ingredient_start_idx = -1
        target_unit_idx = -1
        target_unit = None

        for i, token in enumerate(doc):
            lower_token = token.text.lower()
            if lower_token in ['to', 'in', 'as', 'for', 'into'] and i + 1 < len(doc) and doc[i+1].text.lower() in self.unit_mapping:
                target_unit = self.unit_mapping[doc[i+1].text.lower()]
                target_unit_idx = i
                
            if quantity is None:
                parsed_qty = self._parse_quantity(lower_token)
                if parsed_qty is not None:
                    quantity = parsed_qty
                    ingredient_start_idx = i + 1
                    continue

            if unit is None and quantity is not None:
                if lower_token in self.unit_mapping:
                    unit = self.unit_mapping[lower_token]
                    ingredient_start_idx = i + 1
                    continue
        
        ingredient_tokens = []
        if ingredient_start_idx != -1:
            for i in range(ingredient_start_idx, len(doc)):
                if target_unit_idx != -1 and i >= target_unit_idx:
                    break
                token = doc[i]
                if token.is_punct and token.text not in ["-", "'"]:
                    break
                if token.text.lower() in ['and', 'or', 'with', 'plus']:
                    break
                ingredient_tokens.append(token.text)
        
        ingredient = " ".join(ingredient_tokens).strip()
        ingredient = re.sub(r'^\s*of\s*', '', ingredient, flags=re.IGNORECASE).strip()
        for mapped_unit in self.unit_mapping.values():
            ingredient = re.sub(r'\s+' + re.escape(mapped_unit) + r'$', '', ingredient, flags=re.IGNORECASE).strip()
        
        if not ingredient or ingredient.lower() in self.unit_mapping.values() or ingredient.lower() in self.number_words:
            ingredient = None

        results = [{
            'quantity': quantity,
            'unit': unit,
            'ingredient': ingredient,
            'target_unit': target_unit
        }]
        
        if not results[0]['quantity'] and not results[0]['unit'] and not results[0]['ingredient']:
            return [{
                'quantity': None,
                'unit': None,
                'ingredient': None,
                'target_unit': None
            }]
            
        return results

class RecipeConverter:
    
    VOLUME_TO_ML = {
        'teaspoon': 4.92892,
        'tablespoon': 14.7868,
        'fluid ounce': 29.5735,
        'cup': 236.588,
        'pint': 473.176,
        'quart': 946.353,
        'gallon': 3785.41,
        'milliliter': 1,
        'liter': 1000
    }
    
    WEIGHT_TO_GRAMS = {
        'ounce': 28.3495,
        'pound': 453.592,
        'gram': 1,
        'kilogram': 1000
    }

    UNIT_MAPPING = {
        **VOLUME_TO_ML,
        **WEIGHT_TO_GRAMS,
    }
    
    @classmethod
    def convert_to_standard_units(cls, quantity: float, unit: str) -> Tuple[float, str]:
        """Convert quantities to standard units (ml for volume, g for weight)."""
        if unit in cls.VOLUME_TO_ML:
            return quantity * cls.VOLUME_TO_ML[unit], 'ml'
        elif unit in cls.WEIGHT_TO_GRAMS:
            return quantity * cls.WEIGHT_TO_GRAMS[unit], 'g'
        else:
            return quantity, unit

    @classmethod
    def convert_to_grams(
        cls, 
        quantity: float, 
        unit: str, 
        ingredient_name: str, 
        df: pd.DataFrame
    ) -> Optional[float]:
        """
        Converts a given quantity and unit of an ingredient to grams.
        Requires ingredient_name and DataFrame to look up specific densities/grams_per_cup.
        """
        if quantity is None:
            return None
        
        ingredient_name_lower = ingredient_name.lower()

        row = df[df['name'] == ingredient_name_lower]
        if row.empty:
            print(f"Warning: Ingredient '{ingredient_name_lower}' not found in DataFrame for conversion to grams.")
            return None

        typ = row['type'].values[0].lower() if 'type' in row and not pd.isna(row['type'].values[0]) else None
        grams_per_cup_from_db = row['grams_per_cup'].values[0] if 'grams_per_cup' in row and not pd.isna(row['grams_per_cup'].values[0]) else None
        density_from_db = row['density_g_per_ml'].values[0] if 'density_g_per_ml' in row and not pd.isna(row['density_g_per_ml'].values[0]) else 1.0 # Default to water density for safety

        standard_quantity, standard_unit = cls.convert_to_standard_units(quantity, unit)
        if typ=="solid":
            if unit == "cup":
                return quantity * grams_per_cup_from_db
            elif unit == "tablespoon":
                return quantity * grams_per_cup_from_db / 16 
            elif unit == "teaspoon":
                return quantity * grams_per_cup_from_db / 48 
            elif unit == "gram": 
                return quantity
            elif unit == "kilogram":
                return quantity * 1000
            elif unit == "ounce":
                return quantity * 28.3495 
            elif unit == "pound":
                return quantity * 453.592 
            else:
                return None 
        elif typ == 'liquid':
            if unit == "cup":
                return quantity * 240 
            elif unit == "tablespoon":
                return quantity * 15 
            elif unit == "teaspoon":
                return quantity * 5 
            elif unit == "ml":
                return quantity 
            elif unit == "liter":
                return quantity * 1000 
            elif unit == "fluid ounce":
                return quantity * 29.5735 
            elif unit == "pint":
                return quantity * 473.176 
            elif unit == "quart":
                return quantity * 946.353 
            elif unit == "gallon":
                return quantity * 3785.41
            elif unit == "gram": 
                return quantity
            elif unit == "kilogram":
                return quantity * 1000
            elif unit == "ounce":
                return quantity * 28.3495
            elif unit == "pound":
                return quantity * 453.592
            else:
                return None 
        
        return None 
    
    @classmethod
    def scale_recipe(cls, measurements: List[Dict], scale_factor: float) -> List[Dict]:
        """Scale recipe measurements by a given factor."""
        scaled = []
        for measurement in measurements:
            scaled_measurement = measurement.copy()
            if measurement['quantity'] is not None:
                scaled_measurement['quantity'] = measurement['quantity'] * scale_factor
            scaled.append(scaled_measurement)
        return scaled

    @classmethod
    def convert_to_vague_units(
            cls,
            quantity: float,
            unit: str,
            ingredient_type: str, 
            grams_per_cup: Optional[float] = None, 
            density_g_per_ml: Optional[float] = None, 
            target_unit: Optional[str] = ""
        ) -> Tuple[Optional[float], Optional[str]]:
            """
            Converts a measurement to more 'vague' or common units (cups, tbsp, tsp)
            or other specified target units.
            Returns a tuple of (converted_quantity, converted_unit_name).
            """

            if quantity is None:
                return None, None

            standard_quantity, standard_unit = cls.convert_to_standard_units(quantity, unit)

            grams_per_cup_from_db = grams_per_cup if grams_per_cup is not None else 0.0
            density_g_per_ml_val = density_g_per_ml if density_g_per_ml is not None else 1.0 
            target=target_unit
            if unit == "gram": 
                if target in ["cup", "cups","c"]:
                    return quantity / grams_per_cup_from_db,"cups"
                elif target in ["tbsp","tbs","tablespoon","tablespoons"]:
                    return (quantity / grams_per_cup_from_db) * 16, "tablespoons"  
                elif target in ["tsp","teaspoons","teaspoon",'t']:
                    return (quantity / grams_per_cup_from_db) * 48, "teaspoon" 
                elif target in ["grams","gm","gms","gram","grms","grm"]:
                    return quantity,"grams" 
                elif target == None:
                    cups = quantity / grams_per_cup_from_db 
                    if cups > 1 :
                        return cups,"cups"
                    tbsp = cups * 16
                    if tbsp > 1 :
                        return tbsp,"tablespoons"
                    tsp = cups * 48
                    return tsp, "teaspoon"
                
            elif unit in ["ml","mililitre","mlitre","cc","milliliter","millil"]:
                if target in ["cup", "cups","c"]:
                    return quantity / 240 , "cups"
                elif target in ["tbsp","tbs","tablespoon","tablespoons"]:
                    return (quantity / 240)*16 , "tablespoons" 
                elif target in ["tsp","teaspoons","teaspoon"]:
                    return (quantity / 240)*48 , "teaspoon" 
                elif target in ["ml","mililitre","mlitre","cc","milliliter","millil"]:
                    return quantity, "mililitre"
                elif target == None:
                    cups = quantity / 240
                    if cups > 1 :
                        return cups, "cups"
                    tbsp = cups * 16
                    if tbsp > 1 :
                        return tbsp, "tablespoons"
                    tsp = cups * 48
                    return tsp, "teaspoon"
                
            elif unit in ["l","litre","liter"]:
                if target in ["cup", "cups","c"]:
                    return quantity * 4.17 , "cups" 
                elif target in ["tbsp","tbs","tablespoon","tablespoons"]:
                    return quantity * 4.17*16, "tablespoon"  
                elif target in ["tsp","teaspoons","teaspoon"]:
                    return quantity * 4.17*48 , "teaspoon" 
                elif target in ["ml","mililitre","mlitre","cc","milliliter","millil"]:
                    return quantity*1000,"mililitre"
                elif target in ["l","litre","liter"]:
                    return quantity, "litre"
                elif target == None:
                    cups = quantity * 4.17
                    if cups > 1 :
                        return cups, "cups"
                    tbsp = cups * 16
                    if tbsp > 1 :
                        return tbsp, "tablespoon"
                    tsp = cups * 48
                    return tsp, "teaspoon"

            elif unit == "kilogram":  
                grams = quantity * 1000  
                if target in ["cup", "cups", "c"]:
                    return grams / grams_per_cup_from_db, "cups"
                elif target in ["tbsp", "tbs", "tablespoon", "tablespoons"]:
                    return (grams / grams_per_cup_from_db) * 16, "tablespoons"
                elif target in ["tsp", "teaspoons", "teaspoon", 't']:
                    return (grams / grams_per_cup_from_db) * 48, "teaspoon"
                elif target in ["kilograms", "kg", "kilo", "kilos"]:
                    return quantity, "kilograms"
                elif target == None:
                    cups = grams / grams_per_cup_from_db
                    if cups > 1:
                        return cups, "cups"
                    tbsp = cups * 16
                    if tbsp > 1:
                        return tbsp, "tablespoons"
                    tsp = cups * 48
                    return tsp, "teaspoon"

            elif unit == "ounce":  
                grams = quantity * 28.3495  
                if target in ["cup", "cups", "c"]:
                    return grams / grams_per_cup_from_db, "cups"
                elif target in ["tbsp", "tbs", "tablespoon", "tablespoons"]:
                    return (grams / grams_per_cup_from_db) * 16, "tablespoons"
                elif target in ["tsp", "teaspoons", "teaspoon", 't']:
                    return (grams / grams_per_cup_from_db) * 48, "teaspoon"
                elif target in ["ounce", "ounces", "oz"]:
                    return quantity, "ounces"
                elif target == None:
                    cups = grams / grams_per_cup_from_db
                    if cups > 1:
                        return cups, "cups"
                    tbsp = cups * 16
                    if tbsp > 1:
                        return tbsp, "tablespoons"
                    tsp = cups * 48
                    return tsp, "teaspoon"

            elif unit == "pound":  
                grams = quantity * 453.592 
                if target in ["cup", "cups", "c"]:
                    return grams / grams_per_cup_from_db, "cups"
                elif target in ["tbsp", "tbs", "tablespoon", "tablespoons"]:
                    return (grams / grams_per_cup_from_db) * 16, "tablespoons"
                elif target in ["tsp", "teaspoons", "teaspoon", 't']:
                    return (grams / grams_per_cup_from_db) * 48, "teaspoon"
                elif target in ["pound", "pounds", "lb", "lbs"]:
                    return quantity, "pounds"
                elif target == None:
                    cups = grams / grams_per_cup_from_db
                    if cups > 1:
                        return cups, "cups"
                    tbsp = cups * 16
                    if tbsp > 1:
                        return tbsp, "tablespoons"
                    tsp = cups * 48
                    return tsp, "teaspoon"

            elif unit in ["fl oz", "fluid ounce", "fluid ounces"]:
                ml = quantity * 29.5735 
                if target in ["cup", "cups", "c"]:
                    return ml / 240, "cups"
                elif target in ["tbsp", "tbs", "tablespoon", "tablespoons"]:
                    return (ml / 240) * 16, "tablespoons"
                elif target in ["tsp", "teaspoons", "teaspoon"]:
                    return (ml / 240) * 48, "teaspoon"
                elif target in ["fl oz", "fluid ounce", "fluid ounces"]:
                    return quantity, "fluid ounces"
                elif target in ["pint", "pints", "pt"]:
                    return quantity / 16, "pints"  
                elif target in ["quart", "quarts", "qt"]:
                    return quantity / 32, "quarts"  
                elif target in ["gallon", "gallons", "gal"]:
                    return quantity / 128, "gallons" 
                elif target == None:
                    cups = ml / 240
                    if cups > 1 :
                        return cups, "cups"
                    tbsp = cups * 16
                    if tbsp > 1 :
                        return tbsp, "tablespoons"
                    tsp = cups * 48
                    return tsp, "teaspoon"

            elif unit in ["pint", "pints", "pt"]:
                ml = quantity * 473.176  
                if target in ["cup", "cups", "c"]:
                    return quantity * 2, "cups" 
                elif target in ["tbsp", "tbs", "tablespoon", "tablespoons"]:
                    return quantity * 32, "tablespoons" 
                elif target in ["tsp", "teaspoons", "teaspoon"]:
                    return quantity * 96, "teaspoon"  
                elif target in ["pint", "pints", "pt"]:
                    return quantity, "pints"
                elif target in ["quart", "quarts", "qt"]:
                    return quantity / 2, "quarts"  
                elif target in ["gallon", "gallons", "gal"]:
                    return quantity / 8, "gallons"  
                elif target == None:
                    cups = ml / 240
                    if cups > 1 :
                        return cups, "cups"
                    tbsp = cups * 16
                    if tbsp > 1 :
                        return tbsp, "tablespoons"
                    tsp = cups * 48
                    return tsp, "teaspoon"

            elif unit in ["quart", "quarts", "qt"]:
                ml = quantity * 946.353 
                if target in ["cup", "cups", "c"]:
                    return quantity * 4, "cups"  
                elif target in ["tbsp", "tbs", "tablespoon", "tablespoons"]:
                    return quantity * 64, "tablespoons"  
                elif target in ["tsp", "teaspoons", "teaspoon"]:
                    return quantity * 192, "teaspoon" 
                elif target in ["quart", "quarts", "qt"]:
                    return quantity, "quarts"
                elif target in ["gallon", "gallons", "gal"]:
                    return quantity / 4, "gallons" 
                elif target == None:
                    cups = ml / 240
                    if cups > 1 :
                        return cups, "cups"
                    tbsp = cups * 16
                    if tbsp > 1 :
                        return tbsp, "tablespoons"
                    tsp = cups * 48
                    return tsp, "teaspoon"

            elif unit in ["gallon", "gallons", "gal"]:
                ml = quantity * 3785.41  
                if target in ["cup", "cups", "c"]:
                    return quantity * 16, "cups"  
                elif target in ["tbsp", "tbs", "tablespoon", "tablespoons"]:
                    return quantity * 256, "tablespoons"  
                elif target in ["tsp", "teaspoons", "teaspoon"]:
                    return quantity * 768, "teaspoon" 
                elif target in ["gallon", "gallons", "gal"]:
                    return quantity, "gallons"
                elif target == None:
                    cups = ml / 240
                    if cups > 1 :
                        return cups, "cups"
                    tbsp = cups * 16
                    if tbsp > 1 :
                        return tbsp, "tablespoons"
                    tsp = cups * 48
                    return tsp, "teaspoon"

            if unit not in cls.VOLUME_TO_ML and unit not in cls.WEIGHT_TO_GRAMS:
                return quantity, unit 

            return None, None 