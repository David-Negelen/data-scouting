# Run: uvicorn main:app --reload --port 8000
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

FBREF_LEAGUES = {
    "premier-league":   "ENG-Premier League",
    "championship":     "ENG-Championship",
    "bundesliga":       "GER-Bundesliga",
    "bundesliga2":      "GER-2. Bundesliga",
    "laliga":           "ESP-La Liga",
    "laliga2":          "ESP-Segunda División",
    "serie-a":          "ITA-Serie A",
    "serie-b":          "ITA-Serie B",
    "ligue1":           "FRA-Ligue 1",
    "ligue2":           "FRA-Ligue 2",
    "eredivisie":       "NED-Eredivisie",
    "primeira-liga":    "POR-Primeira Liga",
    "pro-league":       "BEL-First Division A",
    "super-lig":        "TUR-Süper Lig",
    "champions-league": "INT-Champions League",
    "europa-league":    "INT-Europa League",
    "mls":              "USA-MLS",
}

SEASONS = [
    {"id": "2425", "label": "2024/25"},
    {"id": "2324", "label": "2023/24"},
    {"id": "2223", "label": "2022/23"},
    {"id": "2122", "label": "2021/22"},
    {"id": "2024", "label": "2024 (MLS/calendar)"},
    {"id": "2023", "label": "2023 (MLS/calendar)"},
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
    """Collapse MultiIndex columns to their last (most specific) level."""
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
        "name":          get("name"),
        "team":          get("team"),
        "nationality":   get("nation"),
        "position":      get("pos"),
        "age":           get("age"),
        "matchesPlayed": get("mp"),
        "minutesPlayed": get("min"),
        "goals":         get("gls"),
        "assists":       get("ast"),
        "xG":            get("xg"),
        "xA":            get("xag"),
        "yellowCards":   get("crdy"),
        "redCards":      get("crdr"),
        "npxG":          get("npxg"),
        "progressiveCarries":  get("prgc"),
        "progressivePasses":   get("prgp"),
    }


@app.get("/leagues")
def list_leagues():
    return [{"id": k, "fbref": v} for k, v in FBREF_LEAGUES.items()]


@app.get("/seasons")
def list_seasons():
    return SEASONS


@app.get("/players/{league_id}/{season}")
def get_players(league_id: str, season: str):
    fbref_name = FBREF_LEAGUES.get(league_id)
    if not fbref_name:
        raise HTTPException(404, f"Unknown league: {league_id}")
    try:
        fbref = sd.FBref(fbref_name, season)
        df = fbref.read_player_season_stats(stat_type="standard")
    except Exception as e:
        raise HTTPException(500, str(e))

    df = flatten_cols(df).reset_index()

    cols = {
        "name":  find(df, "player", "Player"),
        "team":  find(df, "team", "Team", "Squad"),
        "nation": find(df, "nation", "Nation"),
        "pos":   find(df, "pos", "Pos"),
        "age":   find(df, "age", "Age"),
        "mp":    find(df, "MP"),
        "min":   find(df, "Min"),
        "gls":   find(df, "Gls"),
        "ast":   find(df, "Ast"),
        "xg":    find(df, "xG"),
        "xag":   find(df, "xAG"),
        "crdy":  find(df, "CrdY"),
        "crdr":  find(df, "CrdR"),
        "npxg":  find(df, "npxG"),
        "prgc":  find(df, "PrgC"),
        "prgp":  find(df, "PrgP"),
    }

    players = [build_player(row, cols) for _, row in df.iterrows()]
    return [p for p in players if p["name"]]
