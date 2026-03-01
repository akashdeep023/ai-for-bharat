# Terraform outputs

output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_stage.main.invoke_url
}

output "users_table_name" {
  description = "DynamoDB users table name"
  value       = aws_dynamodb_table.users.name
}

output "schemes_table_name" {
  description = "DynamoDB schemes table name"
  value       = aws_dynamodb_table.schemes.name
}

output "crop_plans_table_name" {
  description = "DynamoDB crop plans table name"
  value       = aws_dynamodb_table.crop_plans.name
}

output "alerts_table_name" {
  description = "DynamoDB alerts table name"
  value       = aws_dynamodb_table.alerts.name
}

output "content_bucket_name" {
  description = "S3 content bucket name"
  value       = aws_s3_bucket.content.bucket
}

output "user_data_bucket_name" {
  description = "S3 user data bucket name"
  value       = aws_s3_bucket.user_data.bucket
}

output "auth_lambda_arn" {
  description = "Auth Lambda function ARN"
  value       = aws_lambda_function.auth.arn
}

output "recommendations_lambda_arn" {
  description = "Recommendations Lambda function ARN"
  value       = aws_lambda_function.recommendations.arn
}
