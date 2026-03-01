# API Gateway configuration

resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-api-${var.environment}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization", "X-Api-Key"]
    max_age       = 300
  }

  tags = {
    Name = "${var.project_name}-api-${var.environment}"
  }
}

# API Gateway stage
resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.environment
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }

  tags = {
    Name = "${var.project_name}-api-stage-${var.environment}"
  }
}

# CloudWatch log group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.project_name}-${var.environment}"
  retention_in_days = 30

  tags = {
    Name = "${var.project_name}-api-logs-${var.environment}"
  }
}

# Lambda integration for auth
resource "aws_apigatewayv2_integration" "auth" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.auth.invoke_arn
}

# Auth routes
resource "aws_apigatewayv2_route" "auth_send_otp" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /auth/sendOTP"
  target    = "integrations/${aws_apigatewayv2_integration.auth.id}"
}

resource "aws_apigatewayv2_route" "auth_verify_otp" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /auth/verifyOTP"
  target    = "integrations/${aws_apigatewayv2_integration.auth.id}"
}

resource "aws_apigatewayv2_route" "auth_refresh_token" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /auth/refreshToken"
  target    = "integrations/${aws_apigatewayv2_integration.auth.id}"
}

resource "aws_apigatewayv2_route" "auth_logout" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /auth/logout"
  target    = "integrations/${aws_apigatewayv2_integration.auth.id}"
}

resource "aws_lambda_permission" "auth_api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auth.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Lambda integration for recommendations
resource "aws_apigatewayv2_integration" "recommendations" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.recommendations.invoke_arn
}

resource "aws_apigatewayv2_route" "recommendations_get" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /recommendations"
  target    = "integrations/${aws_apigatewayv2_integration.recommendations.id}"
}

resource "aws_lambda_permission" "recommendations_api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.recommendations.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Lambda integration for profile
resource "aws_apigatewayv2_integration" "profile" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.profile.invoke_arn
}

# Profile routes
resource "aws_apigatewayv2_route" "profile_create" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /profile"
  target    = "integrations/${aws_apigatewayv2_integration.profile.id}"
}

resource "aws_apigatewayv2_route" "profile_get" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /profile/{userId}"
  target    = "integrations/${aws_apigatewayv2_integration.profile.id}"
}

resource "aws_apigatewayv2_route" "profile_get_by_mobile" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /profile"
  target    = "integrations/${aws_apigatewayv2_integration.profile.id}"
}

resource "aws_apigatewayv2_route" "profile_update" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PUT /profile/{userId}"
  target    = "integrations/${aws_apigatewayv2_integration.profile.id}"
}

resource "aws_apigatewayv2_route" "profile_delete" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "DELETE /profile/{userId}"
  target    = "integrations/${aws_apigatewayv2_integration.profile.id}"
}

resource "aws_lambda_permission" "profile_api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.profile.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
