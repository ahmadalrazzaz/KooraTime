import { LocalSession } from '@/types'

const SESSION_KEY = 'kooratime_active_session'
const PLAYERS_KEY = 'kooratime_players'
const SESSIONS_HISTORY_KEY = 'kooratime_sessions_history'

export function saveActiveSession(data: LocalSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save session to localStorage', e)
  }
}

export function loadActiveSession(): LocalSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearActiveSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function saveToHistory(data: LocalSession): void {
  try {
    const history = loadHistory()
    const idx = history.findIndex(s => s.session.id === data.session.id)
    if (idx >= 0) history[idx] = data
    else history.unshift(data)
    localStorage.setItem(SESSIONS_HISTORY_KEY, JSON.stringify(history.slice(0, 50)))
  } catch (e) {
    console.error('Failed to save history', e)
  }
}

export function loadHistory(): LocalSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function deleteFromHistory(sessionId: string): void {
  try {
    const history = loadHistory().filter(s => s.session.id !== sessionId)
    localStorage.setItem(SESSIONS_HISTORY_KEY, JSON.stringify(history))
  } catch {}
}

export function savePlayers(players: unknown[]): void {
  try {
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(players))
  } catch {}
}

export function loadPlayers(): unknown[] {
  try {
    const raw = localStorage.getItem(PLAYERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
