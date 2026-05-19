import akshare as ak
from models.schemas import StockInfo

async def get_stock_data(symbol: str) -> StockInfo:
    try:
        df = ak.stock_zh_a_spot_em()
        stock = df[df['代码'] == symbol]

        if stock.empty:
            raise ValueError(f"Stock {symbol} not found")

        row = stock.iloc[0]
        return StockInfo(
            symbol=symbol,
            name=row['名称'],
            price=float(row['最新价']),
            change_pct=row['涨跌幅'],
            volume=row['成交量'],
            market_cap=row.get('总市值', None)
        )
    except Exception as e:
        raise ValueError(f"Failed to fetch stock data: {str(e)}")
