import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://aditya:gradientgang@cluster0.d11je.mongodb.net/") 

SPACY_MODEL = os.getenv("SPACY_MODEL", "en_core_web_lg")