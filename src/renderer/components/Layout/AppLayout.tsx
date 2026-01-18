import React from 'react'

interface AppLayoutProps {
  sidebar: React.ReactNode
  main: React.ReactNode
}

export function AppLayout({ sidebar, main }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex-shrink-0 border-r border-gray-800">
        {sidebar}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {main}
      </div>
    </div>
  )
}
