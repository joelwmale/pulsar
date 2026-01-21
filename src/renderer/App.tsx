import React, { useState, useEffect } from 'react'
import { AppLayout } from './components/Layout/AppLayout'
import { Sidebar } from './components/Layout/Sidebar'
import { MailboxList } from './components/Mailbox/MailboxList'
import { EmailList } from './components/Mailbox/EmailList'
import { EmailViewer } from './components/Email/EmailViewer'
import { SettingsModal } from './components/Settings/SettingsModal'
import { InstructionsModal } from './components/Instructions/InstructionsModal'
import { useMailboxes } from './hooks/useMailboxes'
import { useEmails } from './hooks/useEmails'

export function App() {
  const [selectedMailboxId, setSelectedMailboxId] = useState<number | null>(null)
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false)
  const [selectedEmailIds, setSelectedEmailIds] = useState<Set<number>>(new Set())
  const [portRefreshKey, setPortRefreshKey] = useState(0)

  const { mailboxes, loading: mailboxesLoading, refetch: refetchMailboxes } = useMailboxes()
  const { emails, loading: emailsLoading, refetch: refetchEmails } = useEmails(selectedMailboxId)

  const handleSelectMailbox = (mailboxId: number) => {
    setSelectedMailboxId(mailboxId)
    setSelectedEmailId(null) // Reset selected email when changing mailbox
    setSelectedEmailIds(new Set()) // Clear selection when changing mailbox
  }

  const handleSelectEmail = (emailId: number) => {
    setSelectedEmailId(emailId)
  }

  const handleToggleSelection = (emailId: number) => {
    setSelectedEmailIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(emailId)) {
        newSet.delete(emailId)
      } else {
        newSet.add(emailId)
      }
      return newSet
    })
  }

  const handleDeleteSelected = async () => {
    if (selectedEmailIds.size === 0) return

    try {
      await window.api.deleteEmails(Array.from(selectedEmailIds))

      // Clear selection
      setSelectedEmailIds(new Set())

      // If the currently viewed email was deleted, clear selection
      if (selectedEmailId && selectedEmailIds.has(selectedEmailId)) {
        setSelectedEmailId(null)
      }

      // Refresh data
      refetchMailboxes()
      refetchEmails()
    } catch (error) {
      console.error('Failed to delete emails:', error)
      alert('Failed to delete emails. Please try again.')
    }
  }

  const handleSettingsSaved = () => {
    // Increment key to trigger port refresh in Sidebar
    setPortRefreshKey(prev => prev + 1)
  }

  const handleEmailDeleted = () => {
    // Clear the selected email
    setSelectedEmailId(null)

    // Refresh data
    refetchMailboxes()
    refetchEmails()
  }

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Listen for new emails and show notifications
    window.api.onNewEmail((data) => {
      // Refresh mailboxes list (to update email counts)
      refetchMailboxes()

      // Refresh emails if we're viewing the mailbox that received the email
      if (data.mailboxId === selectedMailboxId) {
        refetchEmails()
      }

      // Show notification
      if (Notification.permission === 'granted') {
        const notification = new Notification('New Email Received', {
          body: `From: ${data.from}\nSubject: ${data.subject}`,
          tag: `email-${data.emailId}`, // Prevent duplicate notifications
          requireInteraction: false
        })

        notification.onclick = () => {
          // Open the email when notification is clicked
          setSelectedMailboxId(data.mailboxId)
          setSelectedEmailId(data.emailId)
          // Focus the window
          window.focus()
        }
      }
    })

    return () => {
      window.api.removeNewEmailListener()
    }
  }, [selectedMailboxId, refetchMailboxes, refetchEmails])

  return (
    <>
      <AppLayout
        sidebar={
          <Sidebar
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenInstructions={() => setIsInstructionsOpen(true)}
            portRefreshKey={portRefreshKey}
          >
            <MailboxList
              mailboxes={mailboxes}
              selectedMailboxId={selectedMailboxId}
              onSelectMailbox={handleSelectMailbox}
              loading={mailboxesLoading}
            />
          </Sidebar>
        }
      main={
        <div className="flex h-full">
          {/* Email list panel */}
          <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
            {selectedMailboxId ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h2 className="font-semibold text-gray-900">
                        {mailboxes.find((m) => m.id === selectedMailboxId)?.username}
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {(() => {
                          const mailbox = mailboxes.find((m) => m.id === selectedMailboxId)
                          if (!mailbox) return `${emails.length} ${emails.length === 1 ? 'email' : 'emails'}`
                          if (mailbox.unread_count > 0) {
                            return `${mailbox.unread_count} unread of ${mailbox.email_count} total`
                          }
                          return `${mailbox.email_count} ${mailbox.email_count === 1 ? 'email' : 'emails'}`
                        })()}
                      </p>
                    </div>
                    {selectedEmailIds.size > 0 && (
                      <button
                        onClick={handleDeleteSelected}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        title={`Delete ${selectedEmailIds.size} email${selectedEmailIds.size === 1 ? '' : 's'}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete ({selectedEmailIds.size})
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <EmailList
                    emails={emails}
                    selectedEmailId={selectedEmailId}
                    selectedIds={selectedEmailIds}
                    onSelectEmail={handleSelectEmail}
                    onToggleSelection={handleToggleSelection}
                    loading={emailsLoading}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <p className="text-lg mb-2">📬</p>
                  <p>Select a mailbox to view emails</p>
                </div>
              </div>
            )}
          </div>

          {/* Email viewer panel */}
          <div className="flex-1 bg-gray-100 overflow-hidden">
            {selectedEmailId ? (
              <EmailViewer emailId={selectedEmailId} onDelete={handleEmailDeleted} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <p className="text-lg mb-2">✉️</p>
                  <p>Select an email to view its content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      }
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsSaved}
      />

      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />
    </>
  )
}
