const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchStock(symbol) {
  const res = await fetch(`${API_BASE}/api/stock/${symbol}`);
  if (!res.ok) throw new Error("Stock not found");
  return res.json();
}

export async function analyzeStock(symbol, name, price, changePct) {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol, name, price, change_pct: changePct })
  });
  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}

export async function fetchHistory(limit = 10) {
  const res = await fetch(`${API_BASE}/api/history?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}
