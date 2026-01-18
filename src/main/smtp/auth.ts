import type { SMTPServerAuthentication, SMTPServerAuthenticationResponse, SMTPServerSession } from 'smtp-server'

/**
 * SMTP authentication handler
 * Accepts any username/password combination (this is a local development server)
 * The username determines which mailbox the email will be stored in
 */
export function handleAuth(
  auth: SMTPServerAuthentication,
  session: SMTPServerSession,
  callback: (err: Error | null, response?: SMTPServerAuthenticationResponse) => void
): void {
  // Extract username from authentication
  const username = auth.username

  if (!username) {
    return callback(new Error('Username is required'))
  }

  // Store username in session for later use in email handler
  ;(session as any).username = username

  console.log(`SMTP Auth: User '${username}' authenticated`)

  // Accept any credentials (no password validation for local dev server)
  callback(null, { user: username })
}
