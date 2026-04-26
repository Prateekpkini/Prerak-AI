"""
github_service.py — GitHub REST API Client & Prompt Formatter
=============================================================
Fetches public repos, commit activity, language stats, and profile data
for a given GitHub username, then formats it into a structured prompt
suitable for LLM-based "Recruiter Readiness" evaluation.
"""

import os
import httpx
from typing import Any
from datetime import datetime, timezone

# ─── Constants ────────────────────────────────────────────────────────────────
GITHUB_API = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")

def _headers() -> dict[str, str]:
    """Build auth headers (PAT optional but raises rate limit 60→5000/hr)."""
    h = {"Accept": "application/vnd.github+json"}
    if GITHUB_TOKEN:
        h["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return h


# ─── Data Fetchers ────────────────────────────────────────────────────────────

async def fetch_user_profile(client: httpx.AsyncClient, username: str) -> dict[str, Any]:
    """Fetch core profile: bio, followers, public repo count, created date."""
    resp = await client.get(f"{GITHUB_API}/users/{username}", headers=_headers())
    resp.raise_for_status()
    data = resp.json()
    return {
        "login": data.get("login"),
        "name": data.get("name"),
        "bio": data.get("bio"),
        "avatar_url": data.get("avatar_url"),
        "public_repos": data.get("public_repos", 0),
        "followers": data.get("followers", 0),
        "following": data.get("following", 0),
        "created_at": data.get("created_at"),
        "html_url": data.get("html_url"),
    }


async def fetch_repositories(client: httpx.AsyncClient, username: str, max_repos: int = 30) -> list[dict]:
    """Fetch public repos sorted by most recently updated."""
    resp = await client.get(
        f"{GITHUB_API}/users/{username}/repos",
        headers=_headers(),
        params={"per_page": max_repos, "sort": "updated", "direction": "desc"},
    )
    resp.raise_for_status()
    repos = resp.json()
    
    processed = []
    for r in repos:
        processed.append({
            "name": r.get("name"),
            "full_name": r.get("full_name"),
            "description": r.get("description", ""),
            "language": r.get("language"),
            "stargazers_count": r.get("stargazers_count", 0),
            "forks_count": r.get("forks_count", 0),
            "open_issues_count": r.get("open_issues_count", 0),
            "html_url": r.get("html_url"),
            "fork": r.get("fork", False),
            "created_at": r.get("created_at"),
            "updated_at": r.get("updated_at"),
            "has_wiki": r.get("has_wiki", False),
            "topics": r.get("topics", []),
            "size": r.get("size", 0),
        })
    return processed


async def fetch_commit_activity(client: httpx.AsyncClient, username: str) -> dict[str, Any]:
    """Fetch recent commit events to assess contribution frequency."""
    resp = await client.get(
        f"{GITHUB_API}/users/{username}/events/public",
        headers=_headers(),
        params={"per_page": 100},
    )
    resp.raise_for_status()
    events = resp.json()
    
    push_events = [e for e in events if e.get("type") == "PushEvent"]
    total_commits = sum(len(e.get("payload", {}).get("commits", [])) for e in push_events)
    
    # Unique active days in the last 90 events
    active_dates = set()
    for e in push_events:
        created = e.get("created_at", "")
        if created:
            active_dates.add(created[:10])  # YYYY-MM-DD
    
    # Contribution types breakdown
    event_types: dict[str, int] = {}
    for e in events:
        t = e.get("type", "Unknown")
        event_types[t] = event_types.get(t, 0) + 1
    
    return {
        "recent_push_events": len(push_events),
        "total_recent_commits": total_commits,
        "active_days_count": len(active_dates),
        "event_types_breakdown": event_types,
    }


async def compute_language_stats(client: httpx.AsyncClient, username: str, repos: list[dict]) -> dict[str, int]:
    """Aggregate language byte-counts across repos for top-language analysis."""
    lang_totals: dict[str, int] = {}
    
    # Only check non-fork repos (max 10 to stay within rate limits)
    owned_repos = [r for r in repos if not r.get("fork")][:10]
    
    for repo in owned_repos:
        try:
            resp = await client.get(
                f"{GITHUB_API}/repos/{repo['full_name']}/languages",
                headers=_headers(),
            )
            if resp.status_code == 200:
                for lang, bytes_count in resp.json().items():
                    lang_totals[lang] = lang_totals.get(lang, 0) + bytes_count
        except httpx.HTTPError:
            continue  # Skip repos that error out
    
    return lang_totals


# ─── Master Data Aggregator ──────────────────────────────────────────────────

async def fetch_github_data(username: str) -> dict[str, Any]:
    """
    Orchestrates all GitHub API calls and returns a unified data payload.
    This is the single entry point called by the FastAPI endpoint.
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        profile = await fetch_user_profile(client, username)
        repos = await fetch_repositories(client, username)
        commits = await fetch_commit_activity(client, username)
        languages = await compute_language_stats(client, username, repos)
        
    # Sort languages by usage
    sorted_langs = sorted(languages.items(), key=lambda x: x[1], reverse=True)
    top_languages = [{"language": lang, "bytes": b} for lang, b in sorted_langs[:10]]
    
    # Account age in months
    created = profile.get("created_at", "")
    account_age_months = 0
    if created:
        try:
            created_dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
            delta = datetime.now(timezone.utc) - created_dt
            account_age_months = max(1, delta.days // 30)
        except ValueError:
            account_age_months = 0
    
    return {
        "profile": profile,
        "repositories": repos,
        "commit_activity": commits,
        "top_languages": top_languages,
        "account_age_months": account_age_months,
        "total_stars": sum(r.get("stargazers_count", 0) for r in repos),
        "total_forks": sum(r.get("forks_count", 0) for r in repos),
    }


# ─── Prompt Builder ───────────────────────────────────────────────────────────

def build_evaluation_prompt(github_data: dict[str, Any]) -> str:
    """
    Constructs a detailed prompt for the LLM to evaluate "Recruiter Readiness."
    The prompt includes all fetched data and instructs the model to return
    a strictly-formatted JSON response.
    """
    profile = github_data["profile"]
    repos = github_data["repositories"]
    commits = github_data["commit_activity"]
    languages = github_data["top_languages"]
    
    # Format repo summaries
    repo_summaries = ""
    for i, r in enumerate(repos[:15], 1):
        topics = ", ".join(r.get("topics", [])) or "none"
        repo_summaries += (
            f"  {i}. **{r['name']}** — {r.get('description') or 'No description'}\n"
            f"     Language: {r.get('language') or 'N/A'} | "
            f"Stars: {r['stargazers_count']} | Forks: {r['forks_count']} | "
            f"Topics: {topics} | Fork: {r['fork']}\n"
        )
    
    # Format languages
    lang_list = ", ".join(f"{l['language']} ({l['bytes']:,} bytes)" for l in languages[:8])
    
    prompt = f"""
You are an expert Technical Recruiter and Developer Advocate who evaluates GitHub profiles 
for "Recruiter Readiness" — how impressive and hire-worthy a developer's GitHub presence is.

Analyze the following GitHub profile data and produce a structured evaluation.

═══════════════════════════════════════════════════════════
DEVELOPER PROFILE
═══════════════════════════════════════════════════════════
• Username: {profile['login']}
• Name: {profile.get('name') or 'Not set'}
• Bio: {profile.get('bio') or 'Not set'}
• Public Repos: {profile['public_repos']}
• Followers: {profile['followers']} | Following: {profile['following']}
• Account Age: {github_data['account_age_months']} months
• Total Stars (across repos): {github_data['total_stars']}
• Total Forks (across repos): {github_data['total_forks']}

═══════════════════════════════════════════════════════════
TOP LANGUAGES (by bytes written)
═══════════════════════════════════════════════════════════
{lang_list}

═══════════════════════════════════════════════════════════
RECENT ACTIVITY (last ~90 public events)
═══════════════════════════════════════════════════════════
• Push Events: {commits['recent_push_events']}
• Total Commits in those pushes: {commits['total_recent_commits']}
• Unique Active Days: {commits['active_days_count']}
• Event Breakdown: {commits['event_types_breakdown']}

═══════════════════════════════════════════════════════════
REPOSITORIES (up to 15 most recently updated)
═══════════════════════════════════════════════════════════
{repo_summaries}

═══════════════════════════════════════════════════════════
EVALUATION INSTRUCTIONS
═══════════════════════════════════════════════════════════
Score the developer on a scale of 0-100 for overall "Recruiter Readiness."

Consider these factors:
1. **Code Quality Signals** — Are there descriptions, topics, READMEs implied by repo size?
2. **Project Diversity** — Multiple languages/frameworks or single-stack?
3. **Consistency** — Active days, commit frequency, account age vs output.
4. **Community Engagement** — Stars, forks received, followers.
5. **Professional Polish** — Bio, profile completeness, meaningful project names.

You MUST respond with ONLY a valid JSON object (no markdown fences, no explanation) 
in this exact schema:

{{
    "dev_score": <integer 0-100>,
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "recruiter_first_impression": "<A 2-3 sentence first impression a recruiter would have>",
    "repos_to_improve": [
        {{
            "repo_name": "<name>",
            "feedback": "<specific, actionable feedback for this repo>"
        }}
    ],
    "next_steps": [
        "<actionable tip 1>",
        "<actionable tip 2>",
        "<actionable tip 3>",
        "<actionable tip 4>"
    ]
}}

Provide 3-5 items in repos_to_improve and exactly 4 items in next_steps.
Be specific, constructive, and encouraging in your feedback.
"""
    return prompt.strip()
