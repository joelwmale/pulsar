import { SMTPServer } from 'smtp-server'
import { handleAuth } from './auth'
import { handleEmail } from './handler'

let smtpServer: SMTPServer | null = null

/**
 * Start the SMTP server on port 2500
 */
export function startSMTPServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (smtpServer) {
      console.log('SMTP server is already running')
      return resolve()
    }

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
        console.error('Port 2500 is already in use. Please close the other application using this port.')
        reject(new Error('Port 2500 is already in use'))
      }
    })

    smtpServer.listen(2500, '127.0.0.1', () => {
      console.log('✉️  SMTP Server listening on 127.0.0.1:2500')
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
