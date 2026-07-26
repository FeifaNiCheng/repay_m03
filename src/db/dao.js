import db from './database.js'

// ===== 账户相关 =====

// 初始化种子数据（仅在库为空时写入）
export async function seedIfNeeded () {
  const userCount = await db.users.count()
  if (userCount === 0) {
    await db.users.bulkAdd([
      { username: 'admin', nickname: '管理员', password: 'admin123' },
      { username: 'xrz', nickname: '仙人', password: 'admin123' },
      { username: 'ds', nickname: '大帅', password: 'admin123' }
    ])
  }
  const payCount = await db.payments.count()
  if (payCount === 0) {
    // 历史合计还款记录，操作人 admin
    await db.payments.add({
      date: '2025-08-01',
      amount: 39500,
      note: '历史合计 2025-08',
      createdBy: 'admin',
     createdAt: new Date().toISOString()
    })
  }
}

// 登录校验
export async function login (username, password) {
  const user = await db.users.get(username)
  if (!user) return null
  if (user.password !== password) return null
  return { username: user.username, nickname: user.nickname }
}

// 获取全部用户（设置页用）
export async function getAllUsers () {
  return db.users.toArray()
}

// 修改昵称
export async function updateNickname (username, nickname) {
  await db.users.update(username, { nickname, updatedAt: new Date().toISOString() })
}

// 修改密码
export async function updatePassword (username, oldPassword, newPassword) {
  const user = await db.users.get(username)
  if (!user || user.password !== oldPassword) {
    return false
  }
 await db.users.update(username, { password: newPassword, updatedAt: new Date().toISOString() })
  return true
}

// ===== 还款记录相关 =====

export async function getAllPayments () {
  // 过滤掉软删除的记录
  const all = await db.payments.orderBy('date').toArray()
  return all.filter(p => !p.deleted)
}

export async function addPayment (data) {
  return db.payments.add({
    date: data.date,
    amount: data.amount,
    note: data.note || '',
    createdBy: data.createdBy,
   createdAt: new Date().toISOString(),
   updatedAt: new Date().toISOString()
  })
}

export async function updatePayment (id, data) {
  await db.payments.update(id, {
    date: data.date,
    amount: data.amount,
   note: data.note || '',
   updatedAt: new Date().toISOString()
  })
}

export async function deletePayment (id) {
  // 软删除：标记 deleted + updatedAt，同步时其他设备才能感知到删除
  await db.payments.update(id, {
    deleted: true,
    updatedAt: new Date().toISOString()
  })
}

// ===== 导入导出 =====

export async function exportData () {
  const users = await db.users.toArray()
  const payments = await db.payments.toArray()
  return {
    app: 'repay-m03',
    version: 1,
   exportedAt: new Date().toISOString(),
    users,
    payments
  }
}

// 导入：覆盖式写入，校验结构
export async function importData (json) {
  if (!json || json.app !== 'repay-m03' || !Array.isArray(json.users) || !Array.isArray(json.payments)) {
    throw new Error('备份文件格式不正确')
  }
  await db.transaction('rw', db.users, db.payments, async () => {
    await db.users.clear()
    await db.payments.clear()
   await db.users.bulkAdd(json.users)
   await db.payments.bulkAdd(json.payments)
  })
  return { users: json.users.length, payments: json.payments.length }
}

// 物理清理：删除所有标记 deleted:true 的记录（不可恢复）
export async function purgeDeletedPayments () {
  const all = await db.payments.toArray()
  const deletedIds = all.filter(p => p.deleted).map(p => p.id)
  if (deletedIds.length > 0) {
    await db.payments.bulkDelete(deletedIds)
  }
  return deletedIds.length
}
