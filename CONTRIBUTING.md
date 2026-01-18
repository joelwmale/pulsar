# Contributing to Pulsar

Thank you for your interest in contributing to Pulsar! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful and constructive in all interactions. We're all here to build something great together.

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check the existing issues to avoid duplicates
2. Collect information about the bug (OS, version, steps to reproduce)
3. Include screenshots if applicable

Create an issue with:
- Clear, descriptive title
- Detailed description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Pulsar version, etc.)

### Suggesting Features

Feature suggestions are welcome! Please:
1. Check existing feature requests first
2. Clearly describe the feature and its use case
3. Explain why it would be useful to most users

### Pull Requests

1. **Fork the repository** and create your branch from `main`
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**
   - Write clear, concise commit messages
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run dev  # Test in development
   npm run build  # Ensure it builds
   ```

4. **Submit the pull request**
   - Clearly describe what you changed and why
   - Reference any related issues
   - Ensure CI passes (if applicable)

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git

### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/pulsar.git
cd pulsar

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define interfaces for all data structures
- Avoid `any` types when possible
- Use descriptive variable and function names

### React

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use TypeScript for prop types

### File Organization

- Place components in appropriate directories
- Keep related files together
- Use index files for cleaner imports

### Naming Conventions

- **Components**: PascalCase (e.g., `EmailViewer.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useMailboxes.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase (e.g., `EmailDetail`)

## Project Architecture

### Main Process (`src/main/`)

Handles:
- SMTP server
- Database operations
- IPC communication with renderer
- File system operations

### Preload (`src/preload/`)

- Exposes safe APIs to renderer using contextBridge
- Maintains security boundary

### Renderer (`src/renderer/`)

- React application
- UI components
- User interactions
- Calls preload APIs

## Testing

Currently, testing is done manually. Automated testing contributions are welcome!

Manual testing checklist:
- [ ] SMTP server starts successfully
- [ ] Emails are received and stored
- [ ] Mailboxes appear in sidebar
- [ ] Emails display correctly (HTML, text, raw)
- [ ] Attachments can be downloaded
- [ ] Real-time updates work
- [ ] App closes cleanly

## Documentation

When adding features:
- Update README.md if user-facing
- Add JSDoc comments to functions
- Update CONTRIBUTING.md if process changes

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add dark mode toggle
fix: correct email date formatting
docs: update installation instructions
refactor: simplify mailbox query logic
```

Prefixes:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Release Process

Releases are managed by maintainers. Version numbers follow [Semantic Versioning](https://semver.org/):
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

## Questions?

Feel free to:
- Open a discussion on GitHub
- Ask in an issue
- Contact the maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Pulsar! 🚀
