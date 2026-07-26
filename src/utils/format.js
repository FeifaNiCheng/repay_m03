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
// 同一天多条记录靠 createdAt 区分先后，避免排序错乱
export function getSortTime (p) {
  if (p.createdAt) return p.createdAt
  // date 是 YYYY-MM-DD，补 T00:00:00 保证可比
  return p.date ? p.date + 'T00:00:00' : ''
}

// 格式化时间用于明细展示：MM-DD HH:mm:ss（到秒）
// 历史记录无 createdAt 时只显示日期 MM-DD
export function formatTimeShort (p) {
  const datePart = p.date ? String(p.date).slice(5, 10) : '--'
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
