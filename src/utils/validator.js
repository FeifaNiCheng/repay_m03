// 金额校验：不能为负，不能超过剩余欠款
export function validateAmount (amount, remaining) {
  if (amount == null || amount === '') return '请输入金额'
  const num = Number(amount)
  if (isNaN(num)) return '金额必须是数字'
  if (num <= 0) return '金额必须大于 0'
  if (remaining != null && num > remaining) return '金额不能超过剩余欠款 ' + remaining.toFixed(2)
  return ''
}

// 日期校验：不能为空，格式 YYYY-MM-DD
export function validateDate (dateStr) {
  if (!dateStr) return '请选择日期'
  return ''
}
