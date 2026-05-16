import os
from dotenv import load_dotenv

load_dotenv()  # this loads .env file

print(os.getenv("GEMINI_API_KEY"))