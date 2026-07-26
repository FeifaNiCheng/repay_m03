<template>
  <AppShell>
    <div class="settings-grid">
      <!-- 账户信息 -->
      <div class="glass card">
        <div class="card-title">账户信息</div>
        <div v-for="u in users" :key="u.username" class="user-row">
          <div class="user-info">
            <span class="user-name">{{ u.username }}</span>
            <span class="user-nick">{{ u.nickname }}</span>
            <span v-if="u.username === state.username" class="me">当前登录</span>
          </div>
          <a-button size="small" @click="openNickModal(u)" :disabled="u.username === 'admin' && false">改昵称</a-button>
        </div>
      </div>

      <!-- 修改密码 -->
      <div class="glass card">
        <div class="card-title">修改密码</div>
        <div class="form-row">
          <label>当前密码</label>
          <a-input-password v-model:value="pwdForm.old" />
        </div>
        <div class="form-row">
          <label>新密码</label>
          <a-input-password v-model:value="pwdForm.new" />
        </div>
        <div class="form-row">
          <label>确认新密码</label>
          <a-input-password v-model:value="pwdForm.confirm" />
        </div>
        <a-button type="primary" @click="changePwd">保存密码</a-button>
      </div>

      <!-- 数据管理 -->
      <div class="glass card">
        <div class="card-title">数据管理</div>
       <p class="hint">数据存储在本地浏览器（IndexedDB），可导出为 JSON 备份，用于跨设备迁移。</p>
        <div class="btn-group">
          <a-button @click="doExport">导出备份</a-button>
          <a-upload :showUploadList="false" :before-upload="doImport" accept=".json">
            <a-button>导入备份</a-button>
          </a-upload>
        </div>
      </div>
      <!-- Gitee 云同步 -->
      <div class="glass card">
        <div class="card-title">云同步</div>
        <p class="hint">
          仓库：{{ giteeConfig.owner }}/{{ giteeConfig.repo }}<br/>
          路径：{{ giteeConfig.path }}
        </p>
        <p v-if="!giteeConfig.configured" class="hint warn-text">Gitee 未配置，请联系管理员检查内置配置。</p>
        <div v-if="syncStatus" class="sync-status">{{ syncStatus }}</div>
       <div class="btn-group">
         <a-button type="primary" :loading="syncing" @click="doSync">双向同步</a-button>
         <a-button :loading="syncing" @click="doPullOnly">仅拉取</a-button>
         <a-button :loading="syncing" @click="doPushOnly">仅推送</a-button>
         <a-button :loading="syncing" @click="doPurgeDeleted">清理已删记录</a-button>
       </div>
      </div>
    </div>

    <!-- 昵称编辑弹窗 -->
    <a-modal v-model:open="nickModalOpen" title="修改昵称" @ok="saveNick" okText="保存" cancelText="取消">
      <a-input v-model:value="nickForm.nickname" placeholder="输入新昵称" />
    </a-modal>
  </AppShell>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import AppShell from '../components/AppShell.vue'
import { useAuth } from '../stores/auth.js'
import { useRepay } from '../stores/repay.js'
import { getAllUsers, updateNickname, updatePassword, exportData, importData, purgeDeletedPayments } from '../db/dao.js'
import { isGiteeConfigured, getGiteeConfig, fetchFromGitee, pushToGitee, mergeData } from '../lib/gitee.js'
import { schedulePush } from '../lib/autoSync.js'

const { state } = useAuth()
const { loadPayments } = useRepay()

const users = ref([])
const nickModalOpen = ref(false)
const nickForm = reactive({ username: '', nickname: '' })
const pwdForm = reactive({ old: '', new: '', confirm: '' })
const syncing = ref(false)
const syncStatus = ref('')
const giteeConfig = ref(getGiteeConfig())

async function loadUsers () {
  users.value = await getAllUsers()
}

function openNickModal (u) {
  nickForm.username = u.username
  nickForm.nickname = u.nickname
  nickModalOpen.value = true
}

async function saveNick () {
  if (!nickForm.nickname.trim()) { message.error('昵称不能为空'); return }
  await updateNickname(nickForm.username, nickForm.nickname.trim())
  if (nickForm.username === state.username) {
    // 更新本地登录态昵称
    localStorage.setItem('repay_nick', nickForm.nickname.trim())
    state.nickname = nickForm.nickname.trim()
  }
  message.success('昵称已更新')
  nickModalOpen.value = false
  await loadUsers()
  schedulePush()
}

async function changePwd () {
  if (!pwdForm.old || !pwdForm.new) { message.error('请填写完整'); return }
  if (pwdForm.new !== pwdForm.confirm) { message.error('两次新密码不一致'); return }
  if (pwdForm.new.length < 6) { message.error('新密码至少 6 位'); return }
  const ok = await updatePassword(state.username, pwdForm.old, pwdForm.new)
  if (!ok) { message.error('当前密码错误'); return }
  message.success('密码已修改')
  pwdForm.old = ''
  pwdForm.new = ''
  pwdForm.confirm = ''
  schedulePush()
}

async function doExport () {
  const data = await exportData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `repay-m03-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  message.success('已导出备份文件')
}

async function doImport (file) {
  try {
    const text = await file.text()
    const json = JSON.parse(text)
    const result = await importData(json)
    message.success(`已导入：${result.users} 个账户，${result.payments} 条记录`)
    await loadUsers()
    await loadPayments()
  } catch (e) {
    message.error('导入失败：' + e.message)
  }
  return false // 阻止 antd 默认上传
}

// Gitee 双向同步：拉取 -> 合并 -> 写入本地 -> 推送
async function doSync () {
  if (!isGiteeConfigured()) { message.error('Gitee 未配置，请检查内置配置'); return }
  syncing.value = true
  syncStatus.value = '正在拉取远程数据...'
  try {
    const local = await exportData()
    const remote = await fetchFromGitee()
    syncStatus.value = '正在合并...'
    const merged = mergeData(local, remote?.data || null)
    await importData(merged)
    syncStatus.value = '正在推送...'
    await pushToGitee(merged, remote?.sha)
    await loadUsers()
    await loadPayments()
    message.success('同步完成')
  } catch (e) {
    message.error('同步失败：' + e.message)
  } finally {
    syncStatus.value = ''
    syncing.value = false
  }
}

// 仅从远程拉取（不推送）
async function doPullOnly () {
  if (!isGiteeConfigured()) { message.error('Gitee 未配置'); return }
  syncing.value = true
  syncStatus.value = '正在拉取远程数据...'
  try {
    const remote = await fetchFromGitee()
    if (!remote) { message.warning('远程暂无数据'); return }
    await importData(remote.data)
    await loadUsers()
    await loadPayments()
    message.success('已拉取远程数据')
  } catch (e) {
    message.error('拉取失败：' + e.message)
  } finally {
    syncStatus.value = ''
    syncing.value = false
  }
}

// 仅推送到远程（不拉取）
async function doPushOnly () {
  if (!isGiteeConfigured()) { message.error('Gitee 未配置'); return }
  syncing.value = true
  syncStatus.value = '正在推送本地数据...'
  try {
    const local = await exportData()
    const remote = await fetchFromGitee().catch(() => null)
    syncStatus.value = '正在写入远程...'
    await pushToGitee(local, remote?.sha)
    message.success('已推送本地数据到远程')
  } catch (e) {
    message.error('推送失败：' + e.message)
  } finally {
    syncStatus.value = ''
    syncing.value = false
  }
}

onMounted(loadUsers)

// 清理已删记录：物理删除本地 deleted:true 的记录，再推送覆盖远程
async function doPurgeDeleted () {
  if (!isGiteeConfigured()) { message.error("Gitee 未配置"); return }
  syncing.value = true
  syncStatus.value = "正在清理已删记录..."
  try {
    const count = await purgeDeletedPayments()
    syncStatus.value = "正在推送清理后的数据..."
    const local = await exportData()
    const remote = await fetchFromGitee().catch(() => null)
    await pushToGitee(local, remote?.sha)
    await loadPayments()
    message.success(count > 0 ? `已清理 ${count} 条已删记录并同步到远程` : "没有需要清理的记录，已同步远程")
  } catch (e) {
    message.error("清理失败：" + e.message)
  } finally {
    syncStatus.value = ""
    syncing.value = false
  }
}
</script>

<style scoped>
.settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); }
.card { padding: var(--sp-4); }
.card-title { font-size: var(--fs-title); font-weight: 600; margin-bottom: var(--sp-4); }
.user-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: var(--sp-3) 0; border-bottom: 1px solid var(--divider);
}
.user-row:last-child { border-bottom: none; }
.user-info { display: flex; align-items: center; gap: var(--sp-2); }
.user-name { font-weight: 600; }
.user-nick { color: var(--ink-soft); font-size: var(--fs-meta); }
.me { font-size: 10px; padding: 1px 6px; border-radius: 9999px; background: var(--accent-soft); color: var(--accent); }
.form-row { margin-bottom: var(--sp-3); }
.form-row label { display: block; font-size: var(--fs-meta); color: var(--ink-soft); margin-bottom: var(--sp-2); }
.hint { font-size: var(--fs-meta); color: var(--ink-soft); margin-bottom: var(--sp-4); line-height: 1.6; }
.warn-text { color: var(--warn); }
.sync-status { font-size: var(--fs-meta); color: var(--accent); margin-bottom: var(--sp-3); }
.btn-group { display: flex; gap: var(--sp-3); flex-wrap: wrap; }
@media (max-width: 767px) {
  .settings-grid { grid-template-columns: 1fr; }
}
</style>
