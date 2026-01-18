import { ipcMain, dialog, shell } from 'electron'
import { getMailboxes, getTotalUnreadCount } from '../database/mailbox'
import { getEmails, getEmail, markAsRead, deleteEmail, getAttachment } from '../database/email'
import { updateBadgeCount } from '../index'
import { getAllSettings, setSetting, getSmtpPort } from '../database/settings'
import { restartSMTPServer, getCurrentPort } from '../smtp/server'
import fs from 'fs'
import path from 'path'
import { app } from 'electron'

/**
 * Register all IPC handlers for communication between main and renderer processes
 */
export function registerIPCHandlers(): void {
  // Get all mailboxes
  ipcMain.handle('get-mailboxes', async () => {
    try {
      return getMailboxes()
    } catch (error) {
      console.error('Error getting mailboxes:', error)
      throw error
    }
  })

  // Get emails for a specific mailbox
  ipcMain.handle('get-emails', async (_event, mailboxId: number) => {
    try {
      return getEmails(mailboxId)
    } catch (error) {
      console.error('Error getting emails:', error)
      throw error
    }
  })

  // Get a single email with details
  ipcMain.handle('get-email', async (_event, emailId: number) => {
    try {
      return getEmail(emailId)
    } catch (error) {
      console.error('Error getting email:', error)
      throw error
    }
  })

  // Mark an email as read
  ipcMain.handle('mark-as-read', async (_event, emailId: number) => {
    try {
      markAsRead(emailId)
      updateBadgeCount()
    } catch (error) {
      console.error('Error marking email as read:', error)
      throw error
    }
  })

  // Delete an email
  ipcMain.handle('delete-email', async (_event, emailId: number) => {
    try {
      deleteEmail(emailId)
      updateBadgeCount()
    } catch (error) {
      console.error('Error deleting email:', error)
      throw error
    }
  })

  // Get total unread count
  ipcMain.handle('get-total-unread-count', async () => {
    try {
      return getTotalUnreadCount()
    } catch (error) {
      console.error('Error getting total unread count:', error)
      throw error
    }
  })

  // Save attachment to disk
  ipcMain.handle('save-attachment', async (_event, attachmentId: number, filename: string) => {
    try {
      console.log(`Attempting to save attachment ${attachmentId} with filename ${filename}`)
      const attachment = getAttachment(attachmentId)

      if (!attachment) {
        console.error(`Attachment ${attachmentId} not found in database`)
        throw new Error(`Attachment not found (ID: ${attachmentId})`)
      }

      console.log(`Found attachment: ${attachment.filename}, size: ${attachment.size}`)

      if (!attachment.content) {
        console.error(`Attachment ${attachmentId} has no content`)
        throw new Error('Attachment content is empty')
      }

      // Show save dialog
      const result = await dialog.showSaveDialog({
        defaultPath: filename,
        filters: [
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (result.canceled || !result.filePath) {
        console.log('Save dialog canceled')
        return null
      }

      // Convert content to Buffer if needed
      const buffer = Buffer.isBuffer(attachment.content)
        ? attachment.content
        : Buffer.from(attachment.content)

      // Write file to disk
      fs.writeFileSync(result.filePath, buffer)

      console.log(`Saved attachment ${attachmentId} to ${result.filePath}`)
      return result.filePath
    } catch (error) {
      console.error('Error saving attachment:', error)
      throw error
    }
  })

  // Open attachment (write to temp file and open with default app)
  ipcMain.handle('open-attachment', async (_event, attachmentId: number) => {
    try {
      console.log(`Attempting to open attachment ${attachmentId}`)
      const attachment = getAttachment(attachmentId)

      if (!attachment) {
        console.error(`Attachment ${attachmentId} not found in database`)
        throw new Error(`Attachment not found (ID: ${attachmentId})`)
      }

      console.log(`Found attachment: ${attachment.filename}, size: ${attachment.size}`)

      if (!attachment.content) {
        console.error(`Attachment ${attachmentId} has no content`)
        throw new Error('Attachment content is empty')
      }

      // Create temp directory for attachments
      const tempDir = path.join(app.getPath('temp'), 'pulsar-attachments')
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }

      // Convert content to Buffer if needed
      const buffer = Buffer.isBuffer(attachment.content)
        ? attachment.content
        : Buffer.from(attachment.content)

      // Write to temp file
      const tempFilePath = path.join(tempDir, attachment.filename)
      fs.writeFileSync(tempFilePath, buffer)

      console.log(`Wrote attachment to temp file: ${tempFilePath}`)

      // Open with default application
      const result = await shell.openPath(tempFilePath)

      if (result) {
        console.error(`Failed to open file: ${result}`)
        throw new Error(`Failed to open file: ${result}`)
      }

      console.log(`Opened attachment ${attachmentId}`)
    } catch (error) {
      console.error('Error opening attachment:', error)
      throw error
    }
  })


  // Get all settings
  ipcMain.handle('get-settings', async () => {
    try {
      return getAllSettings()
    } catch (error) {
      console.error('Error getting settings:', error)
      throw error
    }
  })

  // Get current SMTP port
  ipcMain.handle('get-smtp-port', async () => {
    try {
      return getCurrentPort()
    } catch (error) {
      console.error('Error getting SMTP port:', error)
      throw error
    }
  })

  // Update settings
  ipcMain.handle('update-settings', async (_event, settings: Record<string, string>) => {
    try {
      console.log('Updating settings:', settings)

      // Check if SMTP port is changing
      const newPort = settings.smtp_port ? parseInt(settings.smtp_port, 10) : null
      const currentPort = getSmtpPort()

      // Update all settings
      for (const [key, value] of Object.entries(settings)) {
        setSetting(key, value)
      }

      // Restart SMTP server if port changed
      if (newPort && newPort !== currentPort) {
        console.log(`SMTP port changed from ${currentPort} to ${newPort}, restarting server...`)
        await restartSMTPServer(newPort)
        console.log('SMTP server restarted successfully')
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating settings:', error)
      throw error
    }
  })

  console.log('IPC handlers registered')
}
