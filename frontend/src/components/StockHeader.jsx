export default function StockHeader({ stock, loading }) {
  if (loading) return (
    <div className="flex items-center gap-6 p-4">
      <div className="skeleton h-7 w-40" />
      <div className="skeleton h-10 w-32" />
      <div className="skeleton h-5 w-20" />
    </div>
  )

  if (!stock) return (
    <div className="flex items-center gap-3 p-4 text-sm" style={{ color: 'var(--muted)' }}>
      <span className="live-dot" />
      <span style={{ fontFamily: 'var(--mono)' }}>— 输入股票代码开始分析 —</span>
    </div>
  )

  const up = parseFloat(stock.change_pct) >= 0
  const color = up ? 'var(--up)' : 'var(--down)'
  const bg    = up ? 'var(--up-dim)' : 'var(--down-dim)'

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4 fade-up">
      <div>
        <span style={{ fontSize: 18, fontWeight: 600, color: '#e8edf3' }}>
          {stock.name}
        </span>
        <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
          {stock.symbol}
        </span>
      </div>

      <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 600, color }}>
        {stock.price.toFixed(2)}
      </div>

      <div
        style={{
          padding: '2px 10px', borderRadius: 3, fontSize: 13,
          fontFamily: 'var(--mono)', fontWeight: 500,
          color, background: bg, border: `1px solid ${color}30`
        }}
      >
        {up ? '+' : ''}{stock.change_pct}%
      </div>

      <div className="flex gap-6 ml-auto">
        {[
          { label: '成交量', value: formatVol(stock.volume) },
          { label: '总市值', value: formatCap(stock.market_cap) },
        ].map(({ label, value }) => value && (
          <div key={label} style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{label}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: '#c9d1d9' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatVol(v) {
  if (!v) return ''
  const n = parseInt(v)
  if (n >= 100000000) return (n / 100000000).toFixed(2) + '亿'
  if (n >= 10000)     return (n / 10000).toFixed(0) + '万'
  return String(n)
}

function formatCap(v) {
  if (!v || v === '') return ''
  const n = parseInt(v)
  if (isNaN(n)) return ''
  if (n >= 100000000) return (n / 100000000).toFixed(0) + '亿'
  if (n >= 10000)     return (n / 10000).toFixed(0) + '万'
  return String(n)
}
