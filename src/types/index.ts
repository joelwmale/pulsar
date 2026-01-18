export interface Mailbox {
  id: number
  username: string
  created_at: string
  email_count: number
  unread_count: number
}

export interface Email {
  id: number
  mailbox_id: number
  message_id: string | null
  from_address: string
  to_address: string
  subject: string | null
  text_content: string | null
  html_content: string | null
  raw_headers: string
  raw_source: string
  has_attachments: boolean
  is_read: boolean
  received_at: string
}

export interface EmailDetail extends Email {
  attachments?: Attachment[]
}

export interface Attachment {
  id: number
  email_id: number
  filename: string
  content_type: string | null
  size: number
  content: Buffer
}

export interface ParsedEmail {
  from: string
  to: string
  subject?: string
  text?: string
  html?: string
  messageId?: string
  headers: Map<string, string | string[]>
  attachments: ParsedAttachment[]
}

export interface ParsedAttachment {
  filename: string
  contentType: string
  size: number
  content: Buffer
}

export interface WindowAPI {
  getMailboxes: () => Promise<Mailbox[]>
  getEmails: (mailboxId: number) => Promise<Email[]>
  getEmail: (emailId: number) => Promise<EmailDetail>
  markAsRead: (emailId: number) => Promise<void>
  deleteEmail: (emailId: number) => Promise<void>
  getTotalUnreadCount: () => Promise<number>
  onNewEmail: (callback: (data: { mailboxId: number; emailId: number; from: string; subject: string }) => void) => void
  removeNewEmailListener: () => void
}

declare global {
  interface Window {
    api: WindowAPI
  }
}
