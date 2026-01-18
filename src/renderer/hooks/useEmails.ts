import { useState, useEffect } from 'react'
import type { Email } from '../../types'

export function useEmails(mailboxId: number | null) {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEmails = async () => {
    if (!mailboxId) {
      setEmails([])
      return
    }

    try {
      setLoading(true)
      const data = await window.api.getEmails(mailboxId)
      setEmails(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load emails')
      console.error('Error fetching emails:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmails()

    // Listen for new emails
    window.api.onNewEmail((data) => {
      // Only refetch if it's for our mailbox
      if (data.mailboxId === mailboxId) {
        fetchEmails()
      }
    })

    return () => {
      window.api.removeNewEmailListener()
    }
  }, [mailboxId])

  return { emails, loading, error, refetch: fetchEmails }
}
