// 自动同步模块：打开时合并拉取 + 改数据后后台推送
// 推送队列：短时间多次改动不会同时发请求，排队一个个来

import { exportData, importData } from '../db/dao.js'
import { fetchFromGitee, pushToGitee, mergeData, isGiteeConfigured } from './gitee.js'

let pushQueue = Promise.resolve()
let isSyncingOnLoad = false

// 打开系统时调用：拉取远程 -> 合并到本地（不覆盖）
export async function syncOnLoad () {
  if (!isGiteeConfigured()) return
  if (isSyncingOnLoad) return
  isSyncingOnLoad = true
  try {
    const local = await exportData()
    const remote = await fetchFromGitee()
    if (!remote) {
      // 远程没有文件，把本地数据推上去
      await pushToGitee(local, undefined).catch(() => {})
      return
    }
    const merged = mergeData(local, remote.data)
    // 合并后如果有变化才写入本地
    const localJson = JSON.stringify(local)
    const mergedJson = JSON.stringify(merged)
    if (localJson !== mergedJson) {
      await importData(merged)
    }
    // 合并结果推送到远程，保持一致
    await pushToGitee(merged, remote.sha).catch(() => {})
  } catch (e) {
    // 静默失败，不阻断用户使用
    console.warn('打开时同步失败：', e.message)
  } finally {
    isSyncingOnLoad = false
  }
}

// 改数据后调用：排队推送（不阻塞界面）
export function backgroundPush () {
  if (!isGiteeConfigured()) return
  // 排队：前一个推送完成后才开始下一个
  pushQueue = pushQueue.then(async () => {
    try {
      const local = await exportData()
      // 推送前先拉一次 sha，避免冲突
      const remote = await fetchFromGitee().catch(() => null)
      // 合并远程数据，避免丢失其他设备的改动
      let toPush = local
      let sha = remote?.sha
      if (remote?.data) {
        toPush = mergeData(local, remote.data)
        sha = remote.sha
      }
      await pushToGitee(toPush, sha)
    } catch (e) {
      console.warn('后台推送失败：', e.message)
      // 失败不丢数据，下次操作时会重试
    }
  })
  return pushQueue
}
