import { useState, useEffect } from 'react'
import type { Mailbox } from '../../types'

export function useMailboxes() {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMailboxes = async () => {
    try {
      setLoading(true)
      const data = await window.api.getMailboxes()
      setMailboxes(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mailboxes')
      console.error('Error fetching mailboxes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMailboxes()

    // Listen for new emails and refresh mailboxes
    window.api.onNewEmail(() => {
      fetchMailboxes()
    })

    return () => {
      window.api.removeNewEmailListener()
    }
  }, [])

  return { mailboxes, loading, error, refetch: fetchMailboxes }
}
