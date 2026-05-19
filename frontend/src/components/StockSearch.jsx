import { useState } from 'react'
import { fetchStock } from '../api/client'

export default function StockSearch({ onStockFound, setLoading }) {
  const [symbol, setSymbol] = useState('')
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!symbol.trim()) return

    setLoading(true)
    setError('')
    try {
      const data = await fetchStock(symbol.trim())
      onStockFound(data)
    } catch (err) {
      setError('股票代码不存在，请检查')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSearch} className="mb-8">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="输入6位股票代码 (如 000001)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition"
        >
          查询
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  )
}
