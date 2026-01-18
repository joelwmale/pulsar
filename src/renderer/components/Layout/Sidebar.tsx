import React, { useState, useEffect } from 'react'

interface SidebarProps {
  children: React.ReactNode
  onOpenSettings: () => void
  onOpenInstructions: () => void
  portRefreshKey?: number
}

export function Sidebar({ children, onOpenSettings, onOpenInstructions, portRefreshKey }: SidebarProps) {
  const [port, setPort] = useState<number>(2500)

  useEffect(() => {
    // Load current port
    window.api.getSmtpPort().then(setPort).catch(console.error)
  }, [portRefreshKey])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">✨</span>
          Pulsar
        </h1>
        <p className="text-xs text-gray-400 mt-1">Local Mail Server</p>
      </div>

      {/* Mailbox list title */}
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          Mailboxes
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {children}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800">
        <button
          onClick={onOpenInstructions}
          className="w-full p-3 text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          title="Click for setup instructions"
        >
          <span>Port {port} • 127.0.0.1</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <button
          onClick={onOpenSettings}
          className="w-full p-3 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
      </div>
    </div>
  )
}
