# Setup Instructions

## Quick Start

### Prerequisites Check

Before starting, ensure you have:

- ✅ Node.js >= 18.0.0
- ✅ npm >= 9.0.0
- ✅ Git
- ✅ React Native development environment (for mobile development)
- ✅ AWS CLI (for infrastructure deployment)
- ✅ Terraform >= 1.0 (for infrastructure management)

### Verify Prerequisites

```bash
# Check Node.js version
node --version  # Should be v18.0.0 or higher

# Check npm version
npm --version   # Should be 9.0.0 or higher

# Check Git
git --version

# Check AWS CLI (optional, for deployment)
aws --version

# Check Terraform (optional, for infrastructure)
terraform --version
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd farmer-decision-support-platform
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- React Native and related packages
- TypeScript and type definitions
- Testing frameworks (Jest, fast-check)
- Development tools (ESLint, Prettier)

### 3. Verify Installation

```bash
# Run type check
npm run type-check

# Run linter
npm run lint

# Run tests
npm test
```

### 4. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

### 5. Initialize Local Database

The SQLite database will be automatically initialized when you first run the app.

## Mobile Development Setup

### Android Setup

1. Install Android Studio
2. Configure Android SDK
3. Set up Android emulator or connect physical device
4. Run the app:

```bash
npm run android
```

### iOS Setup (macOS only)

1. Install Xcode from App Store
2. Install CocoaPods:

```bash
sudo gem install cocoapods
```

3. Install iOS dependencies:

```bash
cd ios
pod install
cd ..
```

4. Run the app:

```bash
npm run ios
```

## Infrastructure Setup

### AWS Prerequisites

1. Create AWS account
2. Configure AWS CLI:

```bash
aws configure
```

3. Create S3 bucket for Terraform state:

```bash
aws s3 mb s3://farmer-platform-terraform-state --region ap-south-1
```

4. Create DynamoDB table for state locking:

```bash
aws dynamodb create-table \
  --table-name farmer-platform-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
```

### Deploy Infrastructure

```bash
cd terraform

# Initialize Terraform
terraform init

# Plan deployment (development)
terraform plan -var-file=environments/development.tfvars

# Apply deployment
terraform apply -var-file=environments/development.tfvars
```

## Development Workflow

### Start Development Server

```bash
# Start Metro bundler
npm start
```

In a new terminal:

```bash
# Run on Android
npm run android

# OR run on iOS
npm run ios
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

## Troubleshooting

### Common Issues

#### 1. Metro Bundler Port Already in Use

```bash
# Kill process on port 8081
npx react-native start --reset-cache
```

#### 2. Android Build Fails

```bash
# Clean Android build
cd android
./gradlew clean
cd ..
npm run android
```

#### 3. iOS Build Fails

```bash
# Clean iOS build
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

#### 4. Dependencies Installation Issues

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules
npm install
```

#### 5. TypeScript Errors

```bash
# Restart TypeScript server in your IDE
# Or run type check
npm run type-check
```

### Getting Help

- Check existing GitHub issues
- Review documentation in README.md
- Contact development team

## Next Steps

After successful setup:

1. ✅ Verify all tests pass
2. ✅ Run the app on emulator/device
3. ✅ Review project structure
4. ✅ Read CONTRIBUTING.md for development guidelines
5. ✅ Start implementing features from tasks.md

## Verification Checklist

- [ ] Node.js and npm installed
- [ ] Dependencies installed successfully
- [ ] Tests run without errors
- [ ] Linter passes
- [ ] Type check passes
- [ ] App runs on emulator/device
- [ ] Environment variables configured
- [ ] AWS credentials configured (if deploying)
- [ ] Terraform initialized (if deploying)

## Quick Reference

### Useful Commands

```bash
# Development
npm start                 # Start Metro bundler
npm run android          # Run on Android
npm run ios              # Run on iOS

# Testing
npm test                 # Run tests
npm run test:coverage    # Run with coverage
npm run test:watch       # Watch mode

# Code Quality
npm run lint             # Run linter
npm run lint:fix         # Fix linting issues
npm run format           # Format code
npm run type-check       # Type check

# Infrastructure
cd terraform
terraform plan -var-file=environments/development.tfvars
terraform apply -var-file=environments/development.tfvars
```

### Project Structure

```
farmer-decision-support-platform/
├── src/                 # Source code
│   ├── components/      # React components
│   ├── screens/         # Screen components
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilities
│   └── config/          # Configuration
├── lambda/              # AWS Lambda functions
├── terraform/           # Infrastructure as Code
├── scripts/             # Utility scripts
└── .github/             # CI/CD workflows
```

---

**Need Help?** Check README.md or CONTRIBUTING.md for more details.
