# ✨ Pulsar - Local SMTP Mail Server

A beautiful desktop application for capturing and viewing emails during local development. Perfect for testing email functionality in your applications without sending real emails.

![Pulsar Screenshot](https://via.placeholder.com/800x500?text=Pulsar+Screenshot)

## Features

- 📧 **Local SMTP Server** - Runs on port 2500 (configurable)
- 📬 **Dynamic Mailboxes** - Mailboxes are created automatically based on SMTP username
- 🎨 **Beautiful UI** - Modern, responsive interface built with React and Tailwind CSS
- 👀 **Multiple Views** - View emails as formatted HTML/text, raw headers, or complete RFC822 source
- 📎 **Attachment Support** - View and download email attachments
- 💾 **Persistent Storage** - All emails are stored in a local SQLite database
- 🔄 **Real-time Updates** - New emails appear instantly in the UI
- 🔒 **Safe HTML Rendering** - HTML emails are rendered in a sandboxed iframe

## Installation

### Download Pre-built Binaries

Download the latest release for your platform:

- **macOS**: [Pulsar.dmg](#)
- **Windows**: [Pulsar-Setup.exe](#)
- **Linux**: [Pulsar.AppImage](#) or [pulsar.deb](#)

### Build from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/pulsar.git
cd pulsar

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Package for distribution
npm run package
```

## Usage

### Starting Pulsar

1. Launch the Pulsar application
2. The SMTP server will automatically start on `127.0.0.1:2500`
3. Configure your application to send emails to Pulsar

### Configuring Your Application

#### Laravel

Update your `.env` file:

```env
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=2500
MAIL_USERNAME=my-app-mailbox
MAIL_PASSWORD=anything
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=noreply@myapp.test
MAIL_FROM_NAME="${APP_NAME}"
```

The `MAIL_USERNAME` determines which mailbox receives the emails. For example, if you set `MAIL_USERNAME=orders`, all emails will appear in a mailbox named "orders".

#### Node.js (Nodemailer)

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: '127.0.0.1',
  port: 2500,
  secure: false, // No TLS
  auth: {
    user: 'my-app-mailbox', // This becomes the mailbox name
    pass: 'anything'        // Password is not validated
  }
});

await transporter.sendMail({
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Test Email',
  text: 'Hello from Pulsar!',
  html: '<h1>Hello from Pulsar!</h1>'
});
```

#### Testing with cURL

```bash
echo "Subject: Test Email
From: sender@example.com
To: recipient@example.com

This is a test email from curl!" | curl smtp://localhost:2500 \
  --mail-from sender@example.com \
  --mail-rcpt recipient@example.com \
  --user testuser:password \
  --upload-file -
```

### Using the Interface

1. **Mailboxes**: Listed in the left sidebar. Click to select a mailbox.
2. **Email List**: Displays all emails in the selected mailbox. Click to view an email.
3. **Email Viewer**: Shows the email content with three tabs:
   - **Formatted**: Rendered HTML or plain text
   - **Headers**: All email headers in a table
   - **Raw**: Complete RFC822 message source

## Configuration

### Custom Port

To change the SMTP server port, edit `src/main/smtp/server.ts`:

```typescript
port: 2500, // Change this value
```

### Database Location

By default, emails are stored in your user data directory:

- **macOS**: `~/Library/Application Support/pulsar/pulsar.db`
- **Windows**: `%APPDATA%/pulsar/pulsar.db`
- **Linux**: `~/.config/pulsar/pulsar.db`

## Development

### Project Structure

```
pulsar/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Application entry point
│   │   ├── smtp/          # SMTP server implementation
│   │   ├── database/      # SQLite database layer
│   │   └── ipc/           # IPC handlers
│   ├── preload/           # Preload scripts
│   │   └── index.ts       # contextBridge API
│   └── renderer/          # React application
│       ├── components/    # React components
│       ├── hooks/         # Custom hooks
│       └── styles/        # CSS styles
└── package.json
```

### Tech Stack

- **Electron** - Desktop app framework
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **better-sqlite3** - SQLite database
- **smtp-server** - SMTP server implementation
- **mailparser** - Email parsing

### Running in Development

```bash
npm run dev
```

This starts Vite's dev server with hot module replacement and launches Electron.

### Building

```bash
# Build renderer (React app)
npm run build:renderer

# Build main process
npm run build:main

# Package the application
npm run package

# Build for all platforms
npm run package:all
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Troubleshooting

### Port 2500 is already in use

If you see an error about port 2500 being in use, either:
1. Close the other application using that port
2. Change Pulsar's port in the configuration (see Configuration section)

### Emails not appearing

1. Verify your application is configured correctly
2. Check that you're using the correct SMTP credentials
3. Look at the Electron console for error messages (Dev Tools)

### HTML emails not rendering

HTML emails are rendered in a sandboxed iframe for security. Some complex HTML with external resources may not render perfectly.

## Acknowledgments

- Icon: Based on pulsar star imagery
- Inspired by [MailHog](https://github.com/mailhog/MailHog) and [MailCatcher](https://mailcatcher.me/)

## Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/pulsar/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/pulsar/discussions)
- 📧 **Email**: support@example.com

---

Made with ❤️ by [Joel Male](https://github.com/yourusername)
