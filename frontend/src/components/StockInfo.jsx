export default function StockInfo({ stock }) {
  const changePercent = parseFloat(stock.change_pct)
  const isPositive = changePercent > 0

  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            {stock.name} ({stock.symbol})
          </h2>
          <p className="text-gray-600 mt-2">当前价格</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-gray-800">
            ¥{stock.price.toFixed(2)}
          </div>
          <div className={`text-2xl font-semibold mt-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{stock.change_pct}%
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6 text-gray-700">
        <div>
          <p className="text-sm text-gray-500">成交量</p>
          <p className="text-lg font-semibold">{stock.volume}</p>
        </div>
        {stock.market_cap && (
          <div>
            <p className="text-sm text-gray-500">总市值</p>
            <p className="text-lg font-semibold">{stock.market_cap}</p>
          </div>
        )}
      </div>
    </div>
  )
}
