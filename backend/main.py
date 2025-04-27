from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import requests
from clause_analysis import analyze_clause_change, analyze_clause_change_for_changes_response, ClauseAnalysisResponse

app = FastAPI()

# CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Google AI API (Gemini-pro) configuration

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_API_URL_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent"

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
        response = requests.post(GOOGLE_API_URL_BASE, json=payload, headers=headers, params=params, timeout=30)
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

class ChangeLogItem(BaseModel):
    type: str
    text: str
    author: str

class AnalyzeChangesRequest(BaseModel):
    paragraph: str
    changelog: List[ChangeLogItem]
    # Optionally allow paragraph_id for output
    paragraph_id: Optional[str] = None

class ChangeSummary(BaseModel):
    type: str
    description: str

class AnalyzeChangesResponse(BaseModel):
    paragraph_id: Optional[str] = None
    original_text: str
    modified_text: str
    changes: List[ChangeSummary]

@app.post("/analyze_changes", response_model=ClauseAnalysisResponse)
def analyze_changes(request: AnalyzeChangesRequest):
    change_json = {
        "paragraph_id": request.paragraph_id,
        "original_text": request.paragraph,  # For now, use the input as both original and modified
        "modified_text": request.paragraph,  # In real use, this would be the modified text
        "changes": [{"type": c.type, "description": c.text} for c in request.changelog]
    }
    try:
        result = analyze_clause_change_for_changes_response(change_json)
        return result
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error in clause analysis: {str(e)}")

class AnalyzeChangesBatchItem(BaseModel):
    paragraphIndex: int
    paragraph: str
    changelog: List[ChangeLogItem]

class AnalyzeChangesBatchRequest(BaseModel):
    items: List[AnalyzeChangesBatchItem]

class AnalyzeChangesBatchResponse(BaseModel):
    results: List[AnalyzeChangesResponse]

@app.post("/analyze_changes_batch", response_model=AnalyzeChangesBatchResponse)
def analyze_changes_batch(request: AnalyzeChangesBatchRequest):
    results = {}
    for item in request.items:
        try:
            single_result = analyze_changes(
                AnalyzeChangesRequest(paragraph=item.paragraph, changelog=item.changelog)
            )
            # Attach paragraphIndex for client reference
            if hasattr(single_result, 'dict'):
                result_dict = single_result.dict()
            else:
                result_dict = dict(single_result)
            result_dict["paragraphIndex"] = item.paragraphIndex
            results[item.paragraphIndex] = result_dict
        except Exception as e:
            results[item.paragraphIndex] = {
                "paragraphIndex": item.paragraphIndex,
                "error": str(e)
            }
    return {"results": results}

@app.post("/analyze_clause_changes", response_model=ClauseAnalysisResponse)
def analyze_clause_changes(request: AnalyzeChangesRequest):
    change_json = {
        "paragraph_id": request.paragraph_id,
        "original_text": request.paragraph,  # For now, use the input as both original and modified
        "modified_text": request.paragraph,  # In real use, this would be the modified text
        "changes": [{"type": c.type, "description": c.text} for c in request.changelog]
    }
    try:
        result = analyze_clause_change_for_changes_response(change_json)
        return result
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error in clause analysis: {str(e)}")

