import { useState } from 'react'
import { analyzeStock } from '../api/client'
import { exportAnalysisPDF } from '../utils/exportPdf'

const SENTIMENT = {
  Bullish: { label: '看多', color: 'var(--up)',   bg: 'var(--up-dim)',   icon: '▲' },
  Bearish: { label: '看空', color: 'var(--down)', bg: 'var(--down-dim)', icon: '▼' },
  Neutral: { label: '中性', color: '#e8b84b',     bg: 'rgba(232,184,75,0.1)', icon: '◆' },
}

const RISK = {
  Low:    { label: '低风险', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  Medium: { label: '中风险', color: '#e8b84b', bg: 'rgba(232,184,75,0.1)' },
  High:   { label: '高风险', color: 'var(--up)', bg: 'var(--up-dim)' },
}

export default function AIPanel({ stock, onDone }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')

  const handleAnalyze = async () => {
    if (!stock || loading) return
    setLoading(true); setError('')
    try {
      const r = await analyzeStock(stock.symbol, stock.name, stock.price, stock.change_pct)
      setResult(r)
      onDone?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const s = result ? (SENTIMENT[result.sentiment] || SENTIMENT.Neutral) : null
  const r = result ? (RISK[result.risk_level]     || RISK.Medium)       : null

  return (
    <div style={{
      background: 'var(--panel)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* header */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: 2 }}>
          AI · ANALYSIS
        </div>
        {result && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{
              fontSize: 11, fontFamily: 'var(--mono)',
              padding: '2px 8px', borderRadius: 2,
              color: s.color, background: s.bg,
              border: `1px solid ${s.color}40`
            }}>
              {s.icon} {s.label}
            </span>
            <span style={{
              fontSize: 11, fontFamily: 'var(--mono)',
              padding: '2px 8px', borderRadius: 2,
              color: r.color, background: r.bg,
              border: `1px solid ${r.color}40`
            }}>
              {r.label}
            </span>
          </div>
        )}
      </div>

      {/* body */}
      <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {result ? (
          <div className="fade-up" style={{
            fontSize: 13, lineHeight: 1.8, color: '#c9d1d9',
            flex: 1
          }}>
            {result.summary}
          </div>
        ) : (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)',
            textAlign: 'center', lineHeight: 2
          }}>
            {stock ? '点击下方按钮\n获取AI分析' : '查询股票后\n进行分析'}
          </div>
        )}

        {error && (
          <div style={{ fontSize: 12, color: 'var(--up)', fontFamily: 'var(--mono)' }}>
            ERR: {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={handleAnalyze}
            disabled={!stock || loading}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 4,
              border: '1px solid',
              borderColor: (!stock || loading) ? 'var(--border)' : 'var(--accent)',
              background: (!stock || loading) ? 'transparent' : 'var(--accent-dim)',
              color: (!stock || loading) ? 'var(--muted)' : 'var(--accent)',
              fontFamily: 'var(--mono)',
              fontSize: 12,
              letterSpacing: 2,
              cursor: (!stock || loading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className="live-dot" style={{ background: 'var(--accent)' }} />
                ANALYZING...
              </span>
            ) : '[ KIMI ANALYZE ]'}
          </button>

          {result && (
            <button
              onClick={() => exportAnalysisPDF(stock, result)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--muted)',
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: 1,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.target.style.borderColor = '#60a5fa'
                e.target.style.color = '#60a5fa'
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = 'var(--border)'
                e.target.style.color = 'var(--muted)'
              }}
            >
              ↓ 导出 PDF 报告
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
