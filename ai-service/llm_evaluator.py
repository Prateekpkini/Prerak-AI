"""
llm_evaluator.py — LLM Integration for GitHub Profile Evaluation
"""
import os, json, logging
from typing import Any

logger = logging.getLogger(__name__)

EVALUATION_SCHEMA = {
    "dev_score": int, "strengths": list,
    "recruiter_first_impression": str, "repos_to_improve": list, "next_steps": list,
}

def validate_evaluation(data: dict) -> bool:
    for key, t in EVALUATION_SCHEMA.items():
        if key not in data or not isinstance(data[key], t):
            return False
    return True

async def call_gemini(prompt: str) -> dict[str, Any] | None:
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt, generation_config=genai.types.GenerationConfig(
            temperature=0.7, response_mime_type="application/json"))
        result = json.loads(response.text)
        return result if validate_evaluation(result) else None
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        return None

def generate_mock_evaluation(github_data: dict[str, Any]) -> dict[str, Any]:
    """Context-aware mock evaluation using real GitHub metrics."""
    profile = github_data.get("profile", {})
    repos = github_data.get("repositories", [])
    commits = github_data.get("commit_activity", {})
    languages = github_data.get("top_languages", [])
    total_stars = github_data.get("total_stars", 0)
    total_forks = github_data.get("total_forks", 0)
    account_age = github_data.get("account_age_months", 1)
    username = profile.get("login", "developer")

    # Score calculation
    score = 20
    repo_count = len(repos)
    score += min(15, repo_count * 1.5)
    lang_count = len(languages)
    score += min(10, lang_count * 2.5)
    active_days = commits.get("active_days_count", 0)
    score += min(15, active_days * 1.5)
    score += min(8, total_stars * 0.5)
    score += min(7, total_forks * 1.0)
    if profile.get("bio"): score += 4
    if profile.get("name"): score += 3
    if profile.get("followers", 0) > 5: score += 3
    repos_with_desc = sum(1 for r in repos if r.get("description"))
    repos_with_topics = sum(1 for r in repos if r.get("topics"))
    original_repos = sum(1 for r in repos if not r.get("fork"))
    score += min(5, repos_with_desc * 0.5)
    score += min(5, repos_with_topics * 1.0)
    score += min(5, original_repos * 0.5)
    dev_score = max(10, min(95, int(score)))

    top_lang = languages[0]["language"] if languages else "JavaScript"
    strengths = []
    if lang_count >= 3:
        strengths.append(f"Polyglot developer with experience in {', '.join(l['language'] for l in languages[:3])}")
    elif lang_count > 0:
        strengths.append(f"Strong focus on {top_lang} development")
    if active_days >= 10:
        strengths.append(f"Consistent contributor with {active_days} active days recently")
    if total_stars >= 10:
        strengths.append(f"Projects gained community traction ({total_stars} total stars)")
    if original_repos >= 5:
        strengths.append(f"Strong portfolio of {original_repos} original projects")
    fallbacks = ["Demonstrates initiative by sharing projects publicly",
                 "Active GitHub presence signals continuous learning",
                 "Portfolio shows hands-on experience with real projects"]
    while len(strengths) < 3:
        strengths.append(fallbacks[len(strengths)])
    strengths = strengths[:5]

    if dev_score >= 75:
        impression = f"{username} presents a strong profile with {lang_count} languages and {original_repos} original projects. Consistent activity signals engineering maturity — worth an interview."
    elif dev_score >= 50:
        impression = f"{username} has a solid foundation with {repo_count} repos and visible activity. More polished documentation would help stand out in a competitive pool."
    else:
        impression = f"{username}'s profile is early-stage. Building 2-3 well-documented showcase projects would significantly improve recruiter impressions."

    fb = {"no_desc": "Add a compelling description explaining what this project does.",
          "no_topics": "Add topics/tags to improve discoverability.",
          "no_stars": "Add a detailed README with screenshots and demo link to attract stars.",
          "fork": "Highlight your modifications in the README to show original work."}
    repos_to_improve = []
    for repo in repos[:8]:
        if len(repos_to_improve) >= 5: break
        if not repo.get("description"):
            repos_to_improve.append({"repo_name": repo["name"], "feedback": fb["no_desc"]})
        elif not repo.get("topics"):
            repos_to_improve.append({"repo_name": repo["name"], "feedback": fb["no_topics"]})
        elif repo.get("fork"):
            repos_to_improve.append({"repo_name": repo["name"], "feedback": fb["fork"]})
    while len(repos_to_improve) < 3 and repos:
        r = repos[len(repos_to_improve)]
        if not any(x["repo_name"] == r["name"] for x in repos_to_improve):
            repos_to_improve.append({"repo_name": r["name"], "feedback": "Add a comprehensive README with architecture, setup instructions, and screenshots."})

    next_steps = []
    if not profile.get("bio"): next_steps.append("Add a professional bio with your role, tech focus, and a unique hook.")
    next_steps.extend(["Pin your 6 best repositories to curate a strong first impression.",
                       "Add READMEs with screenshots and architecture diagrams to top projects.",
                       "Contribute to open-source projects to demonstrate collaboration skills.",
                       "Set up GitHub Actions CI/CD to signal engineering maturity."])
    return {"dev_score": dev_score, "strengths": strengths, "recruiter_first_impression": impression,
            "repos_to_improve": repos_to_improve[:5], "next_steps": next_steps[:4]}

async def evaluate_github_profile(prompt: str, github_data: dict[str, Any]) -> dict[str, Any]:
    result = await call_gemini(prompt)
    if result:
        logger.info("Used Gemini LLM for evaluation")
        result["evaluation_source"] = "gemini"
        return result
    logger.info("Using intelligent mock evaluator (set GEMINI_API_KEY for LLM mode)")
    result = generate_mock_evaluation(github_data)
    result["evaluation_source"] = "heuristic"
    return result
