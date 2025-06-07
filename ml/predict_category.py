# predict_category.py
from gensim.models import KeyedVectors
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import make_pipeline, FunctionTransformer
from sklearn.metrics import classification_report
import pandas as pd
import numpy as np
import pymongo
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv
from google.cloud import storage
from config import MONGO_URI

load_dotenv()

_ft_model = None  # global variable

def download_fasttext_model(gcs_path: str, local_path: str = "fasttext.vec"):
    """Download model from GCS if not already present locally."""
    if os.path.exists(local_path):
        return local_path

    print("⬇️ Downloading fastText model from GCS...")
    storage_client = storage.Client()
    bucket_name, blob_name = gcs_path.replace("gs://", "").split("/", 1)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    blob.download_to_filename(local_path)
    print("✅ Download complete.")
    return local_path

def get_fasttext_model():
    """Load the fastText model once, using GCS download if needed."""
    global _ft_model
    if _ft_model is None:
        gcs_path = os.getenv("FASTTEXT_GCS_PATH")
        local_path = download_fasttext_model(gcs_path)
        print("🔄 Loading fastText model...")
        _ft_model = KeyedVectors.load_word2vec_format(local_path, binary=False)
        print("✅ fastText model loaded.")
    return _ft_model

def get_mongo_collection_for_category_prediction():
    try:
        client = pymongo.MongoClient(MONGO_URI)
        client.admin.command('ping')
        return client["baking_ai"]["ingredients"]
    except ConnectionFailure as e:
        print(f"MongoDB connection failed in predict_category: {e}")
        raise ConnectionFailure(f"Could not connect to MongoDB for category prediction: {e}")

def get_fasttext_vector_batch(names):
    ft_model = get_fasttext_model()
    def single_vector(name):
        words = name.lower().split()
        word_vecs = [ft_model[w] for w in words if w in ft_model]
        if not word_vecs:
            return np.zeros(ft_model.vector_size)
        return np.mean(word_vecs, axis=0)
    return np.vstack([single_vector(name) for name in names])

def get_ingredient_category(ingredient_name: str, collection=None) -> str:
    if collection is None:
        collection = get_mongo_collection_for_category_prediction()

    df = pd.DataFrame(list(collection.find({"category": {"$exists": True}}, {"_id": 0, "name": 1, "category": 1})))

    if df.empty:
        print("No category data found in the database. Cannot predict category.")
        return "unknown"

    df['name'] = df['name'].str.lower()
    ingredient_name = ingredient_name.lower()

    if len(set(df['category'])) < 2:
        print("Not enough category variety to train model.")
        return "unknown"

    pipeline = make_pipeline(
        FunctionTransformer(get_fasttext_vector_batch, validate=False),
        RandomForestClassifier(n_estimators=100, random_state=42)
    )

    pipeline.fit(df['name'], df['category'])

    predicted_category = pipeline.predict([ingredient_name])[0]
    print(f"Predicted category for '{ingredient_name}': {predicted_category}")
    return predicted_category
