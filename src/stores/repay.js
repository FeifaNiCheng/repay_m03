import { reactive, computed, ref } from 'vue'
import * as dao from '../db/dao.js'
import { useAuth } from './auth.js'
import { syncFromRemote, schedulePush } from '../lib/autoSync.js'

// 总欠款固定
export const TOTAL_DEBT = 73500
let syncingPromise = null // 正在进行的同步 Promise，后续调用复用它

const state = reactive({
  payments: [],
  loading: false
})

// 里程碑触发信号：仅新增还款记录时判定跨越的节点
// 值结构 { key, ts }，ts 自增保证重复跨过同一节点也能触发
export const milestoneSignal = ref(null)
const signalSeq = ref(0)

// 里程碑节点：进度百分比阈值 -> key
// 从低到高，判定本次新增是否"跨越"该节点
const MILESTONES = [
  { key: '25', pct: 25 },
  { key: '50', pct: 50 },
  { key: '75', pct: 75 },
  { key: '100', pct: 100 }
]

// 剩余金额里程碑：剩余低于 10000 元触发一次
const REMAIN_UNDER_10K = '10k'

function checkMilestoneCrossing (beforeProgress, beforeRemaining, afterProgress, afterRemaining) {
  // 还清：优先级最高
  if (beforeProgress < 100 && afterProgress >= 100) return '100'
  // 剩余跌破一万
  if (beforeRemaining >= 10000 && afterRemaining < 10000) return REMAIN_UNDER_10K
  // 进度节点：取跨过的最高阈值
  let hit = null
  for (const m of MILESTONES) {
    if (beforeProgress < m.pct && afterProgress >= m.pct) hit = m.key
  }
  return hit
}

export function useRepay () {
  const { state: authState } = useAuth()

  const total = computed(() => TOTAL_DEBT)
  const paid = computed(() => state.payments.reduce((s, p) => s + Number(p.amount || 0), 0))
  const remaining = computed(() => TOTAL_DEBT - paid.value)
  const progress = computed(() => {
    if (TOTAL_DEBT <= 0) return 0
    return Math.min(100, Math.round((paid.value / TOTAL_DEBT) * 1000) / 10)
  })

  async function loadPayments () {
    state.loading = true
    state.payments = await dao.getAllPayments()
    state.loading = false
  }

  // 拉取 Gitee 远程数据合并到本地，再刷新内存
  // 多次调用会复用同一次远程拉取，等它完成后统一刷新内存
  async function syncAndLoad () {
    if (!syncingPromise) {
      syncingPromise = syncFromRemote().catch(() => {})
    }
    await syncingPromise
    syncingPromise = null
    await loadPayments()
  }

  async function addPayment (data) {
    // 新增前快照进度，新增后判定是否跨过里程碑（仅新增触发，编辑/删除/进系统都不弹）
    const beforeProgress = progress.value
    const beforeRemaining = remaining.value
    await dao.addPayment({ ...data, createdBy: authState.username })
    await loadPayments()
    schedulePush()
    const hit = checkMilestoneCrossing(beforeProgress, beforeRemaining, progress.value, remaining.value)
    if (hit) {
      signalSeq.value += 1
      milestoneSignal.value = { key: hit, ts: signalSeq.value }
    }
  }

  async function updatePayment (id, data) {
    await dao.updatePayment(id, data)
    await loadPayments()
    schedulePush()
  }

  async function deletePayment (id) {
    await dao.deletePayment(id)
    await loadPayments()
    schedulePush()
  }

 return { state, total, paid, remaining, progress, loadPayments, syncAndLoad, addPayment, updatePayment, deletePayment }
}
