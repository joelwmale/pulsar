import { getDatabase } from './db'
import type { Email, EmailDetail, ParsedAttachment } from '../../types'

export interface SaveEmailData {
  mailboxId: number
  messageId?: string
  from: string
  to: string
  subject?: string
  text?: string
  html?: string
  rawHeaders: string
  rawSource: string
  hasAttachments: boolean
}

/**
 * Save a new email to the database
 */
export function saveEmail(data: SaveEmailData): number {
  const db = getDatabase()

  const result = db
    .prepare(`
      INSERT INTO emails (
        mailbox_id,
        message_id,
        from_address,
        to_address,
        subject,
        text_content,
        html_content,
        raw_headers,
        raw_source,
        has_attachments,
        is_read
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `)
    .run(
      data.mailboxId,
      data.messageId || null,
      data.from,
      data.to,
      data.subject || null,
      data.text || null,
      data.html || null,
      data.rawHeaders,
      data.rawSource,
      data.hasAttachments ? 1 : 0
    )

  console.log(`Saved email ${result.lastInsertRowid} to mailbox ${data.mailboxId}`)

  return result.lastInsertRowid as number
}

/**
 * Save attachments for an email
 */
export function saveAttachments(emailId: number, attachments: ParsedAttachment[]): void {
  if (attachments.length === 0) return

  const db = getDatabase()

  const stmt = db.prepare(`
    INSERT INTO attachments (email_id, filename, content_type, size, content)
    VALUES (?, ?, ?, ?, ?)
  `)

  const transaction = db.transaction((attachments: ParsedAttachment[]) => {
    for (const attachment of attachments) {
      stmt.run(
        emailId,
        attachment.filename,
        attachment.contentType || null,
        attachment.size,
        attachment.content
      )
    }
  })

  transaction(attachments)

  console.log(`Saved ${attachments.length} attachments for email ${emailId}`)
}

/**
 * Get all emails for a mailbox
 */
export function getEmails(mailboxId: number): Email[] {
  const db = getDatabase()

  return db
    .prepare(`
      SELECT * FROM emails
      WHERE mailbox_id = ?
      ORDER BY received_at DESC
    `)
    .all(mailboxId) as Email[]
}

/**
 * Get a single email with its attachments
 */
export function getEmail(emailId: number): EmailDetail | undefined {
  const db = getDatabase()

  const email = db
    .prepare('SELECT * FROM emails WHERE id = ?')
    .get(emailId) as Email | undefined

  if (!email) return undefined

  const attachments = db
    .prepare('SELECT * FROM attachments WHERE email_id = ?')
    .all(emailId)

  return {
    ...email,
    attachments: attachments as any[]
  }
}

/**
 * Mark an email as read
 */
export function markAsRead(emailId: number): void {
  const db = getDatabase()

  db.prepare('UPDATE emails SET is_read = 1 WHERE id = ?').run(emailId)
}

/**
 * Delete an email
 */
export function deleteEmail(emailId: number): void {
  const db = getDatabase()

  // Foreign key cascade will delete attachments automatically
  db.prepare('DELETE FROM emails WHERE id = ?').run(emailId)

  console.log(`Deleted email ${emailId}`)
}
