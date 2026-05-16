import os
import google.generativeai as genai
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from guardrails import check_context
from dotenv import load_dotenv

load_dotenv()

# Setup Gemini API
api_key = os.getenv("GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)

router = APIRouter(prefix="/chat", tags=["Chatbot"])

class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat_endpoint(request: ChatRequest):
    user_message = request.message.strip()
    
    if not user_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
        
    # 1. Apply Guardrails
    is_valid_context = check_context(user_message)
    if not is_valid_context:
        return {"response": "Sorry, this query is out of context."}
        
    # 2. Setup Gemini Model
    # Note: If api_key is missing, provide a mock response for testing if needed,
    # but normally we rely on the API.
    if not api_key:
        return {"response": "System is offline: No GEMINI_API_KEY provided."}
        
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        
        system_instruction = (
            "You are an expert veterinary assistant specializing in avian influenza in ducks helping farmers. "
            "Provide clear explanations, prevention advice, biosecurity steps, and guidance to contact veterinarians. "
            "Keep responses short and practical for farmers. "
            "Do not answer questions completely unrelated to duck health or avian influenza."
        )
        
        # Combine system instruction with user message
        full_prompt = f"{system_instruction}\n\nUser Question: {user_message}\n\nAnswer:"
        
        response = model.generate_content(full_prompt)
        
        return {"response": response.text}
        
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {"response": "Sorry, I am currently unable to process your request."}
