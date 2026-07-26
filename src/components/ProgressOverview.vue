<template>
  <div class="progress-card glass">
    <div class="progress-head">
      <span class="progress-label">还款进度</span>
      <span class="progress-pct num">{{ pct.toFixed(1) }}%</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill anim-breathe" :style="{ width: width + '%' }"></div>
    </div>
    <div class="progress-foot">
      <span class="ink-faint">¥{{ formatMoney(paid) }} / ¥{{ formatMoney(total) }}</span>
      <span class="ink-faint">剩余 ¥{{ formatMoney(remaining) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { formatMoney } from '../utils/format.js'

const props = defineProps({
  total: Number,
  paid: Number,
  remaining: Number,
  progress: Number
})

// 动态渲染：宽度与百分比均从 0 用 rAF 缓动到目标值
// 与 StatCard 的 count-up 保持一致的节奏（800ms ease-out-cubic）
const width = ref(0)
const pct = ref(0)
let raf = null

function animateTo (target) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) {
    width.value = target
    pct.value = target
    return
  }
  const start = width.value
  const duration = 800
  const startTime = performance.now()
  function tick (now) {
    const t = Math.min(1, (now - startTime) / duration)
    const eased = 1 - Math.pow(1 - t, 3)
    const current = start + (target - start) * eased
    width.value = current
    pct.value = current
    if (t < 1) raf = requestAnimationFrame(tick)
  }
  if (raf) cancelAnimationFrame(raf)
  raf = requestAnimationFrame(tick)
}

onMounted(() => animateTo(props.progress))
watch(() => props.progress, (v) => animateTo(v))
onUnmounted(() => { if (raf) cancelAnimationFrame(raf) })
</script>

<style scoped>
.progress-card { padding: var(--sp-4); }
.progress-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--sp-3); }
.progress-label { font-size: var(--fs-meta); color: var(--ink-soft); }
.progress-pct { font-size: var(--fs-title); font-weight: 600; color: var(--accent); font-variant-numeric: tabular-nums; }
.progress-track {
  height: 10px; border-radius: 9999px; background: rgba(0,0,0,0.05);
  overflow: hidden; position: relative;
}
.progress-fill {
  height: 100%; border-radius: 9999px;
  background: linear-gradient(90deg, var(--accent), var(--success));
  will-change: width;
}
.progress-foot { display: flex; justify-content: space-between; margin-top: var(--sp-2); font-size: var(--fs-meta); }
.ink-faint { color: var(--ink-faint); }
</style>
