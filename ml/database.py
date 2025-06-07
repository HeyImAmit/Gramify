import pandas as pd
import pymongo
from pymongo.errors import ConnectionFailure
from config import MONGO_URI

_client = None
_db = None
_collection = None
_df = None 

def get_mongo_collection():
    """Establishes and returns the MongoDB collection."""
    global _client, _db, _collection
    if _collection is None:
        try:
            _client = pymongo.MongoClient(MONGO_URI)
            _client.admin.command('ping') 
            _db = _client["baking_ai"] 
            _collection = _db["ingredients"]
            print("Successfully connected to MongoDB!")
        except ConnectionFailure as e:
            print(f"MongoDB connection failed: {e}")
            raise ConnectionFailure(f"Could not connect to MongoDB: {e}")
    return _collection

def load_ingredients_dataframe():
    """Loads and returns the ingredients DataFrame from MongoDB.
    This function will be called on app startup or when data needs to be refreshed.
    """
    global _df
    try:
        collection = get_mongo_collection()
        _df = pd.DataFrame(list(collection.find()))
        if not _df.empty:
            _df['name'] = _df['name'].str.lower()
        print("Ingredients DataFrame loaded/reloaded.")
    except ConnectionFailure:
        print("Failed to load ingredients DataFrame due to MongoDB connection issue.")
        _df = pd.DataFrame(columns=['name', 'type', 'grams_per_cup', 'density_g_per_ml', 'category']) # Return empty DF
    return _df

def get_ingredients_dataframe():
    """Returns the cached ingredients DataFrame.
    If not loaded, attempts to load it.
    """
    global _df
    if _df is None or _df.empty: 
        _df = load_ingredients_dataframe()
    return _df

_ = get_mongo_collection() 
_ = load_ingredients_dataframe() 