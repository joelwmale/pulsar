import React, { useState, useEffect } from 'react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: () => void
}

export function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [smtpPort, setSmtpPort] = useState<string>('2500')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Load current settings
      loadSettings()
    }
  }, [isOpen])

  const loadSettings = async () => {
    try {
      const port = await window.api.getSmtpPort()
      setSmtpPort(port.toString())
    } catch (err) {
      console.error('Failed to load settings:', err)
      setError('Failed to load settings')
    }
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(false)

    // Validate port
    const port = parseInt(smtpPort, 10)
    if (isNaN(port) || port < 1 || port > 65535) {
      setError('Port must be a number between 1 and 65535')
      return
    }

    if (port < 1024 && port !== 0) {
      setError('Ports below 1024 require administrator privileges')
      return
    }

    setIsSaving(true)

    try {
      await window.api.updateSettings({
        smtp_port: port.toString()
      })

      setSuccess(true)
      onSave?.() // Trigger refresh in parent component
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1500)
    } catch (err: any) {
      console.error('Failed to save settings:', err)
      setError(err.message || 'Failed to save settings. The port might already be in use.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter' && !isSaving) {
      handleSave()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="smtp-port" className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Server Port
            </label>
            <input
              id="smtp-port"
              type="number"
              min="1"
              max="65535"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2500"
              disabled={isSaving}
            />
            <p className="mt-1 text-xs text-gray-500">
              The SMTP server will restart automatically when you change the port
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">Settings saved successfully!</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
