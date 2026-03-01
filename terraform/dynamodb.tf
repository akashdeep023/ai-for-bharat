# DynamoDB tables for the platform

# User profiles table
resource "aws_dynamodb_table" "user_profiles" {
  name           = "${var.project_name}-user-profiles-${var.environment}"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "mobileNumber"
    type = "S"
  }

  global_secondary_index {
    name            = "MobileNumberIndex"
    hash_key        = "mobileNumber"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  tags = {
    Name = "${var.project_name}-user-profiles-${var.environment}"
  }
}

# Users table
resource "aws_dynamodb_table" "users" {
  name           = "${var.project_name}-users-${var.environment}"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "mobileNumber"

  attribute {
    name = "mobileNumber"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "UserIdIndex"
    hash_key        = "userId"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  tags = {
    Name = "${var.project_name}-users-${var.environment}"
  }
}

# OTP table for authentication
resource "aws_dynamodb_table" "otp" {
  name           = "${var.project_name}-otp-${var.environment}"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "mobileNumber"

  attribute {
    name = "mobileNumber"
    type = "S"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  tags = {
    Name = "${var.project_name}-otp-${var.environment}"
  }
}

# Sessions table for authentication
resource "aws_dynamodb_table" "sessions" {
  name           = "${var.project_name}-sessions-${var.environment}"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "sessionId"

  attribute {
    name = "sessionId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "UserIdIndex"
    hash_key        = "userId"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  tags = {
    Name = "${var.project_name}-sessions-${var.environment}"
  }
}

# Schemes table
resource "aws_dynamodb_table" "schemes" {
  name           = "${var.project_name}-schemes-${var.environment}"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "schemeId"

  attribute {
    name = "schemeId"
    type = "S"
  }

  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  tags = {
    Name = "${var.project_name}-schemes-${var.environment}"
  }
}

# Crop plans table
resource "aws_dynamodb_table" "crop_plans" {
  name           = "${var.project_name}-crop-plans-${var.environment}"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "planId"

  attribute {
    name = "planId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "UserIdIndex"
    hash_key        = "userId"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  tags = {
    Name = "${var.project_name}-crop-plans-${var.environment}"
  }
}

# Alerts table
resource "aws_dynamodb_table" "alerts" {
  name           = "${var.project_name}-alerts-${var.environment}"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "alertId"

  attribute {
    name = "alertId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "UserIdIndex"
    hash_key        = "userId"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  tags = {
    Name = "${var.project_name}-alerts-${var.environment}"
  }
}
