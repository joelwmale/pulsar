import { app, BrowserWindow, Tray, nativeImage } from 'electron'
import path from 'path'
import fs from 'fs'
import { initDatabase, closeDatabase } from './database/db'
import { startSMTPServer, stopSMTPServer } from './smtp/server'
import { registerIPCHandlers } from './ipc/handlers'
import { getTotalUnreadCount } from './database/mailbox'

// Set app name before app is ready
app.name = 'Pulsar'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

/**
 * Get the icon path for the current environment
 */
function getIconPath(): string {
  // Try multiple possible locations for both dev and production
  const possiblePaths = [
    // Development mode - from project root
    path.join(process.cwd(), 'images/icon.png'),
    // Production mode - from app resources
    process.resourcesPath ? path.join(process.resourcesPath, 'images/icon.png') : null,
    // Production mode - from app path
    path.join(app.getAppPath(), 'images/icon.png'),
    // Fallback - relative to compiled main process
    path.join(__dirname, '../../images/icon.png'),
    path.join(__dirname, '../../../images/icon.png')
  ].filter(Boolean) as string[]
  
  // Return first path that exists
  for (const iconPath of possiblePaths) {
    try {
      if (fs.existsSync(iconPath)) {
        console.log(`✓ Found icon at: ${iconPath}`)
        return iconPath
      }
    } catch (error) {
      // Continue to next path
    }
  }
  
  // If none found, log warning and return first path
  console.warn(`⚠ Icon not found, trying: ${possiblePaths[0]}`)
  return possiblePaths[0] || path.join(process.cwd(), 'images/icon.png')
}

/**
 * Get the tray icon path (prefer template icon for macOS)
 */
function getTrayIconPath(): string {
  if (process.platform === 'darwin') {
    // Try to find template icon first (for better macOS appearance)
    const templatePaths = [
      path.join(process.cwd(), 'images/icon.png'),
      path.join(process.cwd(), 'images/icon.png'),
      path.join(app.getAppPath(), 'images/icon.png'),
      process.resourcesPath ? path.join(process.resourcesPath, 'images/icon.png') : null
    ].filter(Boolean) as string[]
    
    for (const templatePath of templatePaths) {
      if (fs.existsSync(templatePath)) {
        console.log(`✓ Found template icon at: ${templatePath}`)
        return templatePath
      }
    }
  }
  
  // Fallback to regular icon
  return getIconPath()
}

/**
 * Create the system tray icon
 */
function createTray() {
  const iconPath = getTrayIconPath()
  console.log(`Creating tray icon from: ${iconPath}`)
  
  const icon = nativeImage.createFromPath(iconPath)
  
  // Check if icon loaded successfully
  if (icon.isEmpty()) {
    console.error(`❌ Failed to load tray icon from: ${iconPath}`)
    return
  }
  
  // For macOS, set template image for better appearance
  if (process.platform === 'darwin') {
    icon.setTemplateImage(true)
  }
  
  tray = new Tray(icon)
  
  // Set tooltip
  tray.setToolTip('Pulsar - Local Mail Server')
  
  // Handle tray click
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    } else {
      createWindow()
    }
  })
  
  // Handle right-click (context menu could be added here)
  tray.on('right-click', () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

/**
 * Update the dock/taskbar badge with unread count
 */
export function updateBadgeCount() {
  const count = getTotalUnreadCount()

  if (process.platform === 'darwin') {
    // macOS dock badge
    app.dock.setBadge(count > 0 ? count.toString() : '')
  } else if (process.platform === 'win32' && mainWindow) {
    // Windows taskbar overlay
    if (count > 0) {
      // You could create a badge icon here if desired
      mainWindow.setOverlayIcon(null, count.toString())
    } else {
      mainWindow.setOverlayIcon(null, '')
    }
  }

  console.log(`Badge count updated: ${count}`)
}

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    title: 'Pulsar - Local Mail Server',
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false // Required for better-sqlite3
    }
  })

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    // Development mode
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    // Production mode - go up two levels from dist-electron/main to reach dist
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

/**
 * Application startup
 */
app.whenReady().then(async () => {
  try {
    // Initialize database
    initDatabase()
    console.log('✓ Database initialized')

    // Register IPC handlers
    registerIPCHandlers()
    console.log('✓ IPC handlers registered')

    // Start SMTP server
    await startSMTPServer()
    console.log('✓ SMTP server started')

    // Set app icon (for macOS dock)
    // In production, electron-builder sets this automatically from the .icns file
    // In dev mode, we need to set it manually
    if (process.platform === 'darwin') {
      const iconPath = getIconPath()
      console.log(`Setting dock icon from: ${iconPath}`)
      const appIcon = nativeImage.createFromPath(iconPath)
      if (!appIcon.isEmpty()) {
        app.dock.setIcon(appIcon)
        console.log('✓ Dock icon set')
      } else {
        console.error(`❌ Failed to load dock icon from: ${iconPath}`)
      }
    }

    // Create tray icon
    createTray()
    console.log('✓ System tray icon created')

    // Create window
    createWindow()
    console.log('✓ Application window created')

    // Initialize badge count
    updateBadgeCount()
    console.log('✓ Badge count initialized')

    console.log('\n🚀 Pulsar is ready!')
    console.log('📧 SMTP server listening on 127.0.0.1:2500\n')
  } catch (error) {
    console.error('Failed to start application:', error)
    app.quit()
  }
})

/**
 * Handle window creation on macOS
 */
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

/**
 * Application shutdown
 */
app.on('before-quit', async (event) => {
  if (mainWindow) {
    event.preventDefault()

    try {
      console.log('Shutting down...')

      // Stop SMTP server
      await stopSMTPServer()
      console.log('✓ SMTP server stopped')

      // Close database
      closeDatabase()
      console.log('✓ Database closed')

      // Quit the app
      mainWindow = null
      app.exit(0)
    } catch (error) {
      console.error('Error during shutdown:', error)
      app.exit(1)
    }
  }
})

/**
 * Quit when all windows are closed (except on macOS)
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
