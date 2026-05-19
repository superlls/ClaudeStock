from fastapi import APIRouter, HTTPException
from models.schemas import AnalysisRequest, AnalysisResponse, StockAnalysis, HistoryResponse
from services.llm_service import analyze_stock
from services.supabase_service import save_analysis, get_history

router = APIRouter(prefix="/api", tags=["analysis"])

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    try:
        analysis = await analyze_stock(request)
        await save_analysis(
            symbol=request.symbol,
            name=request.name,
            price=request.price,
            change_pct=request.change_pct,
            summary=analysis.summary,
            sentiment=analysis.sentiment,
            risk_level=analysis.risk_level
        )
        return analysis
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=HistoryResponse)
async def fetch_history(limit: int = 10):
    try:
        data = await get_history(limit)
        return HistoryResponse(data=data, count=len(data))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
