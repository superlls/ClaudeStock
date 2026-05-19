const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchStock(symbol) {
  const res = await fetch(`${API_BASE}/api/stock/${symbol}`);
  if (!res.ok) throw new Error("股票代码不存在");
  return res.json();
}

export async function fetchKline(symbol, scale = 60, datalen = 120) {
  const res = await fetch(`${API_BASE}/api/kline/${symbol}?scale=${scale}&datalen=${datalen}`);
  if (!res.ok) throw new Error("K线数据获取失败");
  return res.json();
}

export async function analyzeStock(symbol, name, price, changePct) {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol, name, price, change_pct: changePct })
  });
  if (!res.ok) throw new Error("AI分析失败");
  return res.json();
}

export async function fetchHistory(limit = 20) {
  const res = await fetch(`${API_BASE}/api/history?limit=${limit}`);
  if (!res.ok) throw new Error("获取历史失败");
  return res.json();
}
