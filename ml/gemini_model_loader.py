# gemini_model_loader.py
import google.generativeai as genai

genai.configure(api_key="AIzaSyAQPwrCxu5baBotfkNGIL0frZsmYlfo6SM")
gemini_model = genai.GenerativeModel("gemini-2.5-flash-preview-05-20")
