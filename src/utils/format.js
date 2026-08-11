// 金额格式化：元，保留两位小数，带千分位
export function formatMoney (num) {
  if (num == null || isNaN(num)) return '0.00'
  return Number(num).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 金额格式化带 ¥ 前缀
export function formatYuan (num) {
  return '¥' + formatMoney(num)
}

// 日期格式化为 YYYY-MM-DD（已是该格式则原样返回）
export function formatDate (dateStr) {
  if (!dateStr) return ''
  return String(dateStr).slice(0, 10)
}

// 取月份 key，如 2026-03
export function getMonthKey (dateStr) {
  return String(dateStr).slice(0, 7)
}

// 取排序用的精确时间戳：优先 createdAt（到秒/毫秒），回退到 date
// 主排序按还款日期 date，同一天内再用 createdAt 区分先后
// 注意：不能只用 createdAt，否则历史合计等「date 早、createdAt 晚」的记录会被排到后面真实日期之前
export function getSortTime (p) {
  const date = p.date ? String(p.date).slice(0, 10) : '0000-00-00'
  const created = p.createdAt || ''
  return date + '|' + created
}

// 格式化时间用于明细展示：YYYY-MM-DD HH:mm:ss（到秒，单行不换行）
// 历史记录无 createdAt 时只显示 YYYY-MM-DD
export function formatTimeShort (p) {
  const datePart = p.date ? String(p.date).slice(0, 10) : '----'
  if (!p.createdAt) return datePart
  const d = new Date(p.createdAt)
  if (isNaN(d.getTime())) return datePart
  const pad = (n) => String(n).padStart(2, '0')
  return `${datePart} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// 月份 key 格式化为中文，如 2026年03月
export function formatMonth (monthKey) {
  const [y, m] = monthKey.split('-')
  return `${y}年${m}月`
}
