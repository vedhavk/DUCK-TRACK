# DuckTrack - Avian Influenza Assistant

A full-stack chatbot system integrated into DuckTrack to help farmers detect, prevent, and report Avian Influenza (Bird Flu) in ducks. The chatbot is powered by Google Gemini 3.1 Flash and enforces strict guardrails to only answer queries related to avian influenza and duck health.

## Overview
This system provides:
- A responsive, mobile-friendly chatbot UI for farmers.
- A FastAPI backend endpoint (`/chat`) that acts as a secure proxy.
- Strict context-guardrails preventing off-topic conversations (e.g., weather, politics, non-duck farming).
- Direct AI consultation utilizing Google GenAI for practical, short, and accurate biosecurity advice.

## Installation Steps

### 1. Backend Setup (FastAPI)
The backend is built with FastAPI and requires Python 3.8+.

```bash
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies including Google GenAI SDK
pip install -r requirements.txt
```

#### API Keys & Environment Variables
In the `backend` folder, create a `.env` file and insert your Google Gemini API key securely:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 2. Frontend Setup (Next.js)
The frontend is built with Next.js and Tailwind CSS.

```bash
cd frontend

# Install dependencies
npm install
```

## Running the Application

### Start the FastAPI Backend
```bash
cd backend
uvicorn main:app --reload --port 8000
```
The API will run on `http://127.0.0.1:8000`

### Start the Next.js Frontend
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:3000`

## How to Test the Chatbot

1. Open your browser and navigate to `http://localhost:3000/chatbot`
2. **Test Valid Queries:**
   - *"What are the early symptoms of bird flu in ducks?"*
   - *"Why are my ducks producing fewer eggs?"*
   - *"How does avian influenza spread between ducks?"*
   - *Expected Result:* The AI will provide a helpful, concise veterinary answer.
3. **Test Invalid Queries:**
   - *"What is the weather today?"*
   - *"Tell me a joke"*
   - *"How do I cook duck meat?"*
   - *Expected Result:* The system guardrails will intercept the request and respond immediately with: **"Sorry, this query is out of context."**
