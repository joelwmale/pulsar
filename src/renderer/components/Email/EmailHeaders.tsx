import React from 'react'
import type { EmailDetail } from '../../../types'

interface EmailHeadersProps {
  email: EmailDetail
}

export function EmailHeaders({ email }: EmailHeadersProps) {
  if (!email) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">No email data</div>
      </div>
    )
  }

  if (!email.raw_headers) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">No headers available</div>
      </div>
    )
  }

  let headers: Record<string, any> = {}

  try {
    headers = JSON.parse(email.raw_headers)
  } catch (err) {
    console.error('Failed to parse headers:', err)
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">Failed to parse headers</div>
      </div>
    )
  }

  const headerEntries = Object.entries(headers)

  if (headerEntries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">No headers found</div>
      </div>
    )
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return ''
    }

    if (Array.isArray(value)) {
      return value.map(v => formatValue(v)).join(', ')
    }

    if (typeof value === 'object') {
      // If it has a 'text' property (common in email headers), use that
      if (value.text) {
        return String(value.text)
      }
      // If it has a 'value' property, use that
      if (value.value) {
        return String(value.value)
      }
      // Otherwise, try to format as JSON
      try {
        return JSON.stringify(value, null, 2)
      } catch {
        return '[Complex Object]'
      }
    }

    return String(value)
  }

  return (
    <div className="h-full overflow-auto p-6 bg-gray-50">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Header
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {headerEntries.map(([key, value]) => (
              <tr key={key} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {key}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 break-all font-mono text-xs">
                  {formatValue(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
