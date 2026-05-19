from fastapi import APIRouter, HTTPException
from models.schemas import StockInfo
from services.stock_service import get_stock_data

router = APIRouter(prefix="/api", tags=["stock"])

@router.get("/stock/{symbol}", response_model=StockInfo)
async def fetch_stock(symbol: str):
    try:
        stock_data = await get_stock_data(symbol)
        return stock_data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
