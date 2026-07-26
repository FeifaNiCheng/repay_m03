<template>
  <div class="progress-card glass">
    <div class="progress-head">
      <span class="progress-label">还款进度</span>
      <span class="progress-pct num">{{ progress.toFixed(1) }}%</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill anim-breathe" :style="{ width: progress + '%' }"></div>
    </div>
    <div class="progress-foot">
      <span class="ink-faint">¥{{ formatMoney(paid) }} / ¥{{ formatMoney(total) }}</span>
      <span class="ink-faint">剩余 ¥{{ formatMoney(remaining) }}</span>
    </div>
  </div>
</template>

<script setup>
import { formatMoney } from '../utils/format.js'

defineProps({
  total: Number,
  paid: Number,
  remaining: Number,
  progress: Number
})
</script>

<style scoped>
.progress-card { padding: var(--sp-4); }
.progress-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--sp-3); }
.progress-label { font-size: var(--fs-meta); color: var(--ink-soft); }
.progress-pct { font-size: var(--fs-title); font-weight: 600; color: var(--accent); }
.progress-track {
  height: 10px; border-radius: 9999px; background: rgba(0,0,0,0.05);
  overflow: hidden; position: relative;
}
.progress-fill {
  height: 100%; border-radius: 9999px;
  background: linear-gradient(90deg, var(--accent), var(--success));
  transition: width 600ms var(--ease);
}
.progress-foot { display: flex; justify-content: space-between; margin-top: var(--sp-2); font-size: var(--fs-meta); }
.ink-faint { color: var(--ink-faint); }
</style>
