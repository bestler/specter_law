from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import requests

app = FastAPI()

# Google AI API (Gemini-pro) configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GOOGLE_API_KEY

class ClauseAnalysisRequest(BaseModel):
    text: str

class ClauseSuggestion(BaseModel):
    suggestions: List[str]

@app.post("/analyze-clause", response_model=ClauseSuggestion)
def analyze_clause(request: ClauseAnalysisRequest):
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API key not configured.")
    prompt = f"Analyze the following legal clause and suggest improvements or better alternatives. Return a list of suggestions.\n\nClause: {request.text}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    headers = {"Content-Type": "application/json"}
    params = {"key": GOOGLE_API_KEY}
    try:
        response = requests.post(GOOGLE_API_URL, json=payload, headers=headers, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        # Extract suggestions from the response
        suggestions = []
        candidates = data.get("candidates", [])
        for candidate in candidates:
            parts = candidate.get("content", {}).get("parts", [])
            for part in parts:
                text = part.get("text", "")
                # Split into list if Gemini returns as a single string
                suggestions.extend([s.strip("- ") for s in text.split("\n") if s.strip()])
        if not suggestions:
            raise HTTPException(status_code=502, detail="No suggestions returned from Gemini API.")
        return ClauseSuggestion(suggestions=suggestions)
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Error communicating with Gemini API: {str(e)}")

