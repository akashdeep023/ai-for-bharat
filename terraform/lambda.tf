# Lambda functions and IAM roles

# IAM role for Lambda functions
resource "aws_iam_role" "lambda_execution" {
  name = "${var.project_name}-lambda-execution-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-lambda-execution-${var.environment}"
  }
}

# Attach basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Policy for DynamoDB access
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${var.project_name}-lambda-dynamodb-${var.environment}"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          aws_dynamodb_table.user_profiles.arn,
          aws_dynamodb_table.otp.arn,
          aws_dynamodb_table.sessions.arn,
          aws_dynamodb_table.schemes.arn,
          aws_dynamodb_table.crop_plans.arn,
          aws_dynamodb_table.alerts.arn,
          "${aws_dynamodb_table.users.arn}/index/*",
          "${aws_dynamodb_table.user_profiles.arn}/index/*",
          "${aws_dynamodb_table.sessions.arn}/index/*",
          "${aws_dynamodb_table.crop_plans.arn}/index/*",
          "${aws_dynamodb_table.alerts.arn}/index/*"
        ]
      }
    ]
  })
}

# Policy for SNS access (SMS sending)
resource "aws_iam_role_policy" "lambda_sns" {
  name = "${var.project_name}-lambda-sns-${var.environment}"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = "*"
      }
    ]
  })
}

# Policy for S3 access
resource "aws_iam_role_policy" "lambda_s3" {
  name = "${var.project_name}-lambda-s3-${var.environment}"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "${aws_s3_bucket.content.arn}/*",
          "${aws_s3_bucket.user_data.arn}/*"
        ]
      }
    ]
  })
}

# Authentication Lambda function
resource "aws_lambda_function" "auth" {
  filename         = "lambda/auth.zip"
  function_name    = "${var.project_name}-auth-${var.environment}"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "index.handler"
  runtime         = var.lambda_runtime
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      ENVIRONMENT   = var.environment
      USER_TABLE    = aws_dynamodb_table.users.name
      OTP_TABLE     = aws_dynamodb_table.otp.name
      SESSION_TABLE = aws_dynamodb_table.sessions.name
      JWT_SECRET    = var.jwt_secret
      MOCK_SMS      = var.environment == "development" ? "true" : "false"
    }
  }

  tags = {
    Name = "${var.project_name}-auth-${var.environment}"
  }
}

# Recommendations Lambda function
resource "aws_lambda_function" "recommendations" {
  filename         = "lambda/recommendations.zip"
  function_name    = "${var.project_name}-recommendations-${var.environment}"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "index.handler"
  runtime         = var.lambda_runtime
  timeout         = 30
  memory_size     = 512

  environment {
    variables = {
      ENVIRONMENT = var.environment
      USERS_TABLE = aws_dynamodb_table.users.name
    }
  }

  tags = {
    Name = "${var.project_name}-recommendations-${var.environment}"
  }
}

# Profile Lambda function
resource "aws_lambda_function" "profile" {
  filename         = "lambda/profile.zip"
  function_name    = "${var.project_name}-profile-${var.environment}"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "index.handler"
  runtime         = var.lambda_runtime
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      ENVIRONMENT    = var.environment
      PROFILES_TABLE = aws_dynamodb_table.user_profiles.name
    }
  }

  tags = {
    Name = "${var.project_name}-profile-${var.environment}"
  }
}
