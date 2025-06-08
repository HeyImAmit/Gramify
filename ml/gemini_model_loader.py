# gemini_model_loader.py
import os
import google.generativeai as genai

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("Missing GEMINI_API_KEY in environment")

genai.configure(api_key=api_key)
gemini_model = genai.GenerativeModel("gemini-2.5-flash-preview-05-20")

