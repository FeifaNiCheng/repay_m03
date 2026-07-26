import { reactive, computed } from 'vue'
import * as dao from '../db/dao.js'
import { useAuth } from './auth.js'

// 总欠款固定
export const TOTAL_DEBT = 73500

const state = reactive({
  payments: [],
  loading: false
})

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

  async function addPayment (data) {
    await dao.addPayment({ ...data, createdBy: authState.username })
    await loadPayments()
  }

  async function updatePayment (id, data) {
    await dao.updatePayment(id, data)
    await loadPayments()
  }

  async function deletePayment (id) {
    await dao.deletePayment(id)
    await loadPayments()
  }

  return { state, total, paid, remaining, progress, loadPayments, addPayment, updatePayment, deletePayment }
}
