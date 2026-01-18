import React, { useState } from 'react'
import type { Attachment } from '../../../types'

interface AttachmentListProps {
  attachments: Attachment[]
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null)

  if (!attachments || attachments.length === 0) {
    return null
  }

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleOpen = async (attachment: Attachment) => {
    try {
      setLoadingId(attachment.id)
      console.log('Opening attachment:', attachment)
      await window.api.openAttachment(attachment.id)
    } catch (error) {
      console.error('Error opening attachment:', error)
      alert(`Failed to open attachment: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoadingId(null)
    }
  }

  const handleSave = async (attachment: Attachment) => {
    try {
      setLoadingId(attachment.id)
      console.log('Saving attachment:', attachment)
      const filePath = await window.api.saveAttachment(attachment.id, attachment.filename)
      if (filePath) {
        console.log('Saved to:', filePath)
      }
    } catch (error) {
      console.error('Error saving attachment:', error)
      alert(`Failed to save attachment: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="pt-3 mt-3 border-t border-gray-100">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
        Attachments
      </div>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-gray-400">📎</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {attachment.filename}
                </div>
                <div className="text-xs text-gray-500">
                  {formatSize(attachment.size)}
                  {attachment.content_type && ` • ${attachment.content_type}`}
                </div>
              </div>
            </div>
            <div className="flex gap-2 ml-3">
              <button
                onClick={() => handleOpen(attachment)}
                disabled={loadingId === attachment.id}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {loadingId === attachment.id ? 'Opening...' : 'Open'}
              </button>
              <button
                onClick={() => handleSave(attachment)}
                disabled={loadingId === attachment.id}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {loadingId === attachment.id ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
