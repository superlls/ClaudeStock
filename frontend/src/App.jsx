import { useState } from 'react'
import StockSearch from './components/StockSearch'
import StockInfo from './components/StockInfo'
import AIAnalysis from './components/AIAnalysis'
import HistoryTable from './components/HistoryTable'

function App() {
  const [stock, setStock] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAnalysisSuccess = (analysisData) => {
    setAnalysis(analysisData)
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          AI 股票分析面板
        </h1>
        <p className="text-center text-gray-600 mb-8">
          输入股票代码，获取 AI 分析建议
        </p>

        <StockSearch onStockFound={setStock} setLoading={setLoading} />

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin">
              <div className="h-8 w-8 border-4 border-blue-400 border-t-blue-600 rounded-full"></div>
            </div>
            <p className="text-gray-600 mt-2">加载中...</p>
          </div>
        )}

        {stock && !loading && (
          <>
            <StockInfo stock={stock} />
            <AIAnalysis stock={stock} onAnalysisSuccess={handleAnalysisSuccess} />
          </>
        )}

        {analysis && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-lg border-l-4 border-green-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">分析结果</h3>
            <div className="flex gap-3 mb-4">
              <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
                analysis.sentiment === 'Bullish' ? 'bg-green-100 text-green-800' :
                analysis.sentiment === 'Bearish' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {analysis.sentiment === 'Bullish' ? '📈 看多' :
                 analysis.sentiment === 'Bearish' ? '📉 看空' : '➡️ 中性'}
              </span>
              <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
                analysis.risk_level === 'Low' ? 'bg-blue-100 text-blue-800' :
                analysis.risk_level === 'Medium' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {analysis.risk_level === 'Low' ? '🟢 低风险' :
                 analysis.risk_level === 'Medium' ? '🟡 中风险' : '🔴 高风险'}
              </span>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              {analysis.summary}
            </p>
          </div>
        )}

        <HistoryTable key={refreshKey} />
      </div>
    </div>
  )
}

export default App
