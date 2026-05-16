import re

def check_context(message: str) -> bool:
    """
    Guardrail function to ensure the message relates to avian influenza in ducks.
    Returns True if the context is valid, False otherwise.
    """
    message_lower = message.lower()
    
    # List of keywords related to ducks, avian influenza, and bird flu
    valid_keywords = [
        "duck", "ducks", "avian", "influenza", "bird flu", 
        "disease", "symptom", "poultry", "virus", "infection",
        "egg", "vet", "health", "sick", "ill"
    ]
    
    # We require the message to at least mention something about ducks/birds 
    # OR diseases/health to be considered potentially valid.
    # To be strictly safe, we check if any valid keyword is present.
    # We can refine this to require a combination if needed.
    
    has_valid_keyword = any(keyword in message_lower for keyword in valid_keywords)
    
    # We can also add negative keywords to catch explicit out-of-context topics quickly
    invalid_keywords = [
        "weather", "joke", "politics", "coding", "code", "python", "javascript",
        "recipe", "cook", "meat", "president", "election", "movie", "song"
    ]
    
    has_invalid_keyword = any(keyword in message_lower for keyword in invalid_keywords)
    
    if has_invalid_keyword:
        return False
        
    return has_valid_keyword
