import re

def is_short_followup(message: str) -> bool:
    """
    Detects if the message is a short contextual response or follow-up.
    """
    norm = message.lower().strip().replace(".", "").replace("!", "").replace("?", "")
    short_words = {
        "yes", "no", "ok", "okay", "hmm", "correct", "wrong", 
        "sure", "proceed", "fine", "yep", "nope", "yeah", "nah", 
        "thanks", "thank you", "got it", "i see"
    }
    return norm in short_words or len(norm.split()) <= 2

def normalize_text(text: str) -> str:
    """
    Normalizes user input to handle typos, repeated letters, and common abbreviations.
    """
    # 1. Lowercase and trim
    text = text.lower().strip()
    
    # 2. Reduce repeated characters (e.g., "hiiii" -> "hi", "helloo" -> "hello")
    # Replace 3 or more repeated characters with a single character
    text = re.sub(r'(.)\1{2,}', r'\1', text)
    
    # 3. Interpret common shortened words & abbreviations using mapping
    abbreviations = {
        r'\bhw\b': 'how',
        r'\br\b': 'are',
        r'\bu\b': 'you',
        r'\bwat\b': 'what',
        r'\bwats\b': 'what is',
        r'\bhelo\b': 'hello',
        r'\bhii\b': 'hi',
        r'\bhy\b': 'hi',
        r'\bhey\b': 'hey',
        r'\bduks\b': 'ducks',
        r'\bduk\b': 'duck',
        r'\bdck\b': 'duck',
        r'\bdks\b': 'ducks',
        r'\bdk\b': 'duck',
        r'\bflue\b': 'flu',
        r'\bpreventon\b': 'prevention',
        r'\bbioscurity\b': 'biosecurity',
        r'\bsymptms\b': 'symptoms',
        r'\bsymtoms\b': 'symptoms',
        r'\bsymptom\b': 'symptoms'
    }
    
    for pattern, replacement in abbreviations.items():
        text = re.sub(pattern, replacement, text)
        
    return text

def is_greeting_or_intro(message: str) -> bool:
    """
    Checks if a message is a standard greeting or introduction request.
    Uses normalized message for fuzzy matching.
    """
    norm_msg = normalize_text(message)
    
    patterns = [
        r'^hello\b',
        r'^hi\b',
        r'^hey\b',
        r'^good\s+morning\b',
        r'^good\s+evening\b',
        r'\bhow\s+are\s+you\b',
        r'\btell\s+me\s+about\s+yourself\b',
        r'\bwhat\s+can\s+you\s+do\b',
        r'\bwho\s+created\s+you\b',
        r'\bwho\s+are\s+you\b',
        r'\bwhat\s+is\s+your\s+name\b',
        r'\bintroduce\s+yourself\b'
    ]
    
    for pattern in patterns:
        if re.search(pattern, norm_msg):
            return True
            
    return False

def check_context(message: str) -> bool:
    """
    Guardrail function to ensure the message relates to avian influenza in ducks.
    Returns True if the context is valid, False otherwise.
    Uses normalized message for robust fuzzy matching.
    """
    norm_msg = normalize_text(message)
    
    # If it is a greeting or intro, it's valid context
    if is_greeting_or_intro(message):
        return True
        
    # Direct matched phrases that are 100% valid
    direct_phrases = [
        "bird flu", "avian influenza", "avian flu", "duck disease",
        "duck flu", "egg drop", "egg production"
    ]
    
    has_direct_phrase = any(phrase in norm_msg for phrase in direct_phrases)
    if has_direct_phrase:
        return True
        
    # Duck words & Health words
    duck_words = ["duck", "ducks", "bird", "birds", "poultry"]
    health_words = [
        "avian", "influenza", "flu", "symptom", "disease", "prevent", 
        "biosecurity", "egg", "drop", "decrease", "production", "vet", 
        "health", "sick", "ill", "spread", "transmission", "isolate", 
        "isolation", "quarantine"
    ]
    
    # We allow if there's any mention of duck words or health words (very tolerant)
    has_duck_word = any(word in norm_msg for word in duck_words)
    has_health_word = any(word in norm_msg for word in health_words)
    
    # We can also add negative keywords to catch explicit out-of-context topics quickly
    invalid_keywords = [
        "weather", "joke", "politics", "coding", "code", "python", "javascript",
        "recipe", "cook", "meat", "president", "election", "movie", "song"
    ]
    
    has_invalid_keyword = any(keyword in norm_msg for keyword in invalid_keywords)
    
    if has_invalid_keyword:
        return False
        
    return has_duck_word or has_health_word
