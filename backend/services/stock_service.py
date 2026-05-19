import asyncio
import requests
from models.schemas import StockInfo

SINA_URL = "https://hq.sinajs.cn/list="

def _parse_sina(symbol: str, raw: str) -> StockInfo:
    """
    新浪行情格式：股票名,昨收,今开,当前价,最高,最低,买一,卖一,成交量,成交额,
    买一量,买一价,...,日期,时间,状态
    """
    try:
        content = raw.split('"')[1]
    except IndexError:
        raise ValueError(f"未找到股票代码 {symbol}，请检查是否正确")

    if not content or content == "无":
        raise ValueError(f"未找到股票代码 {symbol}，请检查是否正确")

    parts = content.split(",")
    if len(parts) < 10:
        raise ValueError(f"股票 {symbol} 数据格式异常")

    name = parts[0]
    yesterday_close = float(parts[2]) if parts[2] else 0
    current_price = float(parts[3]) if parts[3] else 0
    volume = parts[8]  # 成交量（手）
    market_cap = ""

    if yesterday_close and current_price:
        change_pct = round((current_price - yesterday_close) / yesterday_close * 100, 2)
    else:
        change_pct = 0.0

    return StockInfo(
        symbol=symbol,
        name=name,
        price=current_price,
        change_pct=str(change_pct),
        volume=volume,
        market_cap=market_cap
    )

def _fetch_stock_sync(symbol: str) -> StockInfo:
    if symbol.startswith("6") or symbol.startswith("5"):
        sina_code = f"sh{symbol}"
    else:
        sina_code = f"sz{symbol}"

    headers = {
        "Referer": "https://finance.sina.com.cn/",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36",
    }

    try:
        resp = requests.get(f"{SINA_URL}{sina_code}", headers=headers, timeout=10)
        resp.encoding = "gbk"
        raw = resp.text.strip()
    except Exception as e:
        raise ValueError(f"网络请求失败: {str(e)}")

    return _parse_sina(symbol, raw)

async def get_stock_data(symbol: str) -> StockInfo:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _fetch_stock_sync, symbol)
