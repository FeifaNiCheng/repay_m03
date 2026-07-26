// Gitee 同步模块：从 Gitee 仓库拉取/推送 JSON 备份
// 使用 Gitee API v5，支持 CORS

const OWNER = import.meta.env.VITE_GITEE_OWNER
const REPO = import.meta.env.VITE_GITEE_REPO
const PATH = import.meta.env.VITE_GITEE_PATH || 'repay-backup.json'
const TOKEN = import.meta.env.VITE_GITEE_TOKEN

const API_BASE = 'https://gitee.com/api/v5/repos'

// 路径编码：逐段编码，保留 / 分隔符
const ENCODED_PATH = PATH.split('/').map(encodeURIComponent).join('/')

// 是否已配置 Gitee
export function isGiteeConfigured () {
  return !!(OWNER && REPO && TOKEN)
}

// 获取配置信息（用于界面展示，令牌脱敏）
export function getGiteeConfig () {
  return {
    owner: OWNER || '',
    repo: REPO || '',
    path: PATH,
    configured: isGiteeConfigured()
  }
}

// 从 Gitee 拉取 JSON 数据
// 返回 { data, sha, updatedAt } 或 null（文件不存在时）
export async function fetchFromGitee () {
  if (!isGiteeConfigured()) throw new Error('Gitee 未配置')
  const url = `${API_BASE}/${OWNER}/${REPO}/contents/${ENCODED_PATH}?access_token=${TOKEN}`
  const resp = await fetch(url).catch(e => {
    throw new Error(`拉取网络错误：${e.message}`)
  })
  // Gitee 文件不存在时返回 HTTP 200 + 空数组 []，而非 404
  if (resp.status === 404) return null
  if (!resp.ok) throw new Error(`拉取失败: ${resp.status}`)
  const json = await resp.json()
  if (Array.isArray(json) && json.length === 0) return null
  // Gitee 返回 base64 编码的文件内容
  // atob 解出的是 Latin-1，需要转回 UTF-8 才能正确解析中文
  const content = decodeURIComponent(escape(atob(json.content.replace(/\n/g, ''))))
  const data = JSON.parse(content)
  return { data, sha: json.sha, updatedAt: data.exportedAt || '' }
}

// 推送 JSON 数据到 Gitee（新增或更新）
// sha: 文件已存在时的 sha，用于更新；新建时传 undefined
export async function pushToGitee (data, sha) {
  if (!isGiteeConfigured()) throw new Error('Gitee 未配置')
  // token 放到 query 参数，Gitee 对此更兼容
  const url = `${API_BASE}/${OWNER}/${REPO}/contents/${ENCODED_PATH}?access_token=${TOKEN}`
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))))
  const body = {
    content,
    message: `sync: ${new Date().toISOString()}`
  }
  if (sha) body.sha = sha
  return await doPush(url, body, data)
}

// 实际推送请求，带容错重试
// Gitee 的坑：新建文件时不带 sha 会报 "sha is missing"
// 但同一请求带 sha 又会报冲突。所以必须先 GET 拿到 sha 再 PUT。
async function doPush (url, body, data) {
  // 第一次尝试（可能带 sha 也可能不带）
  let resp = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).catch(e => {
    throw new Error(`网络错误，可能是浏览器 CORS 限制：${e.message}`)
  })

  if (!resp.ok) {
    const errBody = await resp.json().catch(() => ({}))
    const status = resp.status
    const needSha = (errBody.messages || []).some(m => String(m).includes('sha'))

    // 如果是缺少 sha，先拉取文件的 sha 再重试
    if (needSha) {
      const existing = await fetchFromGitee()
      if (existing && existing.sha) {
        body.sha = existing.sha
        resp = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }).catch(e => {
          throw new Error(`重试网络错误：${e.message}`)
        })
        if (resp.ok) {
          const result = await resp.json()
          return { sha: result.content?.sha || '', updatedAt: data.exportedAt }
        }
      }
    }

    // 仍然失败，给出明确错误
    const err = await resp.json().catch(() => ({}))
    const msg = err.message || (err.messages || []).join('; ') || `HTTP ${status}`
    if (status === 401 || status === 403) {
      throw new Error(`权限不足(${status})，令牌可能失效或无写入权限`)
    }
    throw new Error(`推送失败: ${msg}`)
  }

  const result = await resp.json()
  return { sha: result.content?.sha || '', updatedAt: data.exportedAt }
}

// 合并数据：last-write-wins，按 updatedAt 时间戳比较
// 本地记录 vs 远程记录，取 updatedAt 更新的那条
export function mergeData (localData, remoteData) {
  if (!remoteData) return localData
  if (!localData) return remoteData

  // 合并 users：远程优先（因为 users 不可变结构，且密码修改频率低）
  const userMap = new Map()
  for (const u of (localData.users || [])) userMap.set(u.username, u)
  for (const u of (remoteData.users || [])) {
    const existing = userMap.get(u.username)
    if (!existing) {
      userMap.set(u.username, u)
    } else {
      // 取密码/昵称更新的版本
      userMap.set(u.username, {
        ...existing,
        nickname: u.nickname || existing.nickname,
        password: u.password || existing.password
      })
    }
  }

  // 合并 payments：按 id 去重，updatedAt 更新的胜出
  // 软删除：如果某一端标记 deleted:true 且时间戳更新，删除优先
  const payMap = new Map()
  for (const p of (localData.payments || [])) {
    payMap.set(p.id, { ...p, _updatedAt: p.updatedAt || p.createdAt || '' })
  }
  for (const p of (remoteData.payments || [])) {
    const existing = payMap.get(p.id)
    const remoteUpdated = p.updatedAt || p.createdAt || ''
    if (!existing) {
      // 本地没有此记录，远程有：直接加入（包括远程标记为删除的）
      payMap.set(p.id, { ...p, _updatedAt: remoteUpdated })
    } else if (remoteUpdated > existing._updatedAt) {
      // 远程更新，取远程版本（可能是删除标记）
      payMap.set(p.id, { ...p, _updatedAt: remoteUpdated })
    }
    // 如果本地有删除标记且更新，保持本地的（即 existing，已经在 map 里了）
  }

  const payments = [...payMap.values()].map(({ _updatedAt, ...rest }) => rest)
  payments.sort((a, b) => (a.date || '').localeCompare(b.date || ''))

  return {
    app: 'repay-m03',
    version: 1,
    exportedAt: new Date().toISOString(),
    users: [...userMap.values()],
    payments
  }
}
