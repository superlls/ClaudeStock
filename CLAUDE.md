# ClaudeStock — 项目文档

> 本文件供 AI 助手快速恢复上下文，每次重要改动后更新。

---

## 项目概述

AI 股票分析面板（面试题）。用户输入 A 股代码 → 拉取实时行情 + K 线数据 → Kimi AI 返回结构化 JSON 分析 → 存储 Supabase → 展示金融终端风格 UI。

**线上地址**
- 后端 API：`https://claudestock.onrender.com`
- 前端：Render Static Site（同仓库自动部署）
- GitHub：`https://github.com/superlls/ClaudeStock`

---

## 技术栈

| 层次 | 技术 | 说明 |
|------|------|------|
| 前端 | React + Vite | 无 TypeScript |
| 样式 | Tailwind CSS CDN + CSS Variables | PostCSS 方案有版本冲突，改用 CDN |
| 图表 | ECharts 5（CDN） | K 线 + MA 均线 + 成交量 |
| 字体 | JetBrains Mono + Noto Sans SC | Google Fonts CDN |
| 后端 | FastAPI (Python 3.9) | uvicorn 启动 |
| 股票数据 | 新浪财经接口（非官方） | AKShare 被 Clash 代理拦截，改用新浪 |
| K 线数据 | 新浪财经 `CN_MarketData.getKLineData` | 支持 60min/日K/周K |
| LLM | Kimi API (moonshot-v1-8k) | OpenAI SDK 兼容格式 |
| 数据库 | Supabase (PostgreSQL) | 已关闭 RLS |
| 部署 | Render.com | 后端 Web Service + 前端 Static Site |
| CI/CD | GitHub push → Render 自动部署 | 无需手动操作 |

---

## 架构总览

```
浏览器 (React)
    │
    ├── GET  /api/stock/{symbol}      ← 新浪实时行情
    ├── GET  /api/kline/{symbol}      ← 新浪K线历史
    ├── POST /api/analyze             ← Kimi AI 分析
    └── GET  /api/history             ← Supabase 历史记录
              │
         FastAPI (Render)
              │
    ┌─────────┼──────────┐
    │         │          │
  新浪财经   Kimi API   Supabase
  (A股数据) (moonshot) (PostgreSQL)
```

---

## 目录结构

```
ClaudeStock/
├── CLAUDE.md                   # 本文件（AI 上下文）
├── README.md
├── supabase_init.sql            # 建表 SQL
├── backend/
│   ├── main.py                  # FastAPI 入口 + CORS
│   ├── .env                     # 本地环境变量（不提交）
│   ├── .env.example
│   ├── requirements.txt
│   ├── models/
│   │   └── schemas.py           # Pydantic 数据模型
│   ├── routers/
│   │   ├── stock.py             # GET /api/stock/{symbol}
│   │   ├── analysis.py          # POST /api/analyze, GET /api/history
│   │   └── kline.py             # GET /api/kline/{symbol}
│   └── services/
│       ├── stock_service.py     # 新浪财经实时行情
│       ├── kline_service.py     # 新浪财经K线数据
│       ├── llm_service.py       # Kimi API 调用
│       └── supabase_service.py  # 数据库读写
└── frontend/
    ├── index.html               # Tailwind CDN + ECharts CDN + Google Fonts
    ├── .env                     # VITE_API_URL=http://localhost:8000
    ├── .env.production          # VITE_API_URL=https://claudestock.onrender.com
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── index.css            # CSS Variables + 全局动画
        ├── App.jsx              # 主布局（顶栏 + K线 + AI面板 + 历史）
        ├── api/
        │   └── client.js        # fetch 封装
        └── components/
            ├── KlineChart.jsx   # ECharts 蜡烛图 + MA + 成交量
            ├── StockHeader.jsx  # 股票名/价格/涨跌幅展示
            ├── AIPanel.jsx      # Kimi 分析面板
            └── HistoryTable.jsx # 历史记录表格
```

---

## API 接口文档

### GET `/api/stock/{symbol}`
获取 A 股实时行情（新浪财经）

**参数**
| 名称 | 位置 | 类型 | 说明 |
|------|------|------|------|
| symbol | path | string | 6位股票代码，如 `000001` |

**响应 200**
```json
{
  "symbol": "600519",
  "name": "贵州茅台",
  "price": 1324.30,
  "change_pct": "0.1",
  "volume": "4325464",
  "market_cap": "166538"
}
```

---

### GET `/api/kline/{symbol}`
获取 K 线历史数据（新浪财经）

**参数**
| 名称 | 位置 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| symbol | path | string | — | 6位股票代码 |
| scale | query | int | 60 | K线周期：60=60分钟，240=日K，1200=周K |
| datalen | query | int | 100 | 返回根数（最大约200） |

**响应 200**
```json
{
  "symbol": "600519",
  "kline": [
    {
      "date": "2026-05-19 14:00:00",
      "open": 1321.0,
      "high": 1328.5,
      "low": 1319.0,
      "close": 1324.3,
      "volume": 4325464
    }
  ]
}
```

---

### POST `/api/analyze`
调用 Kimi AI 分析股票，结果存入 Supabase

**请求体**
```json
{
  "symbol": "600519",
  "name": "贵州茅台",
  "price": 1324.30,
  "change_pct": "0.1"
}
```

**响应 200**
```json
{
  "summary": "贵州茅台作为A股龙头企业...",
  "sentiment": "Bullish",
  "risk_level": "Low"
}
```

**说明**
- `sentiment` 枚举：`Bullish` / `Neutral` / `Bearish`
- `risk_level` 枚举：`Low` / `Medium` / `High`
- System Prompt 强制 JSON 输出 + `response_format: json_object` 双重保障

---

### GET `/api/history`
从 Supabase 获取历史分析记录

**参数**
| 名称 | 位置 | 类型 | 默认值 |
|------|------|------|--------|
| limit | query | int | 10 |

**响应 200**
```json
{
  "data": [
    {
      "id": "uuid",
      "symbol": "600519",
      "name": "贵州茅台",
      "price": 1324.30,
      "change_pct": "0.1",
      "summary": "...",
      "sentiment": "Bullish",
      "risk_level": "Low",
      "created_at": "2026-05-19T16:52:33+00:00"
    }
  ],
  "count": 1
}
```

---

## 数据库表结构

```sql
-- Supabase / PostgreSQL
CREATE TABLE stock_analyses (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol      TEXT    NOT NULL,
  name        TEXT,
  price       DECIMAL(10, 2),
  change_pct  TEXT,
  summary     TEXT    NOT NULL,
  sentiment   TEXT    NOT NULL,   -- Bullish / Neutral / Bearish
  risk_level  TEXT    NOT NULL,   -- Low / Medium / High
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_symbol ON stock_analyses(symbol);
CREATE INDEX idx_created_at ON stock_analyses(created_at DESC);

-- RLS 已关闭（面试项目）
ALTER TABLE stock_analyses DISABLE ROW LEVEL SECURITY;
```

---

## 前端页面结构

```
App.jsx
├── <header>  顶部导航栏
│   ├── Logo「◈ CLAUDESTOCK」
│   ├── 搜索框（6位数字输入 + QUERY按钮）
│   ├── 快捷股票按钮（600519 / 000001 / 300750 / 000858 / 600036）
│   └── LIVE 状态指示灯
│
├── <main>
│   ├── 错误提示条（条件渲染）
│   ├── StockHeader.jsx   股票名 + 价格 + 涨跌幅 + 成交量 + 市值
│   ├── 两列布局
│   │   ├── 左：K线图面板
│   │   │   ├── 周期切换（60min / 日K / 周K）
│   │   │   └── KlineChart.jsx（ECharts 蜡烛图 + MA5/10/20 + 成交量柱）
│   │   └── 右：AIPanel.jsx（260px 固定宽）
│   │       ├── 情绪标签 + 风险标签
│   │       ├── 分析摘要文本
│   │       └── [ KIMI ANALYZE ] 按钮
│   └── HistoryTable.jsx  历史分析记录（最近20条）
│
└── <footer>  数据来源声明
```

---

## 环境变量

### 后端 (`backend/.env`)
```
KIMI_API_KEY=sk-1a40414e...
SUPABASE_URL=https://ckbsvldusrsmesrnfbzr.supabase.co
SUPABASE_KEY=sb_publishable__hbp46cnk0c...
```

### 前端
```
# .env（本地开发）
VITE_API_URL=http://localhost:8000

# .env.production（生产）
VITE_API_URL=https://claudestock.onrender.com
```

### Render 后端环境变量（需在控制台手动配置）
- `KIMI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_KEY`

---

## 已知问题 & 注意事项

| 问题 | 说明 |
|------|------|
| 新浪数据有延迟 | 非官方接口，盘后/休市时数据不更新 |
| Render 冷启动 | 免费实例闲置后首次请求等待 ~50s |
| Clash 代理 | 本地开发时新浪接口需系统代理走直连（规则模式） |
| Supabase Key 权限 | 用的 publishable key，已关闭 RLS |

---

## 变更日志

### v3.1 — 2026-05-19（当前）
**PDF 报告导出**
- 新增 `frontend/src/utils/exportPdf.js`：使用 jsPDF 生成暗色金融终端风格 PDF
- AIPanel 分析完成后出现"↓ 导出 PDF 报告"按钮
- PDF 内容：股票名/代码/价格/涨跌、情绪/风险标签、AI 摘要、时间戳、免责声明

### v3.0 — 2026-05-19
**金融终端 UI 重设计**
- 全新暗色主题（`#070a10` 背景）
- 新增 `GET /api/kline/{symbol}` 接口（新浪历史K线）
- 新增 `KlineChart.jsx`：ECharts 蜡烛图 + MA5/MA10/MA20 均线 + 成交量柱
- 新增 `StockHeader.jsx`：价格/涨跌幅 终端风格展示
- 新增 `AIPanel.jsx`：右侧分析面板，情绪/风险标签
- K 线周期切换（60min / 日K / 周K）
- 顶部快捷股票按钮
- JetBrains Mono 数字字体
- 红涨绿跌（A 股惯例）

### v2.0 — 2026-05-19
**功能完整版上线**
- 修复 Supabase RLS 写入拒绝（关闭 RLS）
- 修复 AKShare 被 Clash 拦截 → 改用新浪财经接口
- 修复 Kimi/Supabase 客户端模块级初始化失败 → 改为懒加载
- 修复 Tailwind PostCSS v4 兼容问题 → 改用 CDN
- 部署后端到 Render Web Service
- 部署前端到 Render Static Site

### v1.0 — 2026-05-19
**项目初始化**
- FastAPI 后端架构搭建（路由 / 服务 / 模型分层）
- React + Vite 前端初始化
- Supabase 数据库表创建
- GitHub 仓库初始化，Render 自动部署配置
