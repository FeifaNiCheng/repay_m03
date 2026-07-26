<template>
  <div class="stat-card glass" :class="tone">
    <div class="label">{{ label }}</div>
    <div class="value num">
      <BreathTip v-if="tip" :text="tip" placement="top">
        <span>{{ animated ? display : formatValue }}</span>
      </BreathTip>
      <span v-else>{{ animated ? display : formatValue }}</span>
    </div>
    <div v-if="suffix" class="suffix">{{ suffix }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { formatYuan } from '../utils/format.js'
import BreathTip from './BreathTip.vue'

const props = defineProps({
  label: String,
  value: { type: Number, default: 0 },
  tone: { type: String, default: '' }, // success / warn / accent
  animated: { type: Boolean, default: true },
  suffix: String,
  tip: { type: String, default: '' } // hover 呼吸提示文案
})

// 百分比类型不套用货币格式
const formatValue = computed(() => props.suffix ? String(Math.round(props.value)) : formatYuan(props.value))

const display = ref('0.00')
let raf = null

function animateTo (target) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) { display.value = props.suffix ? String(Math.round(target)) : formatYuan(target); return }
  const start = 0
  const duration = 800
  const startTime = performance.now()
  function tick (now) {
    const t = Math.min(1, (now - startTime) / duration)
    const eased = 1 - Math.pow(1 - t, 3)
    const current = start + (target - start) * eased
    display.value = props.suffix ? String(Math.round(current)) : formatYuan(current)
    if (t < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => animateTo(props.value))
watch(() => props.value, (v) => animateTo(v))
onUnmounted(() => { if (raf) cancelAnimationFrame(raf) })
</script>

<style scoped>
.stat-card { padding: var(--sp-4); min-height: 96px; display: flex; flex-direction: column; justify-content: center; }
.label { font-size: var(--fs-label); color: var(--ink-soft); margin-bottom: var(--sp-1); }
.value { font-size: var(--fs-display); font-weight: 700; line-height: 1.15; }
.suffix { font-size: var(--fs-meta); color: var(--ink-faint); margin-top: var(--sp-1); }
.success .value { color: var(--success); }
.warn .value { color: var(--warn); }
.accent .value { color: var(--accent); }
</style>
