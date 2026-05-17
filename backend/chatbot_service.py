import os
import google.generativeai as genai
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from guardrails import check_context, is_greeting_or_intro, normalize_text, is_short_followup
from dotenv import load_dotenv

load_dotenv()

# Setup Gemini API
api_key = os.getenv("GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)

router = APIRouter(prefix="/chat", tags=["Chatbot"])

class MessageItem(BaseModel):
    sender: str  # "user" or "bot"
    text: str

class ChatRequest(BaseModel):
    message: str
    history: list[MessageItem] = None

def classify_intent_with_ai(model, message: str) -> str:
    """
    Fallback classifier using Gemini to infer user intent even with heavy typos or incomplete words.
    """
    prompt = (
        "You are an intent classifier for a duck health chatbot. "
        "Classify the following user message into one of three categories:\n"
        "1. 'GREETING' - Small talk, greetings, introduction requests (e.g., hello, who are you, what can you do).\n"
        "2. 'DUCK_HEALTH' - Queries about ducks, avian influenza, bird flu, duck symptoms, prevention, or biosecurity (even with typos or spelling errors).\n"
        "3. 'OUT_OF_CONTEXT' - Any query completely unrelated to duck health, poultry, avian influenza, or greetings (e.g., weather, cooking recipes, jokes, general programming, politics).\n\n"
        f"User Message: '{message}'\n\n"
        "Respond with ONLY one word matching the category name: 'GREETING', 'DUCK_HEALTH', or 'OUT_OF_CONTEXT'."
    )
    try:
        response = model.generate_content(prompt)
        classification = response.text.strip().upper()
        if "GREETING" in classification:
            return "GREETING"
        elif "DUCK_HEALTH" in classification or "HEALTH" in classification:
            return "DUCK_HEALTH"
        else:
            return "OUT_OF_CONTEXT"
    except Exception as e:
        print(f"AI Classification Error: {e}")
        return "OUT_OF_CONTEXT"

@router.post("/")
async def chat_endpoint(request: ChatRequest):
    user_message = request.message.strip()
    history = request.history or []
    
    if not user_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
        
    # Setup Gemini Model
    if not api_key:
        return {"response": "System is offline: No GEMINI_API_KEY provided."}
        
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # ── CONTEXT PRIORITY ORDER ──
        
        # 1. Follow-up / continuation messages (HIGHEST PRIORITY)
        has_history = len(history) > 1  # excluding initial welcome
        is_followup = has_history and is_short_followup(user_message)
        
        if is_followup:
            # Let it proceed directly to Gemini generation
            pass
        else:
            # 2. Avian influenza / duck health intent & Greeting check
            if is_greeting_or_intro(user_message):
                if has_history:
                    # Let it proceed to Gemini so it generates a dynamic greeting, never restarting with static introduction
                    pass
                else:
                    return {
                        "response": (
                            "Hello! I am the Duck Health Assistant. I help farmers identify and understand "
                            "Avian Influenza (Bird Flu) in ducks. You can ask me about symptoms, prevention, "
                            "biosecurity, and when to contact a veterinarian."
                        )
                    }
            else:
                is_valid_context = check_context(user_message)
                
                # 3. AI-based intent detection fallback if locally uncertain
                if not is_valid_context:
                    ai_intent = classify_intent_with_ai(model, user_message)
                    if ai_intent == "GREETING":
                        if has_history:
                            # Let it proceed to Gemini dynamically
                            pass
                        else:
                            return {
                                "response": (
                                    "Hello! I am the Duck Health Assistant. I help farmers identify and understand "
                                    "Avian Influenza (Bird Flu) in ducks. You can ask me about symptoms, prevention, "
                                    "biosecurity, and when to contact a veterinarian."
                                )
                            }
                    elif ai_intent == "OUT_OF_CONTEXT":
                        return {"response": "Sorry, this query is out of context."}
                    # If DUCK_HEALTH, it proceeds to generate response!
        
        # ── 4. Generate Chatbot Response with Gemini (including full history context) ──
        system_instruction = (
            "You are an expert veterinary assistant specializing in avian influenza in ducks helping farmers. "
            "Infer the user's intent even if spelling is incorrect or words are incomplete. "
            "Maintain conversation flow and context continuity. If the user says 'yes', 'no', or simple follow-ups, "
            "refer to the conversation history to answer them accurately within the scope of avian influenza in ducks. "
            "Provide clear explanations, prevention advice, biosecurity steps, and guidance to contact veterinarians. "
            "Keep responses short and practical for farmers. "
            "Do not answer questions completely unrelated to duck health or avian influenza."
        )
        
        # Format the history into the prompt
        formatted_history = ""
        for item in history:
            role = "Farmer" if item.sender == "user" else "Assistant"
            formatted_history += f"{role}: {item.text}\n"
            
        full_prompt = (
            f"{system_instruction}\n\n"
            "Conversation History:\n"
            f"{formatted_history}"
            f"Farmer: {user_message}\n"
            "Assistant:"
        )
        
        response = model.generate_content(full_prompt)
        
        return {"response": response.text}
        
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {"response": "Sorry, I am currently unable to process your request."}
