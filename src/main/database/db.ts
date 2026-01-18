import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'

let db: Database.Database | null = null

/**
 * Initialize the SQLite database and create tables if they don't exist
 */
export function initDatabase(): Database.Database {
  if (db) return db

  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'pulsar.db')

  console.log('Initializing database at:', dbPath)

  db = new Database(dbPath)

  // Enable foreign keys
  db.pragma('foreign_keys = ON')

  // Create tables
  createTables()

  return db
}

/**
 * Create database tables with schema
 */
function createTables() {
  if (!db) throw new Error('Database not initialized')

  // Mailboxes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS mailboxes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      email_count INTEGER DEFAULT 0
    )
  `)

  // Emails table
  db.exec(`
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mailbox_id INTEGER NOT NULL,
      message_id TEXT,
      from_address TEXT NOT NULL,
      to_address TEXT NOT NULL,
      subject TEXT,
      text_content TEXT,
      html_content TEXT,
      raw_headers TEXT,
      raw_source TEXT,
      has_attachments INTEGER DEFAULT 0,
      is_read INTEGER DEFAULT 0,
      received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mailbox_id) REFERENCES mailboxes(id) ON DELETE CASCADE
    )
  `)

  // Create indexes for better query performance
  db.exec('CREATE INDEX IF NOT EXISTS idx_mailbox_id ON emails(mailbox_id)')
  db.exec('CREATE INDEX IF NOT EXISTS idx_received_at ON emails(received_at DESC)')
  db.exec('CREATE INDEX IF NOT EXISTS idx_message_id ON emails(message_id)')

  // Attachments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      content_type TEXT,
      size INTEGER,
      content BLOB,
      FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
    )
  `)

  db.exec('CREATE INDEX IF NOT EXISTS idx_email_id ON attachments(email_id)')

  console.log('Database tables created successfully')
}

/**
 * Get the database instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

/**
 * Close the database connection
 */
export function closeDatabase() {
  if (db) {
    db.close()
    db = null
    console.log('Database connection closed')
  }
}
