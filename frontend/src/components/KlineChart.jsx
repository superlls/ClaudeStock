import { useEffect, useRef } from 'react'

function calcMA(data, period) {
  return data.map((_, i) => {
    if (i < period - 1) return null
    const slice = data.slice(i - period + 1, i + 1)
    const avg = slice.reduce((s, d) => s + d.close, 0) / period
    return +avg.toFixed(2)
  })
}

export default function KlineChart({ klineData, symbol }) {
  const chartRef = useRef(null)
  const instanceRef = useRef(null)

  useEffect(() => {
    if (!chartRef.current) return
    if (!instanceRef.current) {
      instanceRef.current = window.echarts.init(chartRef.current, null, { renderer: 'canvas' })
    }
    const chart = instanceRef.current

    if (!klineData || klineData.length === 0) {
      chart.clear()
      return
    }

    const dates   = klineData.map(d => d.date.slice(0, 16))
    const ohlc    = klineData.map(d => [d.open, d.close, d.low, d.high])
    const volumes = klineData.map(d => d.volume)
    const ma5     = calcMA(klineData, 5)
    const ma10    = calcMA(klineData, 10)
    const ma20    = calcMA(klineData, 20)

    const upColor   = '#f03e3e'
    const downColor = '#22c55e'

    const option = {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 600,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', lineStyle: { color: '#e8b84b', width: 1, type: 'dashed' } },
        backgroundColor: '#0d1117',
        borderColor: '#1c2333',
        borderWidth: 1,
        textStyle: { color: '#c9d1d9', fontFamily: 'JetBrains Mono', fontSize: 12 },
        formatter(params) {
          const k = params.find(p => p.seriesName === 'K线')
          const v = params.find(p => p.seriesName === '成交量')
          if (!k) return ''
          const [o, c, l, h] = k.value
          const isUp = c >= o
          const color = isUp ? upColor : downColor
          const pct = o ? (((c - o) / o) * 100).toFixed(2) : '0.00'
          return `<div style="font-family:JetBrains Mono;font-size:11px;line-height:1.8">
            <div style="color:#e8b84b;margin-bottom:4px">${k.name}</div>
            <div>开 <span style="color:${color}">${o}</span></div>
            <div>高 <span style="color:${color}">${h}</span></div>
            <div>低 <span style="color:${color}">${l}</span></div>
            <div>收 <span style="color:${color}">${c}</span>
              <span style="margin-left:6px;color:${color}">${isUp?'+':''}${pct}%</span>
            </div>
            ${v ? `<div style="margin-top:4px;color:#586069">量 ${(v.value/10000).toFixed(0)}万手</div>` : ''}
          </div>`
        }
      },
      axisPointer: { link: [{ xAxisIndex: 'all' }] },
      grid: [
        { left: 60, right: 60, top: 16, bottom: '34%' },
        { left: 60, right: 60, top: '70%', bottom: 40 }
      ],
      xAxis: [
        {
          type: 'category', data: dates, gridIndex: 0,
          axisLine: { lineStyle: { color: '#1c2333' } },
          axisLabel: { show: false },
          axisTick: { show: false },
          splitLine: { show: true, lineStyle: { color: '#1c2333', type: 'dashed' } }
        },
        {
          type: 'category', data: dates, gridIndex: 1,
          axisLine: { lineStyle: { color: '#1c2333' } },
          axisLabel: { color: '#586069', fontFamily: 'JetBrains Mono', fontSize: 10 },
          axisTick: { show: false },
          splitLine: { show: false }
        }
      ],
      yAxis: [
        {
          scale: true, gridIndex: 0,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#586069', fontFamily: 'JetBrains Mono', fontSize: 10, inside: false },
          splitLine: { lineStyle: { color: '#1c2333', type: 'dashed' } }
        },
        {
          scale: true, gridIndex: 1,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: '#586069', fontFamily: 'JetBrains Mono', fontSize: 10,
            formatter: v => v >= 10000 ? (v/10000).toFixed(0)+'万' : v
          },
          splitLine: { show: false }
        }
      ],
      dataZoom: [
        { type: 'inside', xAxisIndex: [0,1], start: 30, end: 100 },
        {
          type: 'slider', xAxisIndex: [0,1], start: 30, end: 100,
          bottom: 0, height: 18,
          backgroundColor: '#0d1117',
          fillerColor: 'rgba(232,184,75,0.08)',
          borderColor: '#1c2333',
          handleStyle: { color: '#e8b84b', borderColor: '#e8b84b' },
          textStyle: { color: '#586069', fontFamily: 'JetBrains Mono', fontSize: 9 },
          moveHandleStyle: { color: '#1c2333' }
        }
      ],
      series: [
        {
          name: 'K线', type: 'candlestick',
          xAxisIndex: 0, yAxisIndex: 0,
          data: ohlc,
          itemStyle: {
            color: upColor, color0: downColor,
            borderColor: upColor, borderColor0: downColor,
            borderWidth: 1
          }
        },
        {
          name: 'MA5', type: 'line', xAxisIndex: 0, yAxisIndex: 0,
          data: ma5, smooth: true,
          lineStyle: { color: '#e8b84b', width: 1 },
          symbol: 'none', legendHoverLink: false
        },
        {
          name: 'MA10', type: 'line', xAxisIndex: 0, yAxisIndex: 0,
          data: ma10, smooth: true,
          lineStyle: { color: '#c084fc', width: 1 },
          symbol: 'none', legendHoverLink: false
        },
        {
          name: 'MA20', type: 'line', xAxisIndex: 0, yAxisIndex: 0,
          data: ma20, smooth: true,
          lineStyle: { color: '#60a5fa', width: 1 },
          symbol: 'none', legendHoverLink: false
        },
        {
          name: '成交量', type: 'bar',
          xAxisIndex: 1, yAxisIndex: 1,
          data: volumes.map((v, i) => ({
            value: v,
            itemStyle: {
              color: klineData[i].close >= klineData[i].open
                ? 'rgba(240,62,62,0.6)' : 'rgba(34,197,94,0.6)'
            }
          }))
        }
      ],
      legend: {
        top: 4, left: 60,
        data: ['MA5','MA10','MA20'],
        textStyle: { color: '#586069', fontFamily: 'JetBrains Mono', fontSize: 10 },
        itemWidth: 12, itemHeight: 2,
        inactiveColor: '#2a3142'
      }
    }

    chart.setOption(option, true)

    const ro = new ResizeObserver(() => chart.resize())
    ro.observe(chartRef.current)
    return () => ro.disconnect()
  }, [klineData])

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '100%', minHeight: 420 }}
    />
  )
}
