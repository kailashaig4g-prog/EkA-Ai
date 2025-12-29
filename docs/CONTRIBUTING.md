# Contributing to EkA-Ai

Thank you for your interest in contributing to EkA-Ai! We welcome contributions from the community.

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming and inclusive environment.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/kailashaig4g-prog/EkA-Ai/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check existing [Issues](https://github.com/kailashaig4g-prog/EkA-Ai/issues) for similar suggestions
2. Create a new issue with:
   - Clear description of the feature
   - Use case and benefits
   - Potential implementation approach

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/EkA-Ai.git
   cd EkA-Ai
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the coding standards (see below)
   - Write tests for new features
   - Update documentation as needed

4. **Test your changes**
   ```bash
   npm test
   npm run lint
   ```

5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Ensure CI checks pass

## Coding Standards

### JavaScript Style Guide

- Use ES6+ features
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Run `npm run lint` before committing

### Naming Conventions

- **Files**: camelCase for files (e.g., `userController.js`)
- **Classes**: PascalCase (e.g., `UserService`)
- **Functions**: camelCase (e.g., `getUserById`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Private variables**: prefix with underscore (e.g., `_privateVar`)

### Code Organization

```javascript
// 1. Imports
const express = require('express');
const { someUtil } = require('./utils');

// 2. Constants
const MAX_RETRIES = 3;

// 3. Main code
const doSomething = () => {
  // Implementation
};

// 4. Exports
module.exports = { doSomething };
```

### Comments

- Use JSDoc for function documentation
- Explain "why" not "what" in comments
- Keep comments up-to-date with code changes

```javascript
/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object
 * @throws {ApiError} If user not found
 */
const getUserById = async (userId) => {
  // Implementation
};
```

## Testing

### Writing Tests

- Place tests in `tests/` directory
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Aim for 80%+ code coverage

```javascript
describe('UserController', () => {
  describe('getUser', () => {
    it('should return user when valid ID provided', async () => {
      // Arrange
      const userId = 'valid-id';
      
      // Act
      const result = await getUserById(userId);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
    });
  });
});
```

### Running Tests

```bash
# All tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm run test:watch

# Specific test file
npm test -- tests/unit/controllers/userController.test.js
```

## Documentation

- Update README.md for major changes
- Update API.md for API changes
- Add inline comments for complex logic
- Update CHANGELOG.md

## Git Workflow

### Commit Messages

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add OAuth2 authentication

fix(chat): resolve message ordering issue

docs(api): update authentication endpoints
```

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation
- `refactor/code-improvement` - Refactoring

## Review Process

1. Maintainer review (1-2 business days)
2. Address feedback with new commits
3. Once approved, maintainer will merge
4. Your contribution will be acknowledged!

## Development Setup

### Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Run tests in watch mode
npm run test:watch
```

### Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## Areas for Contribution

Looking for ideas? Here are areas where we need help:

### High Priority
- [ ] Additional test coverage
- [ ] Performance optimizations
- [ ] Documentation improvements
- [ ] Bug fixes

### Medium Priority
- [ ] New features from roadmap
- [ ] Code refactoring
- [ ] UI/UX improvements

### Nice to Have
- [ ] Translation support
- [ ] Example applications
- [ ] Integration guides

## Questions?

- 💬 Discord: [Join our community](https://discord.gg/eka-ai)
- 📧 Email: dev@eka-ai.com
- 📖 Documentation: [docs/](.)

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Featured on our website (major contributions)

## License

By contributing, you agree that your contributions will be licensed under the GPL-3.0 License.

---

Thank you for contributing to EkA-Ai! 🚗💨
