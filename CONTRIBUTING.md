# Contributing to Farmer Decision Support Platform

Thank you for your interest in contributing to the Farmer Decision Support Platform!

## Development Setup

1. **Fork and clone the repository**
```bash
git clone <your-fork-url>
cd farmer-decision-support-platform
```

2. **Run the setup script**
```bash
./scripts/setup-dev.sh
```

3. **Start development**
```bash
npm start
npm run android  # or npm run ios
```

## Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `staging`: Pre-production testing
- `develop`: Active development
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical production fixes

### Creating a Feature

1. Create a feature branch from `develop`:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

2. Make your changes following the coding standards

3. Write tests for your changes

4. Ensure all tests pass:
```bash
npm test
npm run lint
npm run type-check
```

5. Commit your changes:
```bash
git add .
git commit -m "feat: add your feature description"
```

6. Push and create a pull request:
```bash
git push origin feature/your-feature-name
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Define explicit types for function parameters and return values
- Avoid using `any` type
- Use interfaces for object shapes
- Use enums for fixed sets of values

### React Native

- Use functional components with hooks
- Follow React best practices
- Use meaningful component and variable names
- Keep components small and focused
- Extract reusable logic into custom hooks

### File Naming

- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Tests: `*.test.ts` or `*.spec.ts`
- Property tests: `*.property.test.ts`

### Code Style

- Use Prettier for formatting (automatic)
- Use ESLint rules (automatic)
- Maximum line length: 100 characters
- Use single quotes for strings
- Use trailing commas in objects and arrays

## Testing Requirements

### Unit Tests

- Write unit tests for all business logic
- Test edge cases and error conditions
- Use descriptive test names
- Aim for 80%+ code coverage

Example:
```typescript
describe('UserService', () => {
  it('should create user with valid data', async () => {
    const userData = { name: 'Test', mobile: '1234567890' };
    const result = await userService.createUser(userData);
    expect(result).toBeDefined();
  });
});
```

### Property-Based Tests

- Write property tests for core logic
- Use fast-check library
- Run minimum 100 iterations
- Link to design document properties

Example:
```typescript
// Feature: farmer-decision-support-platform, Property 5: Data Synchronization Round-Trip
it('should preserve data integrity in sync round-trip', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({ userId: fc.uuid(), data: fc.string() }),
      async (testData) => {
        await localDB.store(testData);
        await syncService.sync();
        const retrieved = await localDB.get(testData.userId);
        expect(retrieved).toEqual(testData);
      }
    ),
    { numRuns: 100 }
  );
});
```

## Commit Message Format

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add voice navigation for dashboard
fix: resolve OTP validation timeout issue
docs: update API documentation
test: add property tests for sync service
```

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure CI passes** (linting, tests, type checking)
4. **Request review** from maintainers
5. **Address feedback** promptly
6. **Squash commits** if requested

### PR Title Format

Use conventional commit format:
```
feat: add government schemes navigator
fix: resolve offline sync conflicts
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Property tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass locally
- [ ] No new warnings
```

## Code Review Guidelines

### For Authors

- Keep PRs focused and small
- Provide context in description
- Respond to feedback constructively
- Update PR based on feedback

### For Reviewers

- Be respectful and constructive
- Focus on code quality and correctness
- Check for test coverage
- Verify documentation updates
- Test changes locally if needed

## Infrastructure Changes

### Terraform

- Test changes in development first
- Run `terraform plan` before `apply`
- Document resource changes
- Update terraform/README.md if needed

### Lambda Functions

- Package functions using `scripts/package-lambda.sh`
- Test locally before deployment
- Update environment variables if needed
- Monitor CloudWatch logs after deployment

## Documentation

- Update README.md for user-facing changes
- Update inline code comments
- Update API documentation
- Add JSDoc comments for public functions

## Getting Help

- Check existing issues and PRs
- Ask questions in pull request comments
- Contact maintainers for guidance

## License

By contributing, you agree that your contributions will be licensed under the project's license.
