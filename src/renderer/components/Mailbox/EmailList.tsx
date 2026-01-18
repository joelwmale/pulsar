import React from 'react'
import type { Email } from '../../../types'

interface EmailListProps {
  emails: Email[]
  selectedEmailId: number | null
  onSelectEmail: (emailId: number) => void
  loading: boolean
}

export function EmailList({
  emails,
  selectedEmailId,
  onSelectEmail,
  loading
}: EmailListProps) {
  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading emails...
      </div>
    )
  }

  if (emails.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-400">
          <p className="text-lg mb-2">📧 No emails yet</p>
          <p className="text-sm">
            Send an email to this mailbox and it will appear here
          </p>
        </div>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    // SQLite returns timestamps in local time format: "YYYY-MM-DD HH:MM:SS"
    // We need to parse it as local time, not UTC
    const date = new Date(dateStr.replace(' ', 'T'))
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  return (
    <div className="divide-y divide-gray-200">
      {emails.map((email) => (
        <button
          key={email.id}
          onClick={() => onSelectEmail(email.id)}
          className={`
            w-full p-4 text-left transition-colors hover:bg-gray-50
            ${selectedEmailId === email.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}
          `}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* From */}
              <div className={`text-sm truncate ${!email.is_read ? 'font-semibold' : 'font-normal'}`}>
                {email.from_address}
              </div>

              {/* Subject */}
              <div className={`text-sm mt-1 truncate ${!email.is_read ? 'font-semibold' : 'text-gray-700'}`}>
                {email.subject || '(No Subject)'}
              </div>

              {/* Preview */}
              <div className="text-xs text-gray-500 mt-1 truncate">
                {email.text_content?.substring(0, 100) || ''}
              </div>
            </div>

            {/* Right side info */}
            <div className="flex-shrink-0 flex flex-col items-end gap-1">
              <div className="text-xs text-gray-500">
                {formatDate(email.received_at)}
              </div>

              <div className="flex items-center gap-1">
                {!email.is_read && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
                {email.has_attachments && (
                  <span className="text-gray-400" title="Has attachments">
                    📎
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
