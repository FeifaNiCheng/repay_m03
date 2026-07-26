<template>
  <span
    class="breath-wrap"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <slot />
    <transition name="breath">
      <span v-if="show" class="breath-bubble" :class="placement">
        {{ text }}
      </span>
    </transition>
  </span>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  // 延迟显示（毫秒），默认 300ms
  delay: { type: Number, default: 300 },
  // 弹出位置：top / bottom，默认 top
  placement: { type: String, default: 'top' }
})

const show = ref(false)
let timer = null

function onEnter () {
  timer = setTimeout(() => {
    show.value = true
  }, props.delay)
}

function onLeave () {
  if (timer) { clearTimeout(timer); timer = null }
  show.value = false
}

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.breath-wrap {
  position: relative;
  display: inline-flex;
  cursor: default;
}
/* 毛玻璃呼吸气泡 */
.breath-bubble {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  padding: 8px 14px;
  border-radius: 12px;
  background: var(--glass-strong);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid var(--glass-border);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  font-size: var(--fs-label);
  color: var(--ink-soft);
  white-space: nowrap;
  pointer-events: none;
}
.breath-bubble.top { bottom: calc(100% + 10px); }
.breath-bubble.bottom { top: calc(100% + 10px); }
/* 小三角 */
.breath-bubble::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
}
.breath-bubble.top::after {
  top: 100%;
  border-top: 6px solid var(--glass-strong);
}
.breath-bubble.bottom::after {
  bottom: 100%;
  border-bottom: 6px solid var(--glass-strong);
}
/* 淡入 + 呼吸缩放 */
.breath-enter-active {
  animation: breathIn 0.3s var(--ease) both;
}
.breath-leave-active {
  animation: breathIn 0.2s reverse var(--ease) both;
}
@keyframes breathIn {
  0% { opacity: 0; transform: translateX(-50%) scale(0.8); }
  100% { opacity: 1; transform: translateX(-50%) scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .breath-enter-active, .breath-leave-active {
    animation-duration: 0.01ms !important;
  }
}
</style>
