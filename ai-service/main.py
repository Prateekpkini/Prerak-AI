"""
main.py — Doot Setu AI Microservice
====================================
FastAPI application that analyzes GitHub profiles and returns
structured "Recruiter Readiness" evaluations via LLM or heuristic scoring.
"""
import os, logging
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from github_service import fetch_github_data, build_evaluation_prompt
from llm_evaluator import evaluate_github_profile

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Doot Setu — GitHub Profile Analyzer",
    description="AI-powered GitHub evaluation for DevRel ambassador onboarding",
    version="1.0.0",
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])

# ── Response Models ────────────────────────────────────────────────────────
class RepoFeedback(BaseModel):
    repo_name: str
    feedback: str

class EvaluationResponse(BaseModel):
    dev_score: int
    strengths: list[str]
    recruiter_first_impression: str
    repos_to_improve: list[RepoFeedback]
    next_steps: list[str]
    evaluation_source: str
    github_profile: dict

# ── Endpoints ──────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"service": "Doot Setu AI Analyzer", "status": "operational", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/analyze-github/{username}", response_model=EvaluationResponse)
async def analyze_github(username: str):
    """
    Fetches GitHub data for the given username, evaluates their profile
    using an LLM (or intelligent mock), and returns a structured assessment.
    """
    try:
        logger.info(f"Analyzing GitHub profile: {username}")
        github_data = await fetch_github_data(username)
        prompt = build_evaluation_prompt(github_data)
        evaluation = await evaluate_github_profile(prompt, github_data)
        evaluation["github_profile"] = github_data["profile"]
        return evaluation
    except Exception as e:
        error_msg = str(e)
        if "404" in error_msg or "Not Found" in error_msg:
            raise HTTPException(status_code=404, detail=f"GitHub user '{username}' not found")
        logger.error(f"Analysis failed for {username}: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {error_msg}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
