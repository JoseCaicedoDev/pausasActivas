import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { BreakSession, DailyRecord } from '@/types/session'

interface PausasActivasDB extends DBSchema {
  'break-sessions': {
    key: string
    value: BreakSession
    indexes: {
      'by-date': string
    }
  }
  'daily-records': {
    key: string
    value: DailyRecord
  }
}

let dbInstance: IDBPDatabase<PausasActivasDB> | null = null

export async function getDB(): Promise<IDBPDatabase<PausasActivasDB>> {
  if (dbInstance) return dbInstance
  dbInstance = await openDB<PausasActivasDB>('pausas-activas-db', 1, {
    upgrade(db) {
      const sessionStore = db.createObjectStore('break-sessions', { keyPath: 'id' })
      sessionStore.createIndex('by-date', 'date')
      db.createObjectStore('daily-records', { keyPath: 'date' })
    },
  })
  return dbInstance
}

export async function saveSession(session: BreakSession): Promise<void> {
  const db = await getDB()
  await db.put('break-sessions', session)
  await updateDailyRecord(db, session.date)
}

export async function getSessionsByDate(date: string): Promise<BreakSession[]> {
  const db = await getDB()
  return db.getAllFromIndex('break-sessions', 'by-date', date)
}

export async function getDailyRecord(date: string): Promise<DailyRecord | undefined> {
  const db = await getDB()
  return db.get('daily-records', date)
}

export async function getDailyRecords(from: string, to: string): Promise<DailyRecord[]> {
  const db = await getDB()
  const range = IDBKeyRange.bound(from, to)
  return db.getAll('daily-records', range)
}

async function updateDailyRecord(db: IDBPDatabase<PausasActivasDB>, date: string): Promise<void> {
  const sessions = await db.getAllFromIndex('break-sessions', 'by-date', date)
  const started = sessions.length
  const completed = sessions.filter(s => s.completed).length

  const existing = await db.get('daily-records', date)
  const expected = existing?.sessionsExpected ?? 4

  const record: DailyRecord = {
    date,
    sessionsExpected: expected,
    sessionsStarted: started,
    sessionsCompleted: completed,
    compliancePercent: expected > 0 ? Math.round((completed / expected) * 100) : 0,
    sessions,
  }
  await db.put('daily-records', record)
}

export async function setExpectedSessions(date: string, expected: number): Promise<void> {
  const db = await getDB()
  const existing = await db.get('daily-records', date)
  if (existing) {
    existing.sessionsExpected = expected
    existing.compliancePercent = expected > 0
      ? Math.round((existing.sessionsCompleted / expected) * 100)
      : 0
    await db.put('daily-records', existing)
  } else {
    await db.put('daily-records', {
      date,
      sessionsExpected: expected,
      sessionsStarted: 0,
      sessionsCompleted: 0,
      compliancePercent: 0,
      sessions: [],
    })
  }
}
