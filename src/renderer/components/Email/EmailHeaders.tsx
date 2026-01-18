import React from 'react'
import type { EmailDetail } from '../../../types'

interface EmailHeadersProps {
  email: EmailDetail
}

export function EmailHeaders({ email }: EmailHeadersProps) {
  let headers: Record<string, string | string[]> = {}

  try {
    headers = JSON.parse(email.raw_headers)
  } catch (err) {
    console.error('Failed to parse headers:', err)
  }

  const headerEntries = Object.entries(headers)

  if (headerEntries.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No headers available
      </div>
    )
  }

  const formatValue = (value: string | string[]): string => {
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    return value
  }

  return (
    <div className="p-6">
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
