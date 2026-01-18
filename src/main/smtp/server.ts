import { SMTPServer } from 'smtp-server'
import { handleAuth } from './auth'
import { handleEmail } from './handler'
import { getSmtpPort } from '../database/settings'

let smtpServer: SMTPServer | null = null
let currentPort: number = 2500

/**
 * Start the SMTP server on the configured port
 */
export function startSMTPServer(port?: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (smtpServer) {
      console.log('SMTP server is already running')
      return resolve()
    }

    // Use provided port, or get from settings, or default to 2500
    const smtpPort = port || getSmtpPort()
    currentPort = smtpPort

    smtpServer = new SMTPServer({
      // Server configuration
      name: 'Pulsar Local SMTP Server',
      banner: 'Welcome to Pulsar - Local Mail Server',

      // Authentication
      authOptional: false, // Require authentication
      onAuth: handleAuth,

      // Email receiving
      onData: handleEmail,

      // Disable TLS (local development)
      secure: false,
      disabledCommands: ['STARTTLS'],

      // Logging
      logger: false, // Disable built-in logger (we use console.log)

      // Connection limits
      maxClients: 10
    } as any)

    smtpServer.on('error', (err: Error & { code?: string }) => {
      console.error('SMTP Server Error:', err)

      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${smtpPort} is already in use. Please close the other application using this port.`)
        reject(new Error(`Port ${smtpPort} is already in use`))
      }
    })

    smtpServer.listen(smtpPort, '127.0.0.1', () => {
      console.log(`✉️  SMTP Server listening on 127.0.0.1:${smtpPort}`)
      resolve()
    })
  })
}

/**
 * Stop the SMTP server
 */
export function stopSMTPServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!smtpServer) {
      return resolve()
    }

    smtpServer.close(() => {
      console.log('SMTP Server stopped')
      smtpServer = null
      resolve()
    })
  })
}

/**
 * Check if SMTP server is running
 */
export function isSMTPServerRunning(): boolean {
  return smtpServer !== null
}

/**
 * Get the current SMTP server port
 */
export function getCurrentPort(): number {
  return currentPort
}

/**
 * Restart the SMTP server with a new port
 */
export async function restartSMTPServer(newPort: number): Promise<void> {
  console.log(`Restarting SMTP server on port ${newPort}...`)

  // Stop the current server
  await stopSMTPServer()

  // Start with new port
  await startSMTPServer(newPort)

  console.log(`SMTP server restarted successfully on port ${newPort}`)
}
