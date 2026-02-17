import { apiRequest } from './apiClient'
import type { BreakSession, DailyRecord } from '@/types/session'
import type { SessionCompletePayload, SessionCreatePayload } from '@/services/contracts/history'

export async function createSession(payload: SessionCreatePayload): Promise<BreakSession> {
  return apiRequest<BreakSession>('/history/sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function completeSessionById(
  sessionId: string,
  payload: SessionCompletePayload,
): Promise<BreakSession> {
  return apiRequest<BreakSession>(`/history/sessions/${sessionId}/complete`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function getSessionsByDate(date: string): Promise<BreakSession[]> {
  return apiRequest<BreakSession[]>(`/history/sessions?from=${date}&to=${date}`, { method: 'GET' })
}

export async function getDailyRecord(date: string): Promise<DailyRecord | undefined> {
  const records = await apiRequest<DailyRecord[]>(`/history/daily-records?from=${date}&to=${date}`, { method: 'GET' })
  return records[0]
}

export async function getDailyRecords(from: string, to: string): Promise<DailyRecord[]> {
  return apiRequest<DailyRecord[]>(`/history/daily-records?from=${from}&to=${to}`, { method: 'GET' })
}

export async function setExpectedSessions(date: string, expected: number): Promise<void> {
  await apiRequest<void>(`/history/daily-records/${date}/expected`, {
    method: 'PUT',
    body: JSON.stringify({ sessionsExpected: expected }),
  })
}
