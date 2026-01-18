import React, { useState, useEffect } from 'react'

interface InstructionsModalProps {
  isOpen: boolean
  onClose: () => void
}

type Framework = 'laravel' | 'rails' | 'ruby-smtp' | 'php' | 'symfony' | 'wordpress' | 'yii' | 'nodejs' | 'nodemailer'

const frameworkGroups: { label: string; options: { value: Framework; label: string }[] }[] = [
  {
    label: 'Ruby',
    options: [
      { value: 'rails', label: 'Ruby on Rails' },
      { value: 'ruby-smtp', label: 'Ruby (net/smtp)' }
    ]
  },
  {
    label: 'PHP',
    options: [
      { value: 'laravel', label: 'Laravel' },
      { value: 'symfony', label: 'Symfony' },
      { value: 'wordpress', label: 'WordPress' },
      { value: 'yii', label: 'Yii Framework' },
      { value: 'php', label: 'PHP' }
    ]
  },
  {
    label: 'Node',
    options: [
      { value: 'nodejs', label: 'Node.js' },
      { value: 'nodemailer', label: 'Nodemailer' }
    ]
  }
]

export function InstructionsModal({ isOpen, onClose }: InstructionsModalProps) {
  const [selectedFramework, setSelectedFramework] = useState<Framework>('laravel')
  const [port, setPort] = useState<number>(2500)

  useEffect(() => {
    if (isOpen) {
      // Load current port
      window.api.getSmtpPort().then(setPort).catch(console.error)
    }
  }, [isOpen])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getInstructions = () => {
    const host = '127.0.0.1'

    switch (selectedFramework) {
      case 'laravel':
        return {
          title: 'Laravel Configuration',
          notes: [
            { text: 'If you are using Vagrant/Homestead, use ', code: '10.0.2.2', suffix: ' as your SMTP-Host.' },
            { text: 'For Docker, use ', code: 'host.docker.internal', suffix: ' as your SMTP-Host.' }
          ],
          info: 'Feel free to define your own "Mailbox-Name". This will be the folder under which the incoming emails will be grouped in Pulsar.',
          sections: [
            {
              title: 'For Laravel 7+',
              code: `MAIL_MAILER=smtp
MAIL_HOST=${host}
MAIL_PORT=${port}
MAIL_USERNAME=Inbox-Name
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null`
            },
            {
              title: 'For Laravel 6 and below',
              code: `MAIL_DRIVER=smtp
MAIL_HOST=${host}
MAIL_PORT=${port}
MAIL_USERNAME=Inbox-Name
MAIL_PASSWORD=null`
            }
          ]
        }

      case 'rails':
        return {
          title: 'Ruby on Rails Configuration',
          notes: [
            { text: 'For Docker, use ', code: 'host.docker.internal', suffix: ' as your SMTP address.' }
          ],
          info: 'Add this to your config/environments/development.rb file:',
          sections: [
            {
              title: 'Configuration',
              code: `config.action_mailer.delivery_method = :smtp
config.action_mailer.smtp_settings = {
  address: '${host}',
  port: ${port},
  user_name: 'inbox-name',
  password: 'null',
  authentication: :plain,
  enable_starttls_auto: false
}`
            }
          ]
        }

      case 'ruby-smtp':
        return {
          title: 'Ruby net/smtp Configuration',
          info: 'Use the following Ruby code to send emails:',
          sections: [
            {
              title: 'Ruby Code',
              code: `require 'net/smtp'

message = <<~MESSAGE
  From: sender@example.com
  To: recipient@example.com
  Subject: Test Email

  This is a test email from Ruby!
MESSAGE

Net::SMTP.start('${host}', ${port}, 'localhost', 'inbox-name', 'null', :plain) do |smtp|
  smtp.send_message message, 'sender@example.com', 'recipient@example.com'
end`
            }
          ]
        }

      case 'php':
        return {
          title: 'PHP Configuration',
          info: 'Use PHPMailer or SwiftMailer to connect:',
          sections: [
            {
              title: 'PHPMailer',
              code: `<?php
use PHPMailer\\PHPMailer\\PHPMailer;

$mail = new PHPMailer();
$mail->isSMTP();
$mail->Host = '${host}';
$mail->Port = ${port};
$mail->SMTPAuth = true;
$mail->Username = 'inbox-name';
$mail->Password = 'null';
$mail->SMTPSecure = false;
$mail->SMTPAutoTLS = false;

$mail->setFrom('sender@example.com');
$mail->addAddress('recipient@example.com');
$mail->Subject = 'Test Email';
$mail->Body = 'This is a test email!';

$mail->send();`
            }
          ]
        }

      case 'symfony':
        return {
          title: 'Symfony Configuration',
          info: 'Add this to your .env file:',
          sections: [
            {
              title: 'Configuration',
              code: `MAILER_DSN=smtp://inbox-name:null@${host}:${port}`
            }
          ]
        }

      case 'wordpress':
        return {
          title: 'WordPress Configuration',
          info: 'Use the WP Mail SMTP plugin or add this to wp-config.php:',
          sections: [
            {
              title: 'wp-config.php',
              code: `define('SMTP_HOST', '${host}');
define('SMTP_PORT', ${port});
define('SMTP_USER', 'inbox-name');
define('SMTP_PASS', 'null');
define('SMTP_AUTH', true);
define('SMTP_SECURE', '');`
            }
          ]
        }

      case 'yii':
        return {
          title: 'Yii Framework Configuration',
          info: 'Add this to your configuration:',
          sections: [
            {
              title: 'Configuration',
              code: `'mailer' => [
    'class' => 'yii\\swiftmailer\\Mailer',
    'transport' => [
        'class' => 'Swift_SmtpTransport',
        'host' => '${host}',
        'port' => ${port},
        'username' => 'inbox-name',
        'password' => 'null',
        'encryption' => null,
    ],
]`
            }
          ]
        }

      case 'nodejs':
        return {
          title: 'Node.js Configuration',
          info: 'Use the nodemailer package:',
          sections: [
            {
              title: 'JavaScript Code',
              code: `const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: '${host}',
  port: ${port},
  secure: false,
  auth: {
    user: 'inbox-name',
    pass: 'null'
  }
});

await transporter.sendMail({
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Test Email',
  text: 'This is a test email!',
  html: '<p>This is a test email!</p>'
});`
            }
          ]
        }

      case 'nodemailer':
        return {
          title: 'Nodemailer Configuration',
          info: 'Use this configuration:',
          sections: [
            {
              title: 'JavaScript Code',
              code: `const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: '${host}',
  port: ${port},
  secure: false,
  auth: {
    user: 'inbox-name',
    pass: 'null'
  },
  tls: {
    rejectUnauthorized: false
  }
});

await transporter.sendMail({
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Test Email',
  text: 'This is a test email!',
  html: '<p>This is a test email!</p>'
});`
            }
          ]
        }
    }
  }

  if (!isOpen) return null

  const instructions = getInstructions()

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">Setup Instructions</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Framework Selector */}
          <div className="mb-6">
            <label htmlFor="framework" className="block text-sm font-medium text-gray-700 mb-2">
              Select Framework
            </label>
            <select
              id="framework"
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value as Framework)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {frameworkGroups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((fw) => (
                    <option key={fw.value} value={fw.value}>
                      {fw.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Notes */}
          {instructions.notes && instructions.notes.length > 0 && (
            <div className="mb-4 space-y-2">
              {instructions.notes.map((note, i) => (
                <p key={i} className="text-sm text-gray-600">
                  {note.text}
                  {note.code && (
                    <code className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded font-mono text-sm">
                      {note.code}
                    </code>
                  )}
                  {note.suffix}
                </p>
              ))}
            </div>
          )}

          {/* Info */}
          {instructions.info && (
            <p className="mb-4 text-sm text-gray-700">{instructions.info}</p>
          )}

          {/* Code Sections */}
          {instructions.sections.map((section, i) => (
            <div key={i} className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">{section.title}</h3>
                <button
                  onClick={() => handleCopy(section.code)}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
              </div>
              <pre className="bg-gray-50 border border-gray-200 rounded-md p-4 overflow-x-auto">
                <code className="text-sm font-mono text-gray-800 whitespace-pre">{section.code}</code>
              </pre>
            </div>
          ))}

          {/* Footer Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> The username you use will become the mailbox name in Pulsar. All emails sent with that username will appear in a mailbox with that name.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
