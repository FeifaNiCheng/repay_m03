<template>
  <AppShell>
    <div class="toolbar glass">
      <a-input
        v-model:value="search"
        placeholder="搜索备注..."
        allow-clear
        style="width: 200px"
      >
        <template #prefix><span class="search-ico">🔍</span></template>
      </a-input>
      <a-select v-model:value="monthFilter" style="width: 140px" placeholder="按月份筛选" allow-clear>
        <a-select-option v-for="m in months" :key="m" :value="m">{{ formatMonth(m) }}</a-select-option>
      </a-select>
      <a-button @click="toggleSort" class="sort-btn">
        {{ sortDesc ? '倒序 ↓' : '正序 ↑' }}
      </a-button>
      <div class="spacer"></div>
      <a-button type="primary" @click="openAdd">+ 新增记录</a-button>
    </div>

    <div class="list-area">
      <div v-for="group in grouped" :key="group.key" class="month-group">
        <div class="month-head glass">
          <span class="month-title">{{ formatMonth(group.key) }}</span>
          <span class="month-sub num">合计 ¥{{ formatMoney(group.total) }}</span>
        </div>
        <div
          v-for="p in group.items"
          :key="p.id"
          class="pay-row glass anim-row-in"
          :class="{ 'is-history': p.note && p.note.includes('历史合计') }"
        >
          <div class="row-main">
            <span class="row-date">{{ p.date }}</span>
            <span class="row-note">
              {{ p.note || '-' }}
              <span v-if="p.note && p.note.includes('历史合计')" class="badge-history">历史</span>
            </span>
          </div>
          <div class="row-amount-area">
            <span class="row-amount num">¥{{ formatMoney(p.amount) }}</span>
            <span class="row-by">{{ p.createdBy }}</span>
          </div>
          <div class="row-actions">
            <button class="icon-btn" @click="openEdit(p)">✎</button>
            <a-popconfirm title="确定删除？" @confirm="remove(p.id)">
              <button class="icon-btn danger">✕</button>
            </a-popconfirm>
          </div>
        </div>
      </div>
      <div v-if="filtered.length === 0" class="empty glass">没有匹配的记录</div>
    </div>

    <PaymentModal
      :open="modalOpen"
      :record="editingRecord"
      :remaining="remaining"
      @close="modalOpen = false"
      @save="save"
    />
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import AppShell from '../components/AppShell.vue'
import PaymentModal from '../components/PaymentModal.vue'
import { useRepay } from '../stores/repay.js'
import { formatMoney, formatMonth, getMonthKey } from '../utils/format.js'

const { state, remaining, loadPayments, addPayment, updatePayment, deletePayment } = useRepay()

const search = ref('')
const monthFilter = ref(undefined)
const sortDesc = ref(true)
const modalOpen = ref(false)
const editingRecord = ref(null)

// 过滤后的记录
const filtered = computed(() => {
  let list = [...state.payments]
  if (search.value.trim()) {
    const kw = search.value.trim().toLowerCase()
    list = list.filter(p => (p.note || '').toLowerCase().includes(kw))
  }
  if (monthFilter.value) {
    list = list.filter(p => getMonthKey(p.date) === monthFilter.value)
  }
  list.sort((a, b) => sortDesc.value ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date))
  return list
})

// 所有月份（用于筛选下拉）
const months = computed(() => {
  const set = new Set(state.payments.map(p => getMonthKey(p.date)))
  return [...set].sort().reverse()
})

// 按月分组
const grouped = computed(() => {
  const map = new Map()
  for (const p of filtered.value) {
    const key = getMonthKey(p.date)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(p)
  }
  return [...map.entries()].map(([key, items]) => ({
    key,
    items,
    total: items.reduce((s, p) => s + Number(p.amount || 0), 0)
  }))
})

function toggleSort () { sortDesc.value = !sortDesc.value }

function openAdd () {
  editingRecord.value = null
  modalOpen.value = true
}

function openEdit (p) {
  editingRecord.value = { ...p }
  modalOpen.value = true
}

async function save (data) {
  try {
    if (data.id) {
      await updatePayment(data.id, data)
      message.success('已更新')
    } else {
      await addPayment(data)
      message.success('已添加')
    }
    modalOpen.value = false
  } catch (e) {
    message.error('保存失败：' + e.message)
  }
}

async function remove (id) {
  try {
    await deletePayment(id)
    message.success('已删除')
  } catch (e) {
    message.error('删除失败：' + e.message)
  }
}

onMounted(loadPayments)
</script>

<style scoped>
.toolbar {
  display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3) var(--sp-4);
  margin-bottom: var(--sp-4); flex-wrap: wrap;
}
.search-ico { font-size: 12px; }
.spacer { flex: 1; }
.sort-btn { font-size: var(--fs-meta); }
.month-group { margin-bottom: var(--sp-5); }
.month-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: var(--sp-2) var(--sp-4); margin-bottom: var(--sp-2);
  font-size: var(--fs-meta); color: var(--ink-soft);
}
.month-title { font-weight: 600; }
.month-sub { color: var(--ink-faint); }
.pay-row {
  display: flex; align-items: center; padding: var(--sp-3) var(--sp-4);
  margin-bottom: var(--sp-2); position: relative; transition: all 180ms var(--ease);
}
.pay-row:hover { background: rgba(255,255,255,0.75); }
.pay-row.is-history::before {
  content: ''; position: absolute; left: 0; top: 12px; bottom: 12px; width: 3px;
  background: var(--warn); border-radius: 2px;
}
.row-main { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.row-date { font-size: var(--fs-meta); color: var(--ink-soft); }
.row-note { font-size: var(--fs-body); }
.badge-history {
  font-size: 10px; padding: 1px 6px; border-radius: 9999px;
  background: var(--warn-soft); color: var(--warn); margin-left: 4px;
}
.row-amount-area { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; margin-right: var(--sp-3); }
.row-amount { font-size: var(--fs-title); font-weight: 600; color: var(--success); }
.row-by { font-size: var(--fs-label); color: var(--ink-faint); }
.row-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 180ms var(--ease); }
.pay-row:hover .row-actions { opacity: 1; }
.icon-btn {
  width: 32px; height: 32px; border: none; border-radius: 8px;
  background: transparent; cursor: pointer; font-size: 14px; color: var(--ink-soft);
  transition: all 180ms var(--ease);
}
.icon-btn:hover { background: var(--accent-soft); color: var(--accent); }
.icon-btn.danger:hover { background: var(--warn-soft); color: var(--warn); }
.empty { text-align: center; color: var(--ink-faint); padding: 32px; font-size: var(--fs-meta); }
@media (max-width: 767px) {
  .row-actions { opacity: 1; }
}
</style>
