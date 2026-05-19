import { jsPDF } from 'jspdf'

const SENT_LABEL = { Bullish: '看多 ▲', Bearish: '看空 ▼', Neutral: '中性 ◆' }
const RISK_LABEL  = { Low: '低风险', Medium: '中风险', High: '高风险' }

export function exportAnalysisPDF(stock, result) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const gray = [140, 140, 140]
  const dark = [30, 35, 45]
  const white = [232, 237, 243]

  // ── background ──
  doc.setFillColor(...dark)
  doc.rect(0, 0, W, 297, 'F')

  // ── header bar ──
  doc.setFillColor(20, 25, 35)
  doc.rect(0, 0, W, 22, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(82, 200, 150)
  doc.text('CLAUDESTOCK', 14, 14)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...gray)
  doc.text('AI STOCK ANALYSIS REPORT', 14, 19)

  // date top-right
  const dateStr = new Date().toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
  doc.text(dateStr, W - 14, 14, { align: 'right' })

  // ── divider ──
  doc.setDrawColor(40, 48, 60)
  doc.setLineWidth(0.3)
  doc.line(14, 26, W - 14, 26)

  // ── stock name + code ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...white)
  doc.text(stock.name, 14, 38)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...gray)
  doc.text(stock.symbol, 14, 44)

  // ── price ──
  const up = parseFloat(stock.change_pct) >= 0
  const priceColor = up ? [220, 80, 80] : [40, 170, 100]

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(...priceColor)
  doc.text(stock.price.toFixed(2), 14, 58)

  const changeText = `${up ? '+' : ''}${stock.change_pct}%`
  doc.setFontSize(12)
  doc.text(changeText, 14, 64)

  // ── sentiment + risk badges ──
  const sentText = SENT_LABEL[result.sentiment] || result.sentiment
  const riskText = RISK_LABEL[result.risk_level]  || result.risk_level

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  // sentiment badge
  const sentColor = result.sentiment === 'Bullish' ? [220, 80, 80]
    : result.sentiment === 'Bearish' ? [40, 170, 100]
    : [232, 184, 75]
  doc.setFillColor(...sentColor, 0.15)
  doc.setDrawColor(...sentColor)
  doc.setLineWidth(0.4)
  doc.roundedRect(W - 90, 34, 35, 8, 1, 1, 'FD')
  doc.setTextColor(...sentColor)
  doc.text(sentText, W - 72.5, 39.2, { align: 'center' })

  // risk badge
  const riskColor = result.risk_level === 'High' ? [220, 80, 80]
    : result.risk_level === 'Low' ? [96, 165, 250]
    : [232, 184, 75]
  doc.setFillColor(...riskColor, 0.15)
  doc.setDrawColor(...riskColor)
  doc.roundedRect(W - 52, 34, 35, 8, 1, 1, 'FD')
  doc.setTextColor(...riskColor)
  doc.text(riskText, W - 34.5, 39.2, { align: 'center' })

  // ── section divider ──
  doc.setDrawColor(40, 48, 60)
  doc.setLineWidth(0.3)
  doc.line(14, 72, W - 14, 72)

  // ── analysis summary ──
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...gray)
  doc.text('AI ANALYSIS · POWERED BY KIMI', 14, 78)

  doc.setFontSize(11)
  doc.setTextColor(...white)
  const lines = doc.splitTextToSize(result.summary, W - 28)
  doc.text(lines, 14, 86)

  // ── footer ──
  doc.setDrawColor(40, 48, 60)
  doc.line(14, 280, W - 14, 280)
  doc.setFontSize(7)
  doc.setTextColor(...gray)
  doc.text('本报告由 Kimi AI 自动生成，仅供参考，不构成投资建议。数据来源：新浪财经', 14, 286)
  doc.text('CLAUDESTOCK · claudestock.onrender.com', W - 14, 286, { align: 'right' })

  const filename = `${stock.symbol}_${stock.name}_分析报告_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}
