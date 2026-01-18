import { app, BrowserWindow } from 'electron'
import path from 'path'
import { initDatabase, closeDatabase } from './database/db'
import { startSMTPServer, stopSMTPServer } from './smtp/server'
import { registerIPCHandlers } from './ipc/handlers'

let mainWindow: BrowserWindow | null = null

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
    // Production mode
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
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

    // Create window
    createWindow()
    console.log('✓ Application window created')

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
