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

// 月份 key 格式化为中文，如 2026年03月
export function formatMonth (monthKey) {
  const [y, m] = monthKey.split('-')
  return `${y}年${m}月`
}
