import { useState } from 'react'
import { analyzeStock } from '../api/client'

export default function AIAnalysis({ stock, onAnalysisSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await analyzeStock(
        stock.symbol,
        stock.name,
        stock.price,
        stock.change_pct
      )
      onAnalysisSuccess(result)
    } catch (err) {
      setError('分析失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-lg">
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full px-6 py-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-400 font-semibold text-lg transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            分析中...
          </>
        ) : (
          '🤖 AI 分析'
        )}
      </button>
      {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
    </div>
  )
}
