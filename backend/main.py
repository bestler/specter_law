from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import requests

app = FastAPI()

# CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#TODO: Set up your Google API key in the environment variable GOOGLE_API_KEY
# Google AI API (Gemini-pro) configuration
#GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

GOOGLE_API_KEY = "AIzaSyBmUN4kV-2mA4oJq-AEBD4So7bSgpimNwU"

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

@app.post("/analyze_changes", response_model=AnalyzeChangesResponse)
def analyze_changes(request: AnalyzeChangesRequest):
    print(request)
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API key not configured.")
    prompt = f"""You are a document analysis agent.\n\nYour task is:\n- Analyze a given paragraph and an associated changelog.\n- Reconstruct the full original and modified paragraph texts based on the changelog.\n- Summarize all meaningful changes at a higher level (not per single word, but per logical unit like party name, date, address, etc.).\n- Output the result in standardized JSON format as specified below.\n\nInput Format:\n{{\n    \"paragraph\": \"{request.paragraph}\",\n    \"changelog\": {request.changelog}\n}}\n\nInstructions:\n- Assume that \"Added\" items were inserted into the paragraph.\n- \"Deleted\" items were removed, but the paragraph you are given is after the changes, so you may need to infer where the deletions occurred.\n- \"Formatted\" means formatting changes only (do not treat formatting-only changes as affecting the paragraph content).\n- Try to reconstruct the original paragraph before any changes as best as possible.\n- Group related changes logically (e.g., adding a party name and address together is one grouped change).\n- Summarize each change in a short human-readable description.\n- Ignore purely formatting changes (they are not material).\n\nOutput Format:\n{{\n    \"paragraph_id\": \"[optional id if available]\",\n    \"original_text\": \"[the original paragraph, that was provided to you]\",\n    \"modified_text\": \"[paragraph text after you apply your recognized changes]\",\n    \"changes\": [\n        {{\n            \"type\": \"Insertion | Deletion | Modification\",\n            \"description\": \"[short description of what changed, in one sentence]\"\n        }},\n        ...\n    ]\n}}\n\nImportant:\n- Do not hallucinate content.\n- Be faithful to the given inputs.\n- Be concise but complete.\n- Output valid JSON only, no explanations outside the JSON.\n"""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    headers = {"Content-Type": "application/json"}
    params = {"key": GOOGLE_API_KEY}
    try:
        response = requests.post(GOOGLE_API_URL_BASE, json=payload, headers=headers, params=params, timeout=60)
        response.raise_for_status()
        data = response.json()
        print(data)
        # Extract the JSON output from Gemini's response
        import re
        import json as pyjson
        candidates = data.get("candidates", [])
        for candidate in candidates:
            parts = candidate.get("content", {}).get("parts", [])
            for part in parts:
                text = part.get("text", "")
                # Use regex to extract the first JSON object from the text
                match = re.search(r'{[\s\S]*}', text)
                if match:
                    json_str = match.group(0)
                    try:
                        result = pyjson.loads(json_str)
                        return AnalyzeChangesResponse(**result)
                    except Exception as e:
                        print(f"JSON parsing error: {e}\nRaw text: {json_str}")
                        continue
        raise HTTPException(status_code=502, detail="No valid JSON returned from Gemini API.")
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Error communicating with Gemini API: {str(e)}")

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

