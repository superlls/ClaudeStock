# ClaudeStock · AI 股票分析面板

> 使用 AI 工具（Claude Code）构建的全栈应用，调用 Kimi LLM 分析 A 股数据。

![Tech Stack](https://img.shields.io/badge/FastAPI-0d1117?style=flat&logo=fastapi)
![React](https://img.shields.io/badge/React-0d1117?style=flat&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-0d1117?style=flat&logo=supabase)
![Render](https://img.shields.io/badge/Render-0d1117?style=flat&logo=render)

---

## 在线访问

| 服务 | 地址 |
|------|------|
| 前端 | https://claudestock-ui.onrender.com |
| 后端 API | https://claudestock.onrender.com |
| API 文档 | https://claudestock.onrender.com/docs |

> ⚠️ 使用 Render 免费实例，首次访问冷启动约 50 秒，请耐心等待。

---

## 功能

- **实时行情**：输入 6 位 A 股代码，获取当前价格、涨跌幅、成交量
- **K 线图**：ECharts 蜡烛图，支持 60min / 日K / 周K 切换，含 MA5/MA10/MA20 均线
- **AI 分析**：点击按钮调用 Kimi API，返回结构化 JSON（情绪判断 + 风险等级 + 分析摘要）
- **历史记录**：每次分析结果存入 Supabase，展示最近 20 条

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 前端 | React + Vite + ECharts 5 + Tailwind CSS |
| 后端 | FastAPI (Python) + uvicorn |
| 股票数据 | 新浪财经非官方接口 |
| LLM | Kimi API (moonshot-v1-8k) |
| 数据库 | Supabase (PostgreSQL) |
| 部署 | Render.com（GitHub 自动部署）|

---

## 本地运行

### 前提

- Python 3.9+
- Node.js 18+
- Kimi API Key（[platform.moonshot.cn](https://platform.moonshot.cn)）
- Supabase 项目（[supabase.com](https://supabase.com)）

### 1. 克隆仓库

```bash
git clone https://github.com/superlls/ClaudeStock.git
cd ClaudeStock
```

### 2. 初始化数据库

在 Supabase SQL Editor 执行 `supabase_init.sql`：

```sql
CREATE TABLE stock_analyses (
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
ALTER TABLE stock_analyses DISABLE ROW LEVEL SECURITY;
```

### 3. 启动后端

```bash
cd backend
cp .env.example .env   # 填入 API keys
pip install -r requirements.txt
uvicorn main:app --reload
# 运行在 http://localhost:8000
```

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
# 运行在 http://localhost:5173
```

---

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/stock/{symbol}` | 获取实时行情 |
| GET | `/api/kline/{symbol}` | 获取 K 线历史数据 |
| POST | `/api/analyze` | Kimi AI 分析（存入 Supabase）|
| GET | `/api/history` | 获取历史分析记录 |

完整文档：`https://claudestock.onrender.com/docs`

---

## Prompt 设计：如何强制 LLM 只返回 JSON

本项目要求 Kimi 返回严格 JSON，采用**双重锁定**方案：

**第一层 — System Prompt 明确约束**

```python
SYSTEM_PROMPT = """你是一位专业的A股分析师。
你必须且只能返回合法的JSON格式，不得包含任何其他文字、markdown代码块或解释。
返回格式（严格遵守字段名）：
{"summary": "2-3句话的分析总结", "sentiment": "Bullish|Neutral|Bearish", "risk_level": "Low|Medium|High"}
禁止在JSON之外输出任何内容。"""
```

**第二层 — API 参数强制**

```python
response = client.chat.completions.create(
    model="moonshot-v1-8k",
    response_format={"type": "json_object"},   # ← 从模型层锁死输出格式
    messages=[
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": prompt}
    ]
)
result = json.loads(response.choices[0].message.content)  # 验证合法性
```

`response_format: json_object` 在 API 层强制执行，即使 prompt 控制失效也不会输出非 JSON 内容。

---

## Debug 记录：CORS 问题排查

**场景**：前端部署到 Render Static Site 后，调用后端 API 报跨域错误。

**报错**
```
Access to fetch at 'https://claudestock.onrender.com/api/stock/600519'
from origin 'https://claudestock-ui.onrender.com' has been blocked by CORS policy
```

**原因**：FastAPI 默认不允许跨域请求，前后端在不同域名下必须显式配置 CORS。

**定位过程**：浏览器 DevTools → Network 面板 → 看到 OPTIONS 预检请求返回 403，确认是后端没有响应 CORS 头。

**修复**：在 `main.py` 加 `CORSMiddleware`：

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # 生产环境建议指定具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**验证**：重新部署后 OPTIONS 预检请求返回 200，前端正常调用。

---

## 项目结构

```
ClaudeStock/
├── backend/
│   ├── main.py              # FastAPI 入口 + CORS
│   ├── requirements.txt
│   ├── models/schemas.py    # Pydantic 数据模型
│   ├── routers/             # stock / analysis / kline
│   └── services/            # 新浪财经 / Kimi / Supabase
├── frontend/
│   ├── index.html           # ECharts + Tailwind CDN
│   └── src/
│       ├── App.jsx
│       ├── api/client.js
│       └── components/
│           ├── KlineChart.jsx
│           ├── StockHeader.jsx
│           ├── AIPanel.jsx
│           └── HistoryTable.jsx
├── supabase_init.sql
└── CLAUDE.md                # AI 上下文文档
```

---

## License

MIT
