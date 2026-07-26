<template>
  <transition name="fade">
    <div v-if="visible" class="milestone-overlay" @click="dismiss">
      <div class="milestone-card anim-milestone">
        <div class="milestone-icon">{{ emoji }}</div>
        <div class="milestone-title">{{ title }}</div>
        <div class="milestone-sub">{{ sub }}</div>
      </div>
      <div v-if="confetti" class="confetti-wrap">
        <span v-for="i in 60" :key="i" class="confetti" :style="confettiStyle(i)"></span>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  progress: Number, // 0-100
  remaining: Number
})

const visible = ref(false)
const title = ref('')
const sub = ref('')
const emoji = ref('')
const confetti = ref(false)

// 记录已触发过的里程碑，避免重复
const fired = ref(new Set())

watch(() => [props.progress, props.remaining], checkMilestone, { immediate: false })

function checkMilestone () {
  const p = props.progress
  const r = props.remaining
  if (p >= 100 && !fired.value.has('100')) {
    fired.value.add('100')
    trigger('🎉', '全部还清！', '你和对象的 M03 款项已结清', true)
  } else if (r > 0 && r < 10000 && !fired.value.has('10k')) {
    fired.value.add('10k')
    trigger('🔥', '还剩不到一万！', `剩余 ¥${r.toFixed(0)}，胜利在望`, false)
  } else if (p >= 75 && !fired.value.has('75')) {
    fired.value.add('75')
    trigger('🌟', '已过 75%', '最后冲刺阶段', false)
  } else if (p >= 50 && !fired.value.has('50')) {
    fired.value.add('50')
    trigger('💪', '已还过半', '进度过半，继续加油', false)
  } else if (p >= 25 && !fired.value.has('25')) {
    fired.value.add('25')
    trigger('✨', '已还 25%', '开了个好头', false)
  }
}

function trigger (em, t, s, gold) {
  emoji.value = em
  title.value = t
  sub.value = s
  confetti.value = gold
  visible.value = true
  if (gold) {
    setTimeout(() => dismiss(), 3000)
  } else {
    setTimeout(() => dismiss(), 2000)
  }
}

function dismiss () { visible.value = false }

function confettiStyle (i) {
  const left = Math.random() * 100
  const delay = Math.random() * 0.5
  const dur = 2 + Math.random()
  const color = ['#FFD60A', '#34C759', '#0A84FF', '#FF9500'][i % 4]
  return {
    left: left + '%',
    animationDelay: delay + 's',
    animationDuration: dur + 's',
    background: color
  }
}
</script>

<style scoped>
.milestone-overlay {
  position: fixed; inset: 0; z-index: 2000;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.2); backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.milestone-card {
  text-align: center; padding: 40px 56px;
  background: var(--glass-strong); border-radius: var(--r-card);
  box-shadow: 0 8px 40px rgba(0,0,0,0.15);
}
.milestone-icon { font-size: 48px; margin-bottom: 12px; }
.milestone-title { font-size: 22px; font-weight: 700; color: var(--ink); }
.milestone-sub { font-size: var(--fs-meta); color: var(--ink-soft); margin-top: 6px; }
.confetti-wrap { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.confetti {
  position: absolute; top: -10px; width: 8px; height: 8px; border-radius: 2px;
  animation: fall linear forwards;
}
@keyframes fall {
  0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
.fade-enter-active, .fade-leave-active { transition: opacity 200ms; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
