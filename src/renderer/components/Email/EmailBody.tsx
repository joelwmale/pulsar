import React, { useState } from 'react'
import type { EmailDetail } from '../../../types'

interface EmailBodyProps {
  email: EmailDetail
}

export function EmailBody({ email }: EmailBodyProps) {
  const hasHtml = !!email.html_content
  const hasText = !!email.text_content
  const [viewMode, setViewMode] = useState<'html' | 'text'>(hasHtml ? 'html' : 'text')

  if (!hasHtml && !hasText) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">(No content)</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toggle between HTML and text if both exist */}
      {hasHtml && hasText && (
        <div className="flex gap-2 p-3 bg-gray-50 border-b border-gray-200">
          <button
            onClick={() => setViewMode('html')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'html'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            HTML
          </button>
          <button
            onClick={() => setViewMode('text')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'text'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Plain Text
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'html' && hasHtml ? (
          <iframe
            sandbox="allow-same-origin"
            srcDoc={email.html_content || ''}
            className="w-full h-full min-h-[600px] border-0 bg-white"
            title="Email HTML content"
          />
        ) : (
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900">
            {email.text_content}
          </pre>
        )}
      </div>
    </div>
  )
}
