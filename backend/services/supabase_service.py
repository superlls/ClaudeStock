import os
from supabase import create_client, Client
from models.schemas import StockAnalysis

def get_supabase():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    return create_client(url, key)

async def save_analysis(symbol: str, name: str, price: float, change_pct: str, summary: str, sentiment: str, risk_level: str):
    try:
        supabase = get_supabase()
        response = supabase.table("stock_analyses").insert({
            "symbol": symbol,
            "name": name,
            "price": price,
            "change_pct": change_pct,
            "summary": summary,
            "sentiment": sentiment,
            "risk_level": risk_level
        }).execute()
        return response
    except Exception as e:
        raise ValueError(f"Failed to save analysis: {str(e)}")

async def get_history(limit: int = 10):
    try:
        supabase = get_supabase()
        response = supabase.table("stock_analyses").select("*").order("created_at", desc=True).limit(limit).execute()
        return response.data
    except Exception as e:
        raise ValueError(f"Failed to get history: {str(e)}")
