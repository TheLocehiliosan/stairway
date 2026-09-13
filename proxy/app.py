"""Scoreboard CORS proxy for Stairway to Ascension."""

import os
import re
from typing import Annotated

import httpx
from fastapi import FastAPI, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, Response

SCOREBOARD_BASE = os.getenv("SCOREBOARD_BASE", "https://nethackscoreboard.org").rstrip("/")
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "https://stairway.locehilios.com,http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]
FETCH_TIMEOUT = float(os.getenv("FETCH_TIMEOUT", "20"))
USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9_-]+$")

app = FastAPI(title="Stairway Proxy", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "HEAD", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,
)


def validate_username(username: str, letter: str) -> None:
    if not username or username[0] != letter:
        raise HTTPException(status_code=400, detail="Username and path letter do not match")
    if not USERNAME_PATTERN.fullmatch(username):
        raise HTTPException(status_code=400, detail="Invalid username format")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "service": "stairway-proxy",
        "usage": "/players/{letter}/{username}.nh.html",
    }


@app.get("/players/{letter}/{username}.nh.html")
async def proxy_player(
    letter: Annotated[str, Path(min_length=1, max_length=1, pattern=r"^[A-Za-z0-9]$")],
    username: Annotated[str, Path(min_length=1, max_length=64)],
) -> Response:
    validate_username(username, letter)

    target_url = f"{SCOREBOARD_BASE}/players/{letter}/{username}.nh.html"

    try:
        async with httpx.AsyncClient(timeout=FETCH_TIMEOUT, follow_redirects=True) as client:
            upstream = await client.get(target_url, headers={"User-Agent": "StairwayProxy/1.0"})
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Scoreboard request timed out") from None
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Could not reach scoreboard") from exc

    if upstream.status_code == 404:
        raise HTTPException(status_code=404, detail=f'Player "{username}" not found')

    if upstream.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Scoreboard returned HTTP {upstream.status_code}")

    content = upstream.text
    if "Overall Stats" not in content:
        raise HTTPException(status_code=502, detail="Unexpected scoreboard response")

    return PlainTextResponse(
        content=content,
        media_type="text/html; charset=utf-8",
        headers={"Cache-Control": "public, max-age=300"},
    )
