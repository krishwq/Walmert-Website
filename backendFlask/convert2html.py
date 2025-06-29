
from google import genai

GEMINI_API_KEY = "AIzaSyAeM8A9Eb0xW3vBTFgdzJQQWlDUCcdWQtU"

client = genai.Client(api_key=GEMINI_API_KEY)

def convert(product_text):
    prompt = f"""
    Convert the following string into appropriate raw HTML **without modifying the string content**:

    - If any image URL is present, display the image with a width of 220px, without any label (e.g.'image URL') and without list .
    - If any other URL is present, convert it into a clickable link with `target="_blank"`.
    - If a price is mentioned (e.g., in the format `$123` or `123 USD`), make it **bold**.

    Important:
    - Return ONLY raw HTML (no markdown, no code fences like ```html or ```), and no extra explanation.
    - Do NOT include <html>, <head>, or <body> tags.

    String to convert:
    {product_text}
    """


    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=prompt
    )
    return response.text

