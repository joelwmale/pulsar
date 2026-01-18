import { contextBridge, ipcRenderer } from 'electron'
import type { WindowAPI } from '../types'

/**
 * Preload script that exposes a secure API to the renderer process
 * Uses contextBridge to safely expose IPC methods
 */
const api: WindowAPI = {
  getMailboxes: () => ipcRenderer.invoke('get-mailboxes'),
  getEmails: (mailboxId: number) => ipcRenderer.invoke('get-emails', mailboxId),
  getEmail: (emailId: number) => ipcRenderer.invoke('get-email', emailId),
  markAsRead: (emailId: number) => ipcRenderer.invoke('mark-as-read', emailId),
  deleteEmail: (emailId: number) => ipcRenderer.invoke('delete-email', emailId),
  getTotalUnreadCount: () => ipcRenderer.invoke('get-total-unread-count'),

  onNewEmail: (callback: (data: { mailboxId: number; emailId: number; from: string; subject: string }) => void) => {
    ipcRenderer.on('new-email', (_event, data) => callback(data))
  },

  removeNewEmailListener: () => {
    ipcRenderer.removeAllListeners('new-email')
  }
}

contextBridge.exposeInMainWorld('api', api)
