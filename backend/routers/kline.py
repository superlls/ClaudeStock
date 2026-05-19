from fastapi import APIRouter, HTTPException
from services.kline_service import get_kline

router = APIRouter(prefix="/api", tags=["kline"])

@router.get("/kline/{symbol}")
async def fetch_kline(symbol: str, scale: int = 60, datalen: int = 100):
    try:
        return await get_kline(symbol, scale, datalen)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
