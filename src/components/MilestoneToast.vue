<template>
  <Transition name="milestone">
    <div v-if="visible" class="milestone-toast glass-strong anim-milestone" @click="dismiss">
      <div class="ms-icon">{{ icon }}</div>
      <div class="ms-body">
        <div class="ms-title">{{ title }}</div>
        <div class="ms-desc">{{ desc }}</div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { formatMoney } from '../utils/format.js'

const props = defineProps({
  progress: { type: Number, default: 0 },
  remaining: { type: Number, default: 0 }
})

const visible = ref(false)
const title = ref('')
const desc = ref('')
const icon = ref('')

// 里程碑定义：达到 25%/50%/75%/90%/100% 时弹出提醒
const milestones = [
  { threshold: 25, icon: '\U0001F331', title: '已还四分之一', desc: '开了个好头，稳住节奏' },
  { threshold: 50, icon: '\U0001F525', title: '进度过半', desc: '下半场加速，胜利在望' },
  { threshold: 75, icon: '\u26A1', title: '最后冲刺', desc: '只剩四分之一了，快到终点' },
  { threshold: 90, icon: '\U0001F3AF', title: '九十达阵', desc: '只差最后一步，冲就完了' },
  { threshold: 100, icon: '\U0001F389', title: '全部还清', desc: '恭喜！M03 完完全全属于你了' }
]

let lastShown = -1

function check () {
  const p = props.progress
  for (let i = milestones.length - 1; i >= 0; i--) {
    const m = milestones[i]
    if (p >= m.threshold && i > lastShown) {
      lastShown = i
      title.value = m.title
      desc.value = m.threshold >= 100 ? m.desc : m.desc + '，剩余 ¥' + formatMoney(props.remaining)
      icon.value = m.icon
      visible.value = true
      setTimeout(function () { visible.value = false }, 5000)
      return
    }
  }
}

function dismiss () {
  visible.value = false
}

watch(function () { return props.progress }, check, { immediate: true })
</script>

<style scoped>
.milestone-toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 12px;
  padding: 14px 22px; z-index: 1000; cursor: pointer; max-width: 90vw;
}
.ms-icon { font-size: 28px; line-height: 1; }
.ms-title { font-size: 15px; font-weight: 600; }
.ms-desc { font-size: 12px; color: var(--ink-soft); margin-top: 2px; }
.milestone-enter-active, .milestone-leave-active { transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1); }
.milestone-enter-from { opacity: 0; transform: translateX(-50%) translateY(20px); }
.milestone-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }
</style>
