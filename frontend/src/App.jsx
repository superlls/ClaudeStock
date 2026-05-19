import { useState, useRef } from 'react'
import { fetchStock, fetchKline } from './api/client'
import KlineChart   from './components/KlineChart'
import StockHeader  from './components/StockHeader'
import AIPanel      from './components/AIPanel'
import HistoryTable from './components/HistoryTable'

const PERIODS = [
  { label: '60min', scale: 60,  datalen: 120 },
  { label: '日K',   scale: 240, datalen: 120 },
  { label: '周K',   scale: 1200, datalen: 80 },
]

export default function App() {
  const [symbol, setSymbol]       = useState('')
  const [stock,  setStock]        = useState(null)
  const [kline,  setKline]        = useState([])
  const [loading, setLoading]     = useState(false)
  const [klineLoading, setKlineLoading] = useState(false)
  const [error,  setError]        = useState('')
  const [period, setPeriod]       = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const inputRef = useRef(null)

  const doSearch = async (sym, periodIdx) => {
    const s = (sym || symbol).trim()
    if (!s) return
    setError(''); setLoading(true); setKlineLoading(true)

    try {
      const [stockData] = await Promise.all([fetchStock(s)])
      setStock(stockData)

      const p = PERIODS[periodIdx ?? period]
      const klineData = await fetchKline(s, p.scale, p.datalen)
      setKline(klineData.kline || [])
    } catch (e) {
      setError(e.message)
      setStock(null); setKline([])
    } finally {
      setLoading(false); setKlineLoading(false)
    }
  }

  const handlePeriod = async (idx) => {
    setPeriod(idx)
    if (!stock) return
    setKlineLoading(true)
    try {
      const p = PERIODS[idx]
      const d = await fetchKline(stock.symbol, p.scale, p.datalen)
      setKline(d.kline || [])
    } catch {}
    finally { setKlineLoading(false) }
  }

  const quickPicks = ['600519', '000001', '300750', '000858', '600036']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── TOP BAR ── */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 20px',
        height: 52,
        display: 'flex', alignItems: 'center', gap: 16,
        background: 'var(--panel)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        {/* logo */}
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600,
          color: 'var(--accent)', letterSpacing: 3, whiteSpace: 'nowrap'
        }}>
          ◈ CLAUDE<span style={{ color: '#586069' }}>STOCK</span>
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

        {/* search */}
        <form
          onSubmit={e => { e.preventDefault(); doSearch() }}
          style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1, maxWidth: 360 }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)'
            }}>$</span>
            <input
              ref={inputRef}
              value={symbol}
              onChange={e => setSymbol(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="股票代码 000001"
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '6px 10px 6px 26px',
                color: '#e8edf3',
                fontFamily: 'var(--mono)',
                fontSize: 13,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            padding: '6px 14px',
            background: loading ? 'transparent' : 'var(--accent-dim)',
            border: '1px solid',
            borderColor: loading ? 'var(--border)' : 'var(--accent)',
            borderRadius: 4,
            color: loading ? 'var(--muted)' : 'var(--accent)',
            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1,
            cursor: loading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
          }}>
            {loading ? '...' : 'QUERY'}
          </button>
        </form>

        {/* quick picks */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {quickPicks.map(q => (
            <button key={q} onClick={() => { setSymbol(q); doSearch(q) }} style={{
              padding: '4px 8px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 3,
              color: 'var(--muted)',
              fontFamily: 'var(--mono)', fontSize: 10,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)' }}
            >{q}</button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="live-dot" />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>LIVE</span>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {error && (
          <div style={{
            padding: '8px 14px', borderRadius: 4,
            background: 'var(--up-dim)', border: '1px solid var(--up)',
            color: 'var(--up)', fontFamily: 'var(--mono)', fontSize: 12
          }}>
            ERR › {error}
          </div>
        )}

        {/* stock header row */}
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 6,
        }}>
          <StockHeader stock={stock} loading={loading} />
        </div>

        {/* chart + AI panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 12, alignItems: 'stretch' }}>

          {/* chart panel */}
          <div style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            overflow: 'hidden',
          }}>
            {/* chart toolbar */}
            <div style={{
              padding: '8px 12px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 12
            }}>
              <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: 2 }}>
                K-LINE
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                {PERIODS.map((p, i) => (
                  <button key={p.label} onClick={() => handlePeriod(i)} style={{
                    padding: '2px 8px',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: period === i ? 'var(--accent)' : 'var(--border)',
                    background: period === i ? 'var(--accent-dim)' : 'transparent',
                    color: period === i ? 'var(--accent)' : 'var(--muted)',
                    fontFamily: 'var(--mono)', fontSize: 10,
                    cursor: 'pointer',
                  }}>
                    {p.label}
                  </button>
                ))}
              </div>
              {klineLoading && (
                <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                  loading...
                </span>
              )}
            </div>
            <div style={{ height: 460 }}>
              {kline.length > 0 ? (
                <KlineChart klineData={kline} symbol={stock?.symbol} />
              ) : (
                <div style={{
                  height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--border2)', fontFamily: 'var(--mono)', fontSize: 12,
                  flexDirection: 'column', gap: 8
                }}>
                  {klineLoading ? (
                    <>
                      <div className="skeleton" style={{ width: '80%', height: 160, marginBottom: 8 }} />
                      <div className="skeleton" style={{ width: '80%', height: 60 }} />
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 28, opacity: 0.3 }}>▤</span>
                      <span>查询股票以显示K线图</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* AI panel */}
          <AIPanel stock={stock} onDone={() => setRefreshKey(k => k + 1)} />
        </div>

        {/* history */}
        <HistoryTable refreshKey={refreshKey} />

      </main>

      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '8px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)',
      }}>
        <span>CLAUDESTOCK · AI POWERED BY KIMI</span>
        <span>DATA · SINA FINANCE</span>
      </footer>
    </div>
  )
}
