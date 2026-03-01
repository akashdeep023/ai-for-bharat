#!/bin/bash

# Development environment setup script

set -e

echo "Setting up development environment..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "Error: Node.js version 18 or higher is required"
  exit 1
fi

echo "✓ Node.js version check passed"

# Install dependencies
echo "Installing dependencies..."
npm install

echo "✓ Dependencies installed"

# Setup git hooks (if using husky)
if [ -d ".git" ]; then
  echo "Setting up git hooks..."
  # Add husky setup here if needed
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
  echo "Creating .env file..."
  cat > .env << EOF
NODE_ENV=development
API_BASE_URL=http://localhost:3000/api
EOF
  echo "✓ .env file created"
fi

# Run type check
echo "Running type check..."
npm run type-check

echo "✓ Type check passed"

# Run linter
echo "Running linter..."
npm run lint

echo "✓ Linter passed"

# Run tests
echo "Running tests..."
npm test

echo "✓ Tests passed"

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start Metro bundler: npm start"
echo "  2. Run on Android: npm run android"
echo "  3. Run on iOS: npm run ios"
echo ""
