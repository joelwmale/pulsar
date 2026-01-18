import React, { useState, useEffect } from 'react'
import { AppLayout } from './components/Layout/AppLayout'
import { Sidebar } from './components/Layout/Sidebar'
import { MailboxList } from './components/Mailbox/MailboxList'
import { EmailList } from './components/Mailbox/EmailList'
import { EmailViewer } from './components/Email/EmailViewer'
import { useMailboxes } from './hooks/useMailboxes'
import { useEmails } from './hooks/useEmails'

export function App() {
  const [selectedMailboxId, setSelectedMailboxId] = useState<number | null>(null)
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null)

  const { mailboxes, loading: mailboxesLoading, refetch: refetchMailboxes } = useMailboxes()
  const { emails, loading: emailsLoading, refetch: refetchEmails } = useEmails(selectedMailboxId)

  const handleSelectMailbox = (mailboxId: number) => {
    setSelectedMailboxId(mailboxId)
    setSelectedEmailId(null) // Reset selected email when changing mailbox
  }

  const handleSelectEmail = (emailId: number) => {
    setSelectedEmailId(emailId)
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
    <AppLayout
      sidebar={
        <Sidebar>
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
                <div className="flex-1 overflow-y-auto">
                  <EmailList
                    emails={emails}
                    selectedEmailId={selectedEmailId}
                    onSelectEmail={handleSelectEmail}
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
              <EmailViewer emailId={selectedEmailId} />
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
  )
}
