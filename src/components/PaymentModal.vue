<template>
  <a-modal
    :open="open"
    :title="editing ? '编辑还款记录' : '新增还款记录'"
    @cancel="$emit('close')"
    @ok="submit"
    okText="保存"
    cancelText="取消"
    :width="420"
  >
    <div class="form-area">
      <div class="form-row">
        <label>日期 <span class="req">*</span></label>
        <a-date-picker
          v-model:value="form.date"
          format="YYYY-MM-DD"
          valueFormat="YYYY-MM-DD"
          style="width:100%"
          :allowClear="false"
        />
      </div>
      <div class="form-row">
        <label>金额（元）<span class="req">*</span></label>
        <a-input
          ref="amountInput"
          v-model:value="form.amount"
          type="number"
          placeholder="请输入还款金额"
          @pressEnter="submit"
        />
        <div v-if="amountError" class="err">{{ amountError }}</div>
      </div>
      <div class="form-row">
        <label>备注</label>
        <a-input v-model:value="form.note" placeholder="可选，如：工资上缴" />
        <div class="quick-tags">
          <span
            v-for="tag in quickTags"
            :key="tag"
            class="quick-tag"
            @click="form.note = tag"
          >{{ tag }}</span>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch, nextTick, computed } from 'vue'
import { message } from 'ant-design-vue'
import { validateAmount } from '../utils/validator.js'

const props = defineProps({
  open: Boolean,
  record: Object,
  remaining: Number
})
const emit = defineEmits(['close', 'save'])

const quickTags = ['工资上缴', '微信转账', '支付宝', '现金']

const form = reactive({ date: '', amount: '', note: '' })
const editing = ref(false)
const amountInput = ref(null)

const amountError = computed(() => {
  if (form.amount === '') return ''
  // 编辑时，当前记录的金额已在 paid 中，校验上限要加回原金额
  const effectiveRemaining = editing.value
    ? props.remaining + Number(props.record?.amount || 0)
    : props.remaining
  return validateAmount(form.amount, effectiveRemaining)
})

watch(() => props.open, (v) => {
  if (v) {
    if (props.record) {
      editing.value = true
      form.date = props.record.date
      form.amount = String(props.record.amount)
      form.note = props.record.note || ''
    } else {
      editing.value = false
      form.date = new Date().toISOString().slice(0, 10)
      form.amount = ''
      form.note = ''
      // 新增时自动聚焦金额
      nextTick(() => amountInput.value?.focus())
    }
  }
})

function submit () {
  const effectiveRemaining = editing.value
    ? props.remaining + Number(props.record?.amount || 0)
    : props.remaining
  const err = validateAmount(form.amount, effectiveRemaining)
  if (err) { message.error(err); return }
  if (!form.date) { message.error('请选择日期'); return }
  emit('save', {
    id: props.record?.id,
    date: form.date,
    amount: Number(form.amount),
    note: form.note
  })
}
</script>

<style scoped>
.form-area { padding: 4px 0; }
.form-row { margin-bottom: var(--sp-4); }
.form-row label { display: block; font-size: var(--fs-meta); color: var(--ink-soft); margin-bottom: var(--sp-2); }
.req { color: var(--warn); }
.quick-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: var(--sp-2); }
.quick-tag {
  font-size: var(--fs-label); padding: 4px 10px; border-radius: 9999px;
  background: var(--accent-soft); color: var(--accent); cursor: pointer;
  transition: all 180ms var(--ease);
}
.quick-tag:hover { transform: translateY(-1px); }
.err { font-size: var(--fs-label); color: var(--warn); margin-top: 4px; }
</style>
