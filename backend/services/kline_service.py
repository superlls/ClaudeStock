import asyncio
import requests
import json

SINA_KLINE_URL = "https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData"

def _fetch_kline_sync(symbol: str, scale: int = 60, datalen: int = 100):
    if symbol.startswith("6") or symbol.startswith("5"):
        sina_symbol = f"sh{symbol}"
    else:
        sina_symbol = f"sz{symbol}"

    headers = {
        "Referer": "https://finance.sina.com.cn/",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36",
    }
    params = {"symbol": sina_symbol, "scale": scale, "ma": "no", "datalen": datalen}

    try:
        resp = requests.get(SINA_KLINE_URL, params=params, headers=headers, timeout=10)
        resp.encoding = "gbk"
        raw = resp.text.strip()
        data = json.loads(raw)
    except Exception as e:
        raise ValueError(f"K线数据获取失败: {str(e)}")

    if not data:
        raise ValueError(f"未找到股票 {symbol} 的K线数据")

    kline = []
    for item in data:
        try:
            kline.append({
                "date": item["day"],
                "open": float(item["open"]),
                "high": float(item["high"]),
                "low": float(item["low"]),
                "close": float(item["close"]),
                "volume": int(item["volume"]),
            })
        except (KeyError, ValueError):
            continue

    return {"symbol": symbol, "kline": kline}

async def get_kline(symbol: str, scale: int = 60, datalen: int = 100):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _fetch_kline_sync, symbol, scale, datalen)
