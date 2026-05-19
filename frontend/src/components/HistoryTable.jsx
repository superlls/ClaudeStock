import { useState, useEffect } from 'react'
import { fetchHistory } from '../api/client'

export default function HistoryTable() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchHistory(10)
        setHistory(data.data || [])
      } catch (err) {
        console.error('Failed to load history:', err)
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [])

  if (loading) {
    return <div className="text-center text-gray-500 py-4">加载历史记录...</div>
  }

  if (!history.length) {
    return <div className="text-center text-gray-500 py-4">暂无历史记录</div>
  }

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">历史分析</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-gray-300">
            <tr className="text-gray-700">
              <th className="text-left py-2 px-4">代码</th>
              <th className="text-left py-2 px-4">名称</th>
              <th className="text-left py-2 px-4">价格</th>
              <th className="text-left py-2 px-4">涨跌幅</th>
              <th className="text-left py-2 px-4">情绪</th>
              <th className="text-left py-2 px-4">风险</th>
              <th className="text-left py-2 px-4">时间</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold">{item.symbol}</td>
                <td className="py-3 px-4">{item.name || '-'}</td>
                <td className="py-3 px-4">¥{item.price?.toFixed(2) || '-'}</td>
                <td className={`py-3 px-4 ${parseFloat(item.change_pct) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {item.change_pct}%
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    item.sentiment === 'Bullish' ? 'bg-green-100 text-green-800' :
                    item.sentiment === 'Bearish' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.sentiment === 'Bullish' ? '看多' :
                     item.sentiment === 'Bearish' ? '看空' : '中性'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    item.risk_level === 'Low' ? 'bg-blue-100 text-blue-800' :
                    item.risk_level === 'Medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.risk_level === 'Low' ? '低' :
                     item.risk_level === 'Medium' ? '中' : '高'}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">
                  {item.created_at ? new Date(item.created_at).toLocaleString('zh-CN') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
