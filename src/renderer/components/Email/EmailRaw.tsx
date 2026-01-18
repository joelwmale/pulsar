import React, { useState } from 'react'
import type { EmailDetail } from '../../../types'

interface EmailRawProps {
  email: EmailDetail
}

export function EmailRaw({ email }: EmailRawProps) {
  const [copied, setCopied] = useState(false)

  if (!email || !email.raw_source) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">No raw source available</div>
      </div>
    )
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email.raw_source)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="h-full overflow-hidden p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">Raw Email Source</h3>
        <button
          onClick={handleCopy}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>

      <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden">
        <pre className="p-4 text-xs text-green-400 font-mono overflow-auto h-full whitespace-pre">
          {email.raw_source}
        </pre>
      </div>
    </div>
  )
}
