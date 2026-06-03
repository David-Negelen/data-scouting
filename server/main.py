# Run: uvicorn main:app --reload --reload-exclude 'venv' --port 8000
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import soccerdata as sd
import pandas as pd
import numpy as np

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Understat covers only the top 5 European leagues but uses plain HTTP —
# no browser automation, no CAPTCHA, reliable and fast.
LEAGUES = {
    "premier-league": "ENG-Premier League",
    "bundesliga":     "GER-Bundesliga",
    "laliga":         "ESP-La Liga",
    "serie-a":        "ITA-Serie A",
    "ligue1":         "FRA-Ligue 1",
}

SEASONS = [
    {"id": "2425", "label": "2024/25"},
    {"id": "2324", "label": "2023/24"},
    {"id": "2223", "label": "2022/23"},
    {"id": "2122", "label": "2021/22"},
]


def safe(v):
    if v is None:
        return None
    try:
        if pd.isna(v):
            return None
    except (TypeError, ValueError):
        pass
    if isinstance(v, np.integer):
        return int(v)
    if isinstance(v, np.floating):
        f = float(v)
        return round(f, 3) if not np.isnan(f) else None
    return v


def flatten_cols(df: pd.DataFrame) -> pd.DataFrame:
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [c[-1] if isinstance(c, tuple) else c for c in df.columns]
    return df


def find(df: pd.DataFrame, *names: str) -> str | None:
    for n in names:
        if n in df.columns:
            return n
    return None


def build_player(row: pd.Series, cols: dict) -> dict:
    get = lambda k: safe(row.get(cols[k])) if cols.get(k) else None
    return {
        "name":           get("name"),
        "team":           get("team"),
        "nationality":    get("nation"),
        "position":       get("pos"),
        "matchesPlayed":  get("mp"),
        "minutesPlayed":  get("min"),
        "goals":          get("gls"),
        "assists":        get("ast"),
        "xG":             get("xg"),
        "xA":             get("xag"),
        "yellowCards":    get("crdy"),
        "redCards":       get("crdr"),
        "shots":          get("shots"),
        "keyPasses":      get("keypasses"),
        "npxG":           get("npxg"),
    }


@app.get("/leagues")
def list_leagues():
    return [{"id": k, "label": k} for k in LEAGUES]


@app.get("/seasons")
def list_seasons():
    return SEASONS


@app.get("/players/{league_id}/{season}")
def get_players(league_id: str, season: str):
    league_name = LEAGUES.get(league_id)
    if not league_name:
        raise HTTPException(404, f"Unsupported league '{league_id}'. Supported: {list(LEAGUES.keys())}")
    try:
        us = sd.Understat(league_name, season)
        df = us.read_player_season_stats()
    except Exception as e:
        raise HTTPException(500, str(e))

    df = flatten_cols(df).reset_index()

    cols = {
        "name":      find(df, "player", "Player"),
        "team":      find(df, "team", "Team"),
        "nation":    None,  # Understat doesn't provide nationality
        "pos":       find(df, "position", "pos"),
        "mp":        find(df, "matches", "games", "MP"),
        "min":       find(df, "minutes", "time", "Min"),
        "gls":       find(df, "goals", "Gls"),
        "ast":       find(df, "assists", "Ast"),
        "xg":        find(df, "xg", "xG"),
        "xag":       find(df, "xa", "xA", "xAG"),
        "crdy":      find(df, "yellow_cards", "CrdY"),
        "crdr":      find(df, "red_cards", "CrdR"),
        "shots":     find(df, "shots"),
        "keypasses": find(df, "key_passes"),
        "npxg":      find(df, "np_xg", "npxG"),
    }

    players = [build_player(row, cols) for _, row in df.iterrows()]
    return [p for p in players if p["name"]]
