// 自动同步模块：页面加载时拉取，数据变更后立即推送
import { fetchFromGitee, pushToGitee, mergeData, isGiteeConfigured } from './gitee.js'
import { exportData, importData } from '../db/dao.js'

let pushQueue = Promise.resolve() // 推送队列：串行执行，避免并发冲突

// 页面加载时拉取远程数据并合并到本地
// 不覆盖本地，而是合并：本地独有的保留，远程更新的覆盖
// repay store 通过 syncingPromise 复用来避免并发重复请求
export async function syncFromRemote () {
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

// 数据变更后立即推送（排队串行执行，避免并发冲突）
export function schedulePush () {
  if (!isGiteeConfigured()) return
  pushQueue = pushQueue.then(async () => {
    try {
      const local = await exportData()
      // 先拿远程 sha（文件已存在时更新需要）
      const remote = await fetchFromGitee().catch(() => null)
      await pushToGitee(local, remote?.sha)
    } catch (e) {
      // 推送失败不影响使用，静默处理
      console.warn('[autoSync] 推送失败:', e.message)
    }
  })
}
