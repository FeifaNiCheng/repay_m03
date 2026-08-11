import axios from 'axios'

// D1 REST API 配置
// 开发时通过 Vite proxy 绕过 CORS：/d1/* -> https://api.cloudflare.com/client/v4/*
const ACCOUNT_ID = import.meta.env.VITE_D1_ACCOUNT_ID
const DATABASE_ID = import.meta.env.VITE_D1_DATABASE_ID
const TOKEN = import.meta.env.VITE_D1_TOKEN

const API_URL = `/d1/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`

// 执行 SQL 查询，返回结果行数组
export async function query (sql, params = []) {
  const { data } = await axios.post(API_URL, { sql, params }, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
  if (!data.success) {
    throw new Error(data.errors?.[0]?.message || 'D1 查询失败')
  }
  return data.result[0].results || []
}

// 执行写入操作（INSERT/UPDATE/DELETE），返回 meta
export async function execute (sql, params = []) {
  const { data } = await axios.post(API_URL, { sql, params }, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
  if (!data.success) {
    throw new Error(data.errors?.[0]?.message || 'D1 写入失败')
  }
  return data.result[0].meta
}
