from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StockInfo(BaseModel):
    symbol: str
    name: str
    price: float
    change_pct: str
    volume: str
    market_cap: Optional[str] = None

class AnalysisRequest(BaseModel):
    symbol: str
    name: str
    price: float
    change_pct: str

class AnalysisResponse(BaseModel):
    summary: str
    sentiment: str
    risk_level: str

class StockAnalysis(BaseModel):
    id: Optional[str] = None
    symbol: str
    name: Optional[str] = None
    price: float
    change_pct: str
    summary: str
    sentiment: str
    risk_level: str
    created_at: Optional[datetime] = None

class HistoryResponse(BaseModel):
    data: list[StockAnalysis]
    count: int
