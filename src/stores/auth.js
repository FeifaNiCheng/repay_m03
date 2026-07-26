import { reactive } from 'vue'

// 登录状态（轻量 reactive，无 Pinia）
const state = reactive({
  username: localStorage.getItem('repay_user') || '',
  nickname: localStorage.getItem('repay_nick') || ''
})

export function useAuth () {
  function setUser (username, nickname) {
    state.username = username
    state.nickname = nickname
    localStorage.setItem('repay_user', username)
    localStorage.setItem('repay_nick', nickname)
  }

  function clearUser () {
    state.username = ''
    state.nickname = ''
    localStorage.removeItem('repay_user')
    localStorage.removeItem('repay_nick')
  }

  return { state, setUser, clearUser }
}
