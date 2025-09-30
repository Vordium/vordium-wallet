# Contributing to Vordium Wallet

Thank you for your interest in contributing to Vordium Wallet! 🚀

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Use the bug report template
3. Include:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment (OS, browser, etc.)

### Suggesting Features

1. Check existing feature requests
2. Explain the use case
3. Describe the proposed solution
4. Consider alternatives

### Pull Requests

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Follow code style guidelines
4. **Test**: Ensure all tests pass
5. **Commit**: Use clear commit messages
6. **Push**: `git push origin feature/amazing-feature`
7. **Submit PR**: Use the PR template

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/vordium-wallet.git
cd vordium-wallet

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## Code Style

- Use TypeScript
- Follow existing patterns
- Add comments for complex logic
- Use meaningful variable names
- Format with Prettier
- Lint with ESLint

## Testing

Before submitting:

```bash
npm run lint
npm run build
```

## Commit Messages

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructure
- `test:` Tests
- `chore:` Maintenance

Example: `feat: add support for Arbitrum network`

## Security

⚠️ **Never commit**:
- Private keys
- API keys
- Mnemonics
- Passwords

Report security issues privately to: security@vordium.com

## Questions?

Open a discussion: https://github.com/Vordium/vordium-wallet/discussions

Thank you for contributing! 🙏
