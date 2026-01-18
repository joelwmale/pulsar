import React from 'react'
import type { EmailDetail } from '../../../types'

interface EmailHeaderProps {
  email: EmailDetail
}

export function EmailHeader({ email }: EmailHeaderProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString()
  }

  return (
    <div className="bg-white border-b border-gray-200 p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        {email.subject || '(No Subject)'}
      </h1>

      <div className="space-y-2 text-sm">
        <div className="flex">
          <span className="text-gray-500 w-16">From:</span>
          <span className="text-gray-900">{email.from_address}</span>
        </div>

        <div className="flex">
          <span className="text-gray-500 w-16">To:</span>
          <span className="text-gray-900">{email.to_address}</span>
        </div>

        <div className="flex">
          <span className="text-gray-500 w-16">Date:</span>
          <span className="text-gray-900">{formatDate(email.received_at)}</span>
        </div>

        {email.message_id && (
          <div className="flex">
            <span className="text-gray-500 w-16">ID:</span>
            <span className="text-gray-600 text-xs font-mono">{email.message_id}</span>
          </div>
        )}

        {email.has_attachments && email.attachments && email.attachments.length > 0 && (
          <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
            <span className="text-gray-500 w-16">📎</span>
            <span className="text-gray-700">
              {email.attachments.length} attachment{email.attachments.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
