CREATE TABLE IF NOT EXISTS stock_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  name TEXT,
  price DECIMAL(10, 2),
  change_pct TEXT,
  summary TEXT NOT NULL,
  sentiment TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_symbol ON stock_analyses(symbol);
CREATE INDEX idx_created_at ON stock_analyses(created_at DESC);
