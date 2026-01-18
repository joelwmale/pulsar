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
    <div className="bg-white border-b border-gray-200 p-4">
      <h1 className="text-xl font-semibold text-gray-900 mb-3">
        {email.subject || '(No Subject)'}
      </h1>

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
          <div className="flex items-center pt-2">
            <span className="text-gray-500 w-14 flex-shrink-0">📎</span>
            <span className="text-gray-700">
              {email.attachments.length} attachment{email.attachments.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
