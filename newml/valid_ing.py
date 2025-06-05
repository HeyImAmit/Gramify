from gemini_model_loader import gemini_model

def is_valid_ingredient(name: str) -> bool:
    prompt = f"Is '{name}' a valid cooking ingredient? Reply with only 'Yes' or 'No'. If there is a spelling mistake return 'No'."
    try:
        response = gemini_model.generate_content(prompt)
        reply = response.text.strip().lower()
        return reply.startswith("yes")
    except Exception as e:
        print("❌ Error during Gemini call:", e)
        return False
    