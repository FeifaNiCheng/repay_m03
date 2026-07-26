// 自动同步模块：页面加载时拉取，数据变更后防抖推送
import { fetchFromGitee, pushToGitee, mergeData, isGiteeConfigured } from './gitee.js'
import { exportData, importData } from '../db/dao.js'

let pushTimer = null
const PUSH_DEBOUNCE = 4000 // 4 秒防抖

// 页面加载时拉取远程数据并合并到本地
// 不覆盖本地，而是合并：本地独有的保留，远程更新的覆盖
export async function syncOnLoad () {
  if (!isGiteeConfigured()) return
  try {
    const local = await exportData()
    const remote = await fetchFromGitee()
    // 远程没有数据，说明是首次使用，不需要拉取
    if (!remote) return
    // 合并远程和本地数据（不丢本地记录）
    const merged = mergeData(local, remote.data)
    await importData(merged)
  } catch (e) {
    // 拉取失败不影响使用，静默处理
    console.warn('[autoSync] 拉取失败:', e.message)
  }
}

// 数据变更后防抖推送
// 多次快速操作只推送一次
export function schedulePush () {
  if (!isGiteeConfigured()) return
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(async () => {
    pushTimer = null
    try {
      const local = await exportData()
      // 先拿远程 sha（文件已存在时更新需要）
      const remote = await fetchFromGitee().catch(() => null)
      await pushToGitee(local, remote?.sha)
    } catch (e) {
      // 推送失败不影响使用，静默处理
      console.warn('[autoSync] 推送失败:', e.message)
    }
  }, PUSH_DEBOUNCE)
}
