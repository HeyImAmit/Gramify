# gemini_model_loader.py
import google.generativeai as genai

genai.configure(api_key="AIzaSyCElD6bbZyjc-a8evE4R-QMG2Vn_vA-JFk")
gemini_model = genai.GenerativeModel("gemini-1.5-pro")