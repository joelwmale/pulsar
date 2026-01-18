import { simpleParser } from 'mailparser'
import type { SMTPServerDataStream, SMTPServerSession } from 'smtp-server'
import { Readable } from 'stream'
import { getOrCreateMailbox } from '../database/mailbox'
import { saveEmail, saveAttachments } from '../database/email'
import type { ParsedAttachment } from '../../types'
import { BrowserWindow } from 'electron'
import { updateBadgeCount } from '../index'

/**
 * Handle incoming email data from SMTP server
 * Parses the email and stores it in the database
 */
export async function handleEmail(
  stream: SMTPServerDataStream,
  session: SMTPServerSession,
  callback: (err?: Error | null) => void
): Promise<void> {
  try {
    // Get username from session (set during authentication)
    const username = (session as any).username

    if (!username) {
      return callback(new Error('No username found in session'))
    }

    // Convert stream to buffer for parsing
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Parse email
    const parsed = await simpleParser(buffer)

    console.log(`Received email from ${parsed.from?.text} to ${parsed.to?.text}`)

    // Get or create mailbox for this username
    const mailbox = getOrCreateMailbox(username)

    // Prepare email data
    const emailData = {
      mailboxId: mailbox.id,
      messageId: parsed.messageId,
      from: parsed.from?.text || '',
      to: parsed.to?.text || '',
      subject: parsed.subject,
      text: parsed.text,
      html: parsed.html ? String(parsed.html) : undefined,
      rawHeaders: JSON.stringify(Object.fromEntries(parsed.headers)),
      rawSource: buffer.toString(),
      hasAttachments: parsed.attachments.length > 0
    }

    // Save email to database
    const emailId = saveEmail(emailData)

    // Save attachments if any
    if (parsed.attachments.length > 0) {
      const attachments: ParsedAttachment[] = parsed.attachments.map((att) => ({
        filename: att.filename || 'untitled',
        contentType: att.contentType,
        size: att.size,
        content: att.content
      }))

      saveAttachments(emailId, attachments)
    }

    // Update badge count
    updateBadgeCount()

    // Notify renderer process about new email
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (mainWindow) {
      mainWindow.webContents.send('new-email', {
        mailboxId: mailbox.id,
        emailId: emailId,
        from: emailData.from,
        subject: emailData.subject || '(No Subject)'
      })
    }

    console.log(`Email saved successfully (ID: ${emailId}, Mailbox: ${mailbox.username})`)

    callback()
  } catch (error) {
    console.error('Error handling email:', error)
    callback(error as Error)
  }
}
