# from sklearn.ensemble import RandomForestRegressor # No longer needed for simple averaging
import pandas as pd
import pymongo
from sklearn.ensemble import RandomForestRegressor
from pymongo.errors import ConnectionFailure
from typing import Tuple
from config import MONGO_URI
from predict_category_update import get_ingredient_category

def get_mongo_collection_for_prediction():
    try:
        client = pymongo.MongoClient(MONGO_URI)
        client.admin.command('ping')
        return client["baking_ai"]["ingredients"]
    except ConnectionFailure as e:
        print(f"MongoDB connection failed in predict_missing_densities: {e}")
        raise ConnectionFailure(f"Could not connect to MongoDB for prediction: {e}")


def get_similar_ingredients(category: str, collection) -> pd.DataFrame:
    """Retrieve ingredients of the same category from MongoDB."""
    similar_items = list(collection.find({"category": category}, {"_id": 0}))
    return pd.DataFrame(similar_items)

def predict_type_by_density(density: float) -> str:
    """Predicts if an ingredient is 'Liquid' or 'Solid' based on its density."""
    return "Liquid" if density >= 0.9 else "Solid" 

def predict_densities(ingredient_name: str) -> Tuple[str, float, float, str, str]:
    """
    Predict density and grams per cup for a new ingredient based on its predicted category
    and the average values within that category.
    """
    category = get_ingredient_category(ingredient_name)

    if not category:
        print(f"Warning: Could not predict category for '{ingredient_name}'. Using 'unknown'.")
        category = "unknown"

    collection = get_mongo_collection_for_prediction()

    df_category = get_similar_ingredients(category, collection)

    if df_category.empty:
        print(f"No existing data for category '{category}'. Assigning default values.")
        predicted_density_ml = 1.0 
        predicted_grams_per_cup = 240.0 
        predicted_type = "Liquid" 
    else:
        df_valid_data = df_category.dropna(subset=['grams_per_cup', 'density_g_per_ml'])

        if df_valid_data.empty:
            print(f"No valid 'grams_per_cup' or 'density_g_per_ml' data in category '{category}'. Assigning default values.")
            predicted_density_ml = 1.0
            predicted_grams_per_cup = 240.0
            predicted_type = "Liquid"
        if len(df_valid_data)>=10:
            X = df_valid_data[["density_g_per_ml"]]
            y = df_valid_data["grams_per_cup"]
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X, y)
            avg_density = df_valid_data["density_g_per_ml"].mean()
            predicted_grams_per_cup = model.predict([[avg_density]])[0]
            predicted_density_ml=avg_density
            predicted_type = predict_type_by_density(predicted_density_ml)
        else:
            predicted_grams_per_cup = df_valid_data["grams_per_cup"].mean()
            predicted_density_ml = df_valid_data["density_g_per_ml"].mean()
            predicted_type = predict_type_by_density(predicted_density_ml)

    print(f"Predicted properties for '{ingredient_name}': Density={predicted_density_ml:.3f} g/ml, Grams/Cup={predicted_grams_per_cup:.2f}g, Type={predicted_type}, Category={category}")
    return ingredient_name, predicted_density_ml, predicted_grams_per_cup, category, predicted_type
    
def add_prediction_to_db(ingredient_name: str, predicted_density: float, predicted_grams_per_cup: float, predicted_type: str, cate: str, collection) -> None:
    """
    Adds a predicted ingredient's properties to the database.
    """
    new_ingredient = {
        "name": ingredient_name.lower(), 
        "density_g_per_ml": predicted_density,
        "grams_per_cup": predicted_grams_per_cup,
        "category": cate,
        "type": predicted_type
    }
    try:
        collection.insert_one(new_ingredient)
        print(f"Inserted predicted ingredient '{ingredient_name}' into database.")
    except pymongo.errors.PyMongoError as e:
        print(f"Error inserting predicted ingredient '{ingredient_name}' into DB: {e}")