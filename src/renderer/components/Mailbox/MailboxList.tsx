import React from 'react'
import type { Mailbox } from '../../../types'

interface MailboxListProps {
  mailboxes: Mailbox[]
  selectedMailboxId: number | null
  onSelectMailbox: (mailboxId: number) => void
  loading: boolean
}

export function MailboxList({
  mailboxes,
  selectedMailboxId,
  onSelectMailbox,
  loading
}: MailboxListProps) {
  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400">
        Loading mailboxes...
      </div>
    )
  }

  if (mailboxes.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500 text-sm">
          <p className="mb-2">📭 No mailboxes yet</p>
          <p className="text-xs text-gray-600">
            Mailboxes will be created automatically when you receive your first email
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-2">
      {mailboxes.map((mailbox) => (
        <button
          key={mailbox.id}
          onClick={() => onSelectMailbox(mailbox.id)}
          className={`
            w-full px-4 py-3 text-left flex items-center justify-between
            transition-colors duration-150
            ${
              selectedMailboxId === mailbox.id
                ? 'bg-gray-800 border-l-4 border-blue-500'
                : 'hover:bg-gray-800/50 border-l-4 border-transparent'
            }
          `}
        >
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {mailbox.username}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {mailbox.unread_count > 0
                ? `${mailbox.unread_count} unread`
                : `${mailbox.email_count} ${mailbox.email_count === 1 ? 'email' : 'emails'}`}
            </div>
          </div>

          {mailbox.unread_count > 0 && (
            <div className="ml-2 flex-shrink-0">
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                {mailbox.unread_count}
              </span>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
