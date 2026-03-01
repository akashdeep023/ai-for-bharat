// Authentication Lambda function

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AuthenticationManager } from './authenticationManager';

const authManager = new AuthenticationManager();

/**
 * Main Lambda handler for authentication endpoints
 * Routes:
 * - POST /auth/sendOTP - Send OTP to mobile number
 * - POST /auth/verifyOTP - Verify OTP and create session
 * - POST /auth/refreshToken - Refresh authentication token
 * - POST /auth/logout - Logout and delete session
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Auth request:', JSON.stringify(event, null, 2));

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const path = event.path;
    const body = JSON.parse(event.body || '{}');

    // Route to appropriate handler
    switch (path) {
      case '/auth/sendOTP':
        return await handleSendOTP(body, headers);

      case '/auth/verifyOTP':
        return await handleVerifyOTP(body, headers);

      case '/auth/refreshToken':
        return await handleRefreshToken(body, headers);

      case '/auth/logout':
        return await handleLogout(event, headers);

      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            error: 'Endpoint not found',
          }),
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

/**
 * Handle sendOTP request
 */
async function handleSendOTP(
  body: any,
  headers: Record<string, string>
): Promise<APIGatewayProxyResult> {
  const { mobileNumber } = body;

  // Validate input
  if (!mobileNumber) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Mobile number is required',
      }),
    };
  }

  // Send OTP
  const result = await authManager.sendOTP(mobileNumber);

  if (!result.success) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: result.message || 'Failed to send OTP',
        attemptsRemaining: result.attemptsRemaining,
      }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: result.message,
      expiresAt: result.expiresAt,
      attemptsRemaining: result.attemptsRemaining,
    }),
  };
}

/**
 * Handle verifyOTP request
 */
async function handleVerifyOTP(
  body: any,
  headers: Record<string, string>
): Promise<APIGatewayProxyResult> {
  const { mobileNumber, otp, deviceId } = body;

  // Validate input
  if (!mobileNumber || !otp) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Mobile number and OTP are required',
      }),
    };
  }

  if (!deviceId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Device ID is required',
      }),
    };
  }

  // Verify OTP
  const result = await authManager.verifyOTP(mobileNumber, otp, deviceId);

  if (!result.success) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        error: result.message,
        attemptsRemaining: result.attemptsRemaining,
      }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: result.message,
      authToken: result.authToken,
    }),
  };
}

/**
 * Handle refreshToken request
 */
async function handleRefreshToken(
  body: any,
  headers: Record<string, string>
): Promise<APIGatewayProxyResult> {
  const { token } = body;

  // Validate input
  if (!token) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Token is required',
      }),
    };
  }

  // Refresh token
  const result = await authManager.refreshToken(token);

  if (!result.success) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        error: result.message,
      }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: result.message,
      authToken: result.authToken,
    }),
  };
}

/**
 * Handle logout request
 */
async function handleLogout(
  event: APIGatewayProxyEvent,
  headers: Record<string, string>
): Promise<APIGatewayProxyResult> {
  // Get token from Authorization header
  const authHeader = event.headers.Authorization || event.headers.authorization;
  
  if (!authHeader) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        error: 'Authorization header is required',
      }),
    };
  }

  // Extract token (format: "Bearer <token>")
  const token = authHeader.replace('Bearer ', '');

  // Logout
  const result = await authManager.logout(token);

  if (!result.success) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: result.message,
      }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: result.message,
    }),
  };
}
