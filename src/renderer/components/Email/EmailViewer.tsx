import React, { useState, useEffect } from 'react'
import type { EmailDetail } from '../../../types'
import { EmailHeader } from './EmailHeader'
import { EmailBody } from './EmailBody'
import { EmailHeaders } from './EmailHeaders'
import { EmailRaw } from './EmailRaw'

interface EmailViewerProps {
  emailId: number
}

export function EmailViewer({ emailId }: EmailViewerProps) {
  const [email, setEmail] = useState<EmailDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'formatted' | 'headers' | 'raw'>('formatted')

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        setLoading(true)
        const data = await window.api.getEmail(emailId)
        setEmail(data || null)

        // Mark as read
        if (data && !data.is_read) {
          await window.api.markAsRead(emailId)
        }
      } catch (err) {
        console.error('Error fetching email:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEmail()
  }, [emailId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading email...</div>
      </div>
    )
  }

  if (!email) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Email not found</div>
      </div>
    )
  }

  const tabs = [
    { id: 'formatted' as const, label: 'Formatted' },
    { id: 'headers' as const, label: 'Headers' },
    { id: 'raw' as const, label: 'Raw' }
  ]

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Email Header */}
      <EmailHeader email={email} />

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-3 text-sm font-medium border-b-2 transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'formatted' && <EmailBody email={email} />}
        {activeTab === 'headers' && <EmailHeaders email={email} />}
        {activeTab === 'raw' && <EmailRaw email={email} />}
      </div>
    </div>
  )
}
