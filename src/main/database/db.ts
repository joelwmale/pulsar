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

  // Run migrations
  runMigrations()

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
      created_at DATETIME DEFAULT (datetime('now', 'localtime')),
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
      received_at DATETIME DEFAULT (datetime('now', 'localtime')),
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

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
    )
  `)

  // Insert default settings if they don't exist
  db.exec(`
    INSERT OR IGNORE INTO settings (key, value) VALUES ('smtp_port', '2500');
  `)

  console.log('Database tables created successfully')
}

/**
 * Run database migrations
 */
function runMigrations() {
  if (!db) throw new Error('Database not initialized')

  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version INTEGER UNIQUE NOT NULL,
      applied_at DATETIME DEFAULT (datetime('now', 'localtime'))
    )
  `)

  const currentVersion = db.prepare('SELECT MAX(version) as version FROM migrations').get() as { version: number | null }
  const version = currentVersion?.version || 0

  // Migration 1: Update timestamp columns to use localtime
  if (version < 1) {
    console.log('Running migration 1: Updating timestamps to localtime...')

    // Note: SQLite doesn't support ALTER COLUMN, so we need to check if data exists
    // If tables are empty, the schema is already correct from createTables()
    // If tables have data, we'll just add a note
    const mailboxCount = db.prepare('SELECT COUNT(*) as count FROM mailboxes').get() as { count: number }
    const emailCount = db.prepare('SELECT COUNT(*) as count FROM emails').get() as { count: number }

    if (mailboxCount.count > 0 || emailCount.count > 0) {
      console.log('Note: Existing timestamps are in UTC. New entries will use local time.')
      console.log('For best results, consider clearing your database: rm ~/Library/Application\\ Support/pulsar/pulsar.db')
    }

    db.prepare('INSERT INTO migrations (version) VALUES (?)').run(1)
    console.log('Migration 1 complete')
  }
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
