import React from 'react'
import type { EmailDetail } from '../../../types'
import { AttachmentList } from './AttachmentList'

interface EmailHeaderProps {
  email: EmailDetail
  onDelete?: () => void
}

export function EmailHeader({ email, onDelete }: EmailHeaderProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString()
  }

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <h1 className="text-xl font-semibold text-gray-900 flex-1">
          {email.subject || '(No Subject)'}
        </h1>
        {onDelete && (
          <button
            onClick={onDelete}
            className="ml-4 flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            title="Delete this email"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        )}
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex">
          <span className="text-gray-500 w-14 flex-shrink-0">From:</span>
          <span className="text-gray-900">{email.from_address}</span>
        </div>

        <div className="flex">
          <span className="text-gray-500 w-14 flex-shrink-0">To:</span>
          <span className="text-gray-900">{email.to_address}</span>
        </div>

        <div className="flex">
          <span className="text-gray-500 w-14 flex-shrink-0">Date:</span>
          <span className="text-gray-900">{formatDate(email.received_at)}</span>
        </div>

        {email.attachments && email.attachments.length > 0 && (
          <AttachmentList attachments={email.attachments} />
        )}
      </div>
    </div>
  )
}
