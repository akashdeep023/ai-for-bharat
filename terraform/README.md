# Terraform Infrastructure

This directory contains Infrastructure as Code (IaC) for the Farmer Decision Support Platform using Terraform.

## Architecture Overview

The infrastructure consists of:

- **API Gateway**: HTTP API for mobile app communication
- **Lambda Functions**: Serverless compute for business logic
- **DynamoDB Tables**: NoSQL database for user data, schemes, crop plans, and alerts
- **S3 Buckets**: Object storage for content and user data
- **CloudWatch**: Logging and monitoring
- **IAM Roles**: Security and access control

## Directory Structure

```
terraform/
├── main.tf              # Main configuration and provider setup
├── variables.tf         # Variable definitions
├── outputs.tf           # Output values
├── dynamodb.tf          # DynamoDB table definitions
├── s3.tf                # S3 bucket configurations
├── lambda.tf            # Lambda function definitions
├── api_gateway.tf       # API Gateway configuration
└── environments/        # Environment-specific variable files
    ├── development.tfvars
    ├── staging.tfvars
    └── production.tfvars
```

## Prerequisites

1. **AWS Account**: Active AWS account with appropriate permissions
2. **AWS CLI**: Installed and configured
3. **Terraform**: Version >= 1.0
4. **S3 Backend**: S3 bucket for Terraform state storage
5. **DynamoDB Table**: For state locking

## Initial Setup

### 1. Create S3 Bucket for State

```bash
aws s3 mb s3://farmer-platform-terraform-state --region ap-south-1
```

### 2. Enable Versioning on State Bucket

```bash
aws s3api put-bucket-versioning \
  --bucket farmer-platform-terraform-state \
  --versioning-configuration Status=Enabled
```

### 3. Create DynamoDB Table for State Locking

```bash
aws dynamodb create-table \
  --table-name farmer-platform-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
```

## Deployment

### Initialize Terraform

```bash
terraform init
```

### Plan Changes

#### Development:
```bash
terraform plan -var-file=environments/development.tfvars
```

#### Staging:
```bash
terraform plan -var-file=environments/staging.tfvars
```

#### Production:
```bash
terraform plan -var-file=environments/production.tfvars
```

### Apply Changes

#### Development:
```bash
terraform apply -var-file=environments/development.tfvars
```

#### Staging:
```bash
terraform apply -var-file=environments/staging.tfvars
```

#### Production:
```bash
terraform apply -var-file=environments/production.tfvars
```

### Destroy Infrastructure

```bash
terraform destroy -var-file=environments/<environment>.tfvars
```

## Resources Created

### DynamoDB Tables

1. **users**: User profile data
   - Primary Key: `userId`
   - GSI: `MobileNumberIndex` on `mobileNumber`

2. **schemes**: Government schemes information
   - Primary Key: `schemeId`

3. **crop_plans**: User crop planning data
   - Primary Key: `planId`
   - GSI: `UserIdIndex` on `userId`

4. **alerts**: User alerts and notifications
   - Primary Key: `alertId`
   - GSI: `UserIdIndex` on `userId`

### S3 Buckets

1. **content**: Training videos, images, documents
   - Versioning: Enabled
   - Encryption: AES256
   - Lifecycle: Archive to Glacier after 180 days

2. **user_data**: User-generated content
   - Versioning: Enabled
   - Encryption: AES256

### Lambda Functions

1. **auth**: Authentication and OTP management
   - Runtime: Node.js 18.x
   - Memory: 256 MB
   - Timeout: 30 seconds

2. **recommendations**: AI-powered recommendations
   - Runtime: Node.js 18.x
   - Memory: 512 MB
   - Timeout: 30 seconds

### API Gateway

- Type: HTTP API
- CORS: Enabled for all origins
- Logging: CloudWatch integration
- Routes:
  - `POST /auth`: Authentication endpoint
  - `GET /recommendations`: Recommendations endpoint

## Outputs

After successful deployment, Terraform outputs:

- `api_gateway_url`: API Gateway endpoint URL
- `users_table_name`: DynamoDB users table name
- `schemes_table_name`: DynamoDB schemes table name
- `crop_plans_table_name`: DynamoDB crop plans table name
- `alerts_table_name`: DynamoDB alerts table name
- `content_bucket_name`: S3 content bucket name
- `user_data_bucket_name`: S3 user data bucket name
- `auth_lambda_arn`: Auth Lambda function ARN
- `recommendations_lambda_arn`: Recommendations Lambda function ARN

## Environment Variables

Each environment has specific configurations:

### Development
- Lower resource limits
- Verbose logging enabled
- No point-in-time recovery

### Staging
- Production-like configuration
- Testing and validation environment
- Point-in-time recovery enabled

### Production
- High availability
- Point-in-time recovery enabled
- Enhanced monitoring
- Strict security policies

## Security Considerations

1. **Encryption**: All data encrypted at rest and in transit
2. **IAM Roles**: Least privilege access for Lambda functions
3. **S3 Buckets**: Public access blocked by default
4. **API Gateway**: Rate limiting and throttling configured
5. **DynamoDB**: Point-in-time recovery enabled in production

## Cost Optimization

1. **DynamoDB**: On-demand billing mode (pay per request)
2. **Lambda**: Pay per invocation and execution time
3. **S3**: Lifecycle policies for archival storage
4. **CloudWatch**: Log retention set to 30 days

## Monitoring

- CloudWatch Logs for Lambda functions
- API Gateway access logs
- DynamoDB metrics
- S3 bucket metrics

## Troubleshooting

### State Lock Issues

If state is locked:
```bash
terraform force-unlock <lock-id>
```

### Import Existing Resources

```bash
terraform import aws_dynamodb_table.users farmer-platform-users-development
```

### Validate Configuration

```bash
terraform validate
```

### Format Configuration

```bash
terraform fmt -recursive
```

## Best Practices

1. Always run `terraform plan` before `apply`
2. Use environment-specific tfvars files
3. Never commit sensitive data to version control
4. Use remote state with locking
5. Tag all resources appropriately
6. Review changes in pull requests
7. Test in development before staging/production

## Support

For infrastructure issues, contact the DevOps team.
