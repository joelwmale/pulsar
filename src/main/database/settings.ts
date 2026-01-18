import { getDatabase } from './db'

export interface Setting {
  key: string
  value: string
  updated_at: string
}

/**
 * Get a setting value by key
 */
export function getSetting(key: string): string | null {
  const db = getDatabase()
  const result = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined
  return result?.value || null
}

/**
 * Get all settings as a key-value object
 */
export function getAllSettings(): Record<string, string> {
  const db = getDatabase()
  const rows = db.prepare('SELECT key, value FROM settings').all() as Setting[]

  const settings: Record<string, string> = {}
  for (const row of rows) {
    settings[row.key] = row.value
  }

  return settings
}

/**
 * Set a setting value
 */
export function setSetting(key: string, value: string): void {
  const db = getDatabase()
  db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, datetime('now', 'localtime'))
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at
  `).run(key, value)
}

/**
 * Get SMTP port from settings
 */
export function getSmtpPort(): number {
  const port = getSetting('smtp_port')
  return port ? parseInt(port, 10) : 2500
}

/**
 * Set SMTP port in settings
 */
export function setSmtpPort(port: number): void {
  setSetting('smtp_port', port.toString())
}
