import { ipcMain } from 'electron'
import { getMailboxes, getTotalUnreadCount } from '../database/mailbox'
import { getEmails, getEmail, markAsRead, deleteEmail } from '../database/email'
import { updateBadgeCount } from '../index'

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

  console.log('IPC handlers registered')
}
