import { getDatabase } from './db'
import type { Mailbox } from '../../types'

/**
 * Get or create a mailbox for the given username (lazy creation)
 */
export function getOrCreateMailbox(username: string): Mailbox {
  const db = getDatabase()

  // Try to get existing mailbox
  const existing = db
    .prepare('SELECT * FROM mailboxes WHERE username = ?')
    .get(username) as Mailbox | undefined

  if (existing) {
    return existing
  }

  // Create new mailbox
  const result = db
    .prepare('INSERT INTO mailboxes (username, email_count) VALUES (?, 0)')
    .run(username)

  const newMailbox = db
    .prepare('SELECT * FROM mailboxes WHERE id = ?')
    .get(result.lastInsertRowid) as Mailbox

  console.log(`Created new mailbox: ${username}`)

  return newMailbox
}

/**
 * Get all mailboxes with their email counts
 */
export function getMailboxes(): Mailbox[] {
  const db = getDatabase()

  const mailboxes = db
    .prepare(`
      SELECT
        m.id,
        m.username,
        m.created_at,
        COUNT(e.id) as email_count
      FROM mailboxes m
      LEFT JOIN emails e ON m.id = e.mailbox_id
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `)
    .all() as Mailbox[]

  return mailboxes
}

/**
 * Get a single mailbox by ID
 */
export function getMailbox(id: number): Mailbox | undefined {
  const db = getDatabase()

  return db
    .prepare('SELECT * FROM mailboxes WHERE id = ?')
    .get(id) as Mailbox | undefined
}

/**
 * Increment email count for a mailbox
 */
export function incrementEmailCount(mailboxId: number): void {
  const db = getDatabase()

  db.prepare('UPDATE mailboxes SET email_count = email_count + 1 WHERE id = ?')
    .run(mailboxId)
}
