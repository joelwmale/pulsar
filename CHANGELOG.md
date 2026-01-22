# Changelog

All notable changes to Pulsar will be documented in this file.

## [0.1.0-alpha] - 2026-01-22

### Initial Alpha Release

Pulsar's first alpha release brings a beautiful, modern desktop application for capturing and viewing emails during development. This initial version provides all the core functionality needed for local email testing.

### Features

#### Core SMTP Server
- **Local SMTP Server** - Fully functional SMTP server running on your machine
- **Configurable Port** - Default port 2500, customizable via settings panel
- **Smart Mailboxes** - Automatically creates separate mailboxes based on SMTP username
- **SQLite Storage** - All emails persistently stored in local SQLite database
- **Real-time Updates** - Emails appear instantly when received

#### Email Viewing & Management
- **Beautiful Modern UI** - Clean interface built with React and Tailwind CSS
- **Three View Modes**:
  - Email view with rendered HTML or formatted plain text
  - Headers view showing all email metadata in a table
  - Raw view displaying complete RFC822 message source
- **HTML Email Rendering** - Safe rendering in sandboxed iframes
- **Attachment Support** - View, open, and save email attachments
- **Email List** - Browse all emails with sender, subject, and timestamp
- **Unread Indicators** - Visual indicators for unread emails in mailbox list
- **Unread Counts** - Badge counts in sidebar and system dock/taskbar

#### Productivity Features
- **Desktop Notifications** - Get notified when new emails arrive
- **Bulk Actions** - Select and delete multiple emails at once
- **Quick Delete** - Delete individual emails with one click
- **Settings Panel** - Easy-to-use settings interface for configuration
- **Setup Instructions** - Built-in setup guides for popular frameworks:
  - Laravel
  - Node.js (Nodemailer)
  - Ruby on Rails
  - PHP (PHPMailer)
  - Symfony
  - WordPress
  - ASP.NET Core
  - Django
  - And more...

#### Cross-Platform Support
- **macOS** - Native .dmg and .zip packages (ARM64 and x64)
- **Windows** - NSIS installer and portable executable
- **Linux** - AppImage and .deb packages

### Technical Details
- Built with Electron 28
- React 18 for UI
- TypeScript for type safety
- Tailwind CSS for styling
- better-sqlite3 for database
- smtp-server for SMTP functionality
- mailparser for email parsing

### Known Limitations
- No search functionality yet
- No email forwarding capability
- No dark mode
- External resources in HTML emails may not load (intentional security feature)
- Single-user only (no team collaboration)

### Installation

Download pre-built binaries for your platform:
- **macOS**: `Pulsar-0.1.0-alpha-arm64.dmg` or `Pulsar-0.1.0-alpha-arm64-mac.zip`
- **Windows**: `Pulsar-Setup-0.1.0-alpha.exe` or `Pulsar-0.1.0-alpha-portable.exe`
- **Linux**: `Pulsar-0.1.0-alpha.AppImage` or `pulsar_0.1.0-alpha_amd64.deb`

### Getting Started

1. Launch Pulsar
2. Note the SMTP connection details (default: `127.0.0.1:2500`)
3. Click the port/IP in the sidebar to view setup instructions
4. Configure your application using the provided examples
5. Send a test email and watch it appear in Pulsar!

### Contributing

This is an alpha release and we welcome feedback! Please report bugs and suggest features:
- Bug Reports: https://github.com/joelmale/pulsar/issues
- Feature Requests: https://github.com/joelmale/pulsar/discussions

### Credits

Created by Joel Male
Inspired by MailHog and MailCatcher

---

**Note**: This is an alpha release intended for testing and feedback. While fully functional, you may encounter bugs or missing features. Please report any issues you find!
