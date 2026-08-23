<template>
  <AppShell>
    <div class="overview">
    <div class="stats">
      <StatCard label="总欠款" :value="total" :tip="`小鹏 MONA M03 Max，两人各付一半`" />
      <StatCard label="已还" :value="paid" tone="success" :tip="`已还 ¥${formatMoney(paid)}，占总额 ${(progress).toFixed(1)}%`" />
      <StatCard label="剩余" :value="remaining" tone="warn" :tip="remainingTip" />
      <StatCard label="进度" :value="progressNum" tone="accent" suffix="%" :tip="progressTip" />
    </div>
      <ProgressOverview
        :total="total"
        :paid="paid"
        :remaining="remaining"
        :progress="progress"
      />
    </div>
    <div class="recent glass">
      <div class="section-head">
        <span class="section-title">最近记录</span>
        <div class="section-actions">
          <button class="quick-add-btn" @click="openAdd">+ 新增</button>
          <router-link to="/payments" class="more">查看全部 -></router-link>
        </div>
      </div>
      <div v-if="recent.length === 0" class="empty">暂无还款记录</div>
      <div v-else>
        <div v-for="p in recent" :key="p.id" class="recent-row clickable" @click="goPayments">
          <div class="row-left">
            <span class="row-date">{{ formatTimeShort(p) }}</span>
          <span class="row-note">{{ p.note || '-' }}</span>
         </div>
         <div class="row-right">
           <span class="row-amount num" :class="{ 'amount-positive': p.amount > 0, 'amount-negative': p.amount < 0 }">¥{{ formatMoney(p.amount) }}</span>
           <span class="row-tag" :class="p.amount < 0 ? 'tag-expense' : 'tag-income'">{{ p.amount < 0 ? '支出' : '存入' }}</span>
           <span class="row-by">{{ p.createdBy }}</span>
         </div>
        </div>
      </div>
    </div>
    <PaymentModal
      :open="modalOpen"
      :record="null"
      :remaining="remaining"
      @close="modalOpen = false"
      @save="save"
    />
  </AppShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/AppShell.vue'
import StatCard from '../components/StatCard.vue'
import ProgressOverview from '../components/ProgressOverview.vue'
import PaymentModal from '../components/PaymentModal.vue'
import { useRepay } from '../stores/repay.js'
import { formatMoney, getSortTime, formatTimeShort } from '../utils/format.js'

const { state, total, paid, remaining, progress, loadPayments, addPayment } = useRepay()
const router = useRouter()

const modalOpen = ref(false)

function goPayments () { router.push('/payments') }

function openAdd () {
  modalOpen.value = true
}

async function save (data) {
  try {
    await addPayment(data)
    message.success('已添加')
    modalOpen.value = false
  } catch (e) {
    message.error('保存失败：' + e.message)
  }
}

const progressNum = computed(() => Math.round(progress.value))

// 进度提示：按区间给鼓励文案
const progressTip = computed(() => {
  const p = progress.value
  if (p >= 100) return '全部还清，恭喜你！'
  if (p >= 75) return '最后冲刺，快到终点了'
  if (p >= 50) return '过半了，下半场加速'
  if (p >= 25) return '已经过了四分之一，稳住'
  return '开了个好头，慢慢来'
})

// 剩余金额提示
const remainingTip = computed(() => {
  if (remaining.value < 10000) return `还剩不到一万，胜利在望`
  return `剩余 ¥${formatMoney(remaining.value)}，继续加油`
})

// 最近 5 条（倒序）
// 最近 5 条（倒序）
const recent = computed(() => {
  return [...state.payments].sort((a, b) => getSortTime(b).localeCompare(getSortTime(a))).slice(0, 5)
})

onMounted(loadPayments)
</script>

<style scoped>
.overview { display: flex; flex-direction: column; gap: var(--sp-4); margin-bottom: var(--sp-5); }
.stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--sp-3); }
.recent { padding: var(--sp-4); }
.section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-3); }
.section-title { font-size: var(--fs-title); font-weight: 600; }
.section-actions { display: flex; align-items: center; gap: var(--sp-3); }
.quick-add-btn {
  font-size: var(--fs-meta);
  padding: 5px 12px;
  border: none;
  border-radius: var(--r-btn);
  background: var(--accent);
  color: #fff;
  cursor: pointer;
  font-weight: 500;
  transition: all 180ms var(--ease);
}
.quick-add-btn:hover { transform: translateY(-1px); background: #409CFF; }
.more { font-size: var(--fs-meta); color: var(--accent); text-decoration: none; }
.more:hover { text-decoration: underline; }
.empty { text-align: center; color: var(--ink-faint); padding: 24px 0; font-size: var(--fs-meta); }
.recent-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: var(--sp-3) 0; border-bottom: 1px solid var(--divider);
}
.recent-row:last-child { border-bottom: none; }
.recent-row.clickable { cursor: pointer; transition: background 180ms var(--ease); }
.recent-row.clickable:hover { background: rgba(255,255,255,0.45); }
.row-left { display: flex; flex-direction: column; gap: 2px; }
.row-date { font-size: var(--fs-meta); color: var(--accent); font-weight: 600; }
.row-note { font-size: var(--fs-body); }
.row-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.row-amount { font-size: var(--fs-title); font-weight: 600; color: var(--success); }
.row-amount.amount-positive { color: var(--success); }
.row-amount.amount-negative { color: var(--danger); }
.row-tag { font-size: 10px; padding: 1px 6px; border-radius: 9999px; font-weight: 500; }
.tag-income { background: var(--success-soft); color: var(--success); }
.tag-expense { background: var(--danger-soft); color: var(--danger); }
.row-by { font-size: var(--fs-label); color: var(--ink-faint); }
@media (max-width: 767px) {
  .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
