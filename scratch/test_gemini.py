import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("No API key found in .env")
    sys.exit(1)

print(f"Testing key: {api_key[:10]}...")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hello, test.")
    print("Response:", response.text)
except Exception as e:
    print("Error:", e)
