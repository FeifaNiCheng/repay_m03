import { query, execute } from './d1-client.js'

// ===== 账户相关 =====

// 登录校验
export async function login (username, password) {
  const rows = await query('SELECT username, nickname, password FROM users WHERE username = ?', [username])
  if (rows.length === 0) return null
  const user = rows[0]
  if (user.password !== password) return null
  return { username: user.username, nickname: user.nickname }
}

// 获取全部用户（设置页用）
export async function getAllUsers () {
  return query('SELECT username, nickname FROM users ORDER BY username')
}

// 修改昵称
export async function updateNickname (username, nickname) {
  await execute('UPDATE users SET nickname = ? WHERE username = ?', [nickname, username])
}

// 修改密码
export async function updatePassword (username, oldPassword, newPassword) {
  const rows = await query('SELECT password FROM users WHERE username = ?', [username])
  if (rows.length === 0 || rows[0].password !== oldPassword) {
    return false
  }
  await execute('UPDATE users SET password = ? WHERE username = ?', [newPassword, username])
  return true
}

// ===== 还款记录相关 =====

export async function getAllPayments () {
  return query(
    'SELECT id, date, amount, note, created_by AS createdBy, created_at AS createdAt FROM payments ORDER BY date DESC, created_at DESC'
  )
}

export async function addPayment (data) {
  const createdAt = new Date().toISOString()
  const meta = await execute(
    'INSERT INTO payments (date, amount, note, created_by, created_at) VALUES (?, ?, ?, ?, ?)',
    [data.date, data.amount, data.note || '', data.createdBy, createdAt]
  )
  return { id: meta.last_row_id }
}

export async function updatePayment (id, data) {
  await execute(
    'UPDATE payments SET date = ?, amount = ?, note = ? WHERE id = ?',
    [data.date, data.amount, data.note || '', id]
  )
}

export async function deletePayment (id) {
  await execute('DELETE FROM payments WHERE id = ?', [id])
}

// ===== 导出 =====

export async function exportData () {
  const users = await query('SELECT username, nickname FROM users ORDER BY username')
  const payments = await query(
    'SELECT id, date, amount, note, created_by AS createdBy, created_at AS createdAt FROM payments ORDER BY date, created_at'
  )
  return {
    app: 'repay-m03',
    version: 1,
    exportedAt: new Date().toISOString(),
    users,
    payments
  }
}
