<template>
  <AppShell>
    <div class="overview">
      <div class="stats">
        <StatCard label="总欠款" :value="total" />
        <StatCard label="已还" :value="paid" tone="success" />
        <StatCard label="剩余" :value="remaining" tone="warn" />
        <StatCard label="进度" :value="progressNum" tone="accent" suffix="%" />
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
        <router-link to="/payments" class="more">查看全部 →</router-link>
      </div>
      <div v-if="recent.length === 0" class="empty">暂无还款记录</div>
      <div v-else>
        <div v-for="p in recent" :key="p.id" class="recent-row">
          <div class="row-left">
            <span class="row-date">{{ p.date }}</span>
            <span class="row-note">{{ p.note || '—' }}</span>
          </div>
          <div class="row-right">
            <span class="row-amount num">¥{{ formatMoney(p.amount) }}</span>
            <span class="row-by">{{ p.createdBy }}</span>
          </div>
        </div>
      </div>
    </div>
    <MilestoneToast :progress="progress" :remaining="remaining" />
  </AppShell>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import AppShell from '../components/AppShell.vue'
import StatCard from '../components/StatCard.vue'
import ProgressOverview from '../components/ProgressOverview.vue'
import MilestoneToast from '../components/MilestoneToast.vue'
import { useRepay } from '../stores/repay.js'
import { formatMoney } from '../utils/format.js'

const { state, total, paid, remaining, progress, loadPayments } = useRepay()

const progressNum = computed(() => Math.round(progress.value))

// 最近 5 条（倒序）
const recent = computed(() => {
  return [...state.payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
})

onMounted(loadPayments)
</script>

<style scoped>
.overview { display: flex; flex-direction: column; gap: var(--sp-4); margin-bottom: var(--sp-5); }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-3); }
.recent { padding: var(--sp-4); }
.section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-3); }
.section-title { font-size: var(--fs-title); font-weight: 600; }
.more { font-size: var(--fs-meta); color: var(--accent); text-decoration: none; }
.more:hover { text-decoration: underline; }
.empty { text-align: center; color: var(--ink-faint); padding: 24px 0; font-size: var(--fs-meta); }
.recent-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: var(--sp-3) 0; border-bottom: 1px solid var(--divider);
}
.recent-row:last-child { border-bottom: none; }
.row-left { display: flex; flex-direction: column; gap: 2px; }
.row-date { font-size: var(--fs-meta); color: var(--ink-soft); }
.row-note { font-size: var(--fs-body); }
.row-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.row-amount { font-size: var(--fs-title); font-weight: 600; color: var(--success); }
.row-by { font-size: var(--fs-label); color: var(--ink-faint); }
@media (max-width: 767px) {
  .stats { grid-template-columns: repeat(2, 1fr); }
}
</style>
