# Farmer Decision Support Platform

AI-Powered mobile application providing actionable farming guidance to Indian farmers through voice and regional languages.

## Project Overview

The Farmer Decision Support Platform integrates multiple data sources (weather, soil health, market prices, government schemes) to deliver personalized, step-by-step farming recommendations. Built with an offline-first architecture for low-connectivity rural areas.

## Technology Stack

### Mobile Application
- **Framework**: React Native 0.73
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS (NativeWind)
- **Local Storage**: SQLite
- **State Management**: React Context API
- **Navigation**: React Navigation

### Backend Infrastructure
- **Cloud Provider**: AWS (ap-south-1 region)
- **Compute**: AWS Lambda (Node.js 18.x)
- **API**: API Gateway (HTTP API)
- **Database**: DynamoDB (on-demand billing)
- **Storage**: Amazon S3
- **AI/ML**: AWS Bedrock
- **IaC**: Terraform

### Testing
- **Unit Tests**: Jest
- **Property-Based Tests**: fast-check
- **Component Tests**: React Native Testing Library
- **Coverage Target**: 80%

## Project Structure

```
.
├── src/
│   ├── components/       # Reusable React Native components
│   ├── screens/          # Screen components
│   ├── services/         # Business logic and API services
│   │   ├── api/          # API client modules
│   │   ├── storage/      # Local database services
│   │   └── sync/         # Sync service modules
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── config/           # Configuration files
├── lambda/               # AWS Lambda functions
│   ├── auth/             # Authentication service
│   └── recommendations/  # Recommendation engine
├── terraform/            # Infrastructure as Code
│   ├── environments/     # Environment-specific configs
│   ├── main.tf           # Main Terraform config
│   ├── variables.tf      # Variable definitions
│   ├── dynamodb.tf       # DynamoDB tables
│   ├── s3.tf             # S3 buckets
│   ├── lambda.tf         # Lambda functions
│   ├── api_gateway.tf    # API Gateway config
│   └── outputs.tf        # Output values
├── .github/
│   └── workflows/        # CI/CD pipelines
├── App.tsx               # Root application component
├── index.js              # Application entry point
└── package.json          # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- React Native development environment
- AWS CLI (for infrastructure deployment)
- Terraform >= 1.0 (for infrastructure management)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd farmer-decision-support-platform
```

2. Install dependencies:
```bash
npm install
```

3. Install iOS dependencies (macOS only):
```bash
cd ios && pod install && cd ..
```

### Development

#### Run on Android:
```bash
npm run android
```

#### Run on iOS (macOS only):
```bash
npm run ios
```

#### Start Metro bundler:
```bash
npm start
```

### Testing

#### Run all tests:
```bash
npm test
```

#### Run tests in watch mode:
```bash
npm run test:watch
```

#### Generate coverage report:
```bash
npm run test:coverage
```

### Code Quality

#### Run linter:
```bash
npm run lint
```

#### Fix linting issues:
```bash
npm run lint:fix
```

#### Format code:
```bash
npm run format
```

#### Type check:
```bash
npm run type-check
```

## Infrastructure Deployment

### Prerequisites

1. Configure AWS credentials:
```bash
aws configure
```

2. Create S3 bucket for Terraform state:
```bash
aws s3 mb s3://farmer-platform-terraform-state --region ap-south-1
```

3. Create DynamoDB table for state locking:
```bash
aws dynamodb create-table \
  --table-name farmer-platform-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
```

### Deploy Infrastructure

#### Development Environment:
```bash
cd terraform
terraform init
terraform plan -var-file=environments/development.tfvars
terraform apply -var-file=environments/development.tfvars
```

#### Staging Environment:
```bash
terraform plan -var-file=environments/staging.tfvars
terraform apply -var-file=environments/staging.tfvars
```

#### Production Environment:
```bash
terraform plan -var-file=environments/production.tfvars
terraform apply -var-file=environments/production.tfvars
```

### Destroy Infrastructure:
```bash
terraform destroy -var-file=environments/<environment>.tfvars
```

## Environment Configuration

Create environment-specific `.env` files:

### .env.development
```
NODE_ENV=development
API_BASE_URL=http://localhost:3000/api
```

### .env.staging
```
NODE_ENV=staging
API_BASE_URL=https://staging-api.farmer-platform.com/api
STAGING_API_KEY=<your-staging-api-key>
```

### .env.production
```
NODE_ENV=production
API_BASE_URL=https://api.farmer-platform.com/api
PRODUCTION_API_KEY=<your-production-api-key>
```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

### CI Pipeline (`.github/workflows/ci.yml`)
- Runs on push and pull requests
- Executes linting, type checking, and tests
- Generates coverage reports
- Performs security scanning

### Deploy Pipeline (`.github/workflows/deploy.yml`)
- Deploys to AWS based on branch:
  - `develop` → Development environment
  - `staging` → Staging environment
  - `main` → Production environment
- Applies Terraform infrastructure changes
- Deploys Lambda functions

### Required GitHub Secrets

- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `SNYK_TOKEN`: Snyk security scanning token

## Key Features (Planned)

- ✅ Project setup and infrastructure
- ⏳ OTP-based authentication
- ⏳ User profile management
- ⏳ Crop recommendations with AI
- ⏳ Fertilizer guidance
- ⏳ Seed selection intelligence
- ⏳ Weather forecasts and alerts
- ⏳ Market price intelligence
- ⏳ Government schemes navigator
- ⏳ Soil health insights
- ⏳ Training and learning content
- ⏳ Voice interface (10+ languages)
- ⏳ Offline-first architecture
- ⏳ Data synchronization

## Performance Requirements

- App size: < 50 MB
- Minimum device: Android 8.0, 2 GB RAM
- API response time: < 3 seconds
- Dashboard load time: < 2 seconds (offline)
- Battery usage: < 5% per hour
- Local storage limit: 500 MB

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Ensure all tests pass
4. Submit a pull request

## License

[License information to be added]

## Support

For issues and questions, please contact the development team.
