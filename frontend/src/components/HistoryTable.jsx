import { useState, useEffect } from 'react'
import { fetchHistory } from '../api/client'

const SENT_MAP = {
  Bullish: { label: '看多', color: 'var(--up)' },
  Bearish: { label: '看空', color: 'var(--down)' },
  Neutral: { label: '中性', color: '#e8b84b' },
}
const RISK_MAP = {
  Low:    { label: '低', color: '#60a5fa' },
  Medium: { label: '中', color: '#e8b84b' },
  High:   { label: '高', color: 'var(--up)' },
}

export default function HistoryTable({ refreshKey }) {
  const [rows, setRows]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory(20)
      .then(d => setRows(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [refreshKey])

  const cols = ['代码', '名称', '价格', '涨跌', '情绪', '风险', '摘要', '时间']

  return (
    <div style={{
      background: 'var(--panel)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        fontSize: 11,
        color: 'var(--muted)',
        fontFamily: 'var(--mono)',
        letterSpacing: 2,
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        <span>ANALYSIS · HISTORY</span>
        {!loading && (
          <span style={{ color: 'var(--border2)' }}>({rows.length})</span>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {cols.map(c => (
                <th key={c} style={{
                  padding: '8px 12px', textAlign: 'left',
                  color: 'var(--muted)', fontFamily: 'var(--mono)',
                  fontSize: 10, letterSpacing: 1, fontWeight: 400,
                  whiteSpace: 'nowrap'
                }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <tr key={i}>
                  {cols.map(c => (
                    <td key={c} style={{ padding: '10px 12px' }}>
                      <div className="skeleton" style={{ height: 12, width: '80%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={cols.length} style={{
                  padding: '32px', textAlign: 'center',
                  color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 11
                }}>
                  — NO RECORDS —
                </td>
              </tr>
            ) : rows.map((row, i) => {
              const up   = parseFloat(row.change_pct) >= 0
              const s    = SENT_MAP[row.sentiment] || SENT_MAP.Neutral
              const rk   = RISK_MAP[row.risk_level] || RISK_MAP.Medium
              return (
                <tr key={i} style={{
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '9px 12px', fontFamily: 'var(--mono)', color: 'var(--accent)', fontWeight: 500 }}>
                    {row.symbol}
                  </td>
                  <td style={{ padding: '9px 12px', color: '#c9d1d9' }}>{row.name}</td>
                  <td style={{ padding: '9px 12px', fontFamily: 'var(--mono)', color: '#c9d1d9' }}>
                    {row.price?.toFixed(2)}
                  </td>
                  <td style={{
                    padding: '9px 12px', fontFamily: 'var(--mono)',
                    color: up ? 'var(--up)' : 'var(--down)'
                  }}>
                    {up ? '+' : ''}{row.change_pct}%
                  </td>
                  <td style={{ padding: '9px 12px' }}>
                    <span style={{ color: s.color, fontFamily: 'var(--mono)', fontSize: 11 }}>{s.label}</span>
                  </td>
                  <td style={{ padding: '9px 12px' }}>
                    <span style={{ color: rk.color, fontFamily: 'var(--mono)', fontSize: 11 }}>{rk.label}</span>
                  </td>
                  <td style={{
                    padding: '9px 12px', color: 'var(--muted)', fontSize: 11,
                    maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {row.summary}
                  </td>
                  <td style={{
                    padding: '9px 12px', fontFamily: 'var(--mono)', fontSize: 10,
                    color: 'var(--muted)', whiteSpace: 'nowrap'
                  }}>
                    {row.created_at ? new Date(row.created_at).toLocaleString('zh-CN', {
                      month: '2-digit', day: '2-digit',
                      hour: '2-digit', minute: '2-digit'
                    }) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
