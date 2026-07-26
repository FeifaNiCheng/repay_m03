import Dexie from 'dexie'

// Dexie 数据库：存储还款记录与账户信息
const db = new Dexie('RepayM03DB')

db.version(1).stores({
  // payments: 自增主键 id，索引 date / createdBy
  payments: '++id, date, createdBy, createdAt',
  // users: 主键 username（不可变），密码与昵称可改
  users: 'username, nickname'
})

export default db
