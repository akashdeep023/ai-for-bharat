# Authentication Lambda Function

This Lambda function handles all authentication-related operations for the Farmer Decision Support Platform.

## Features

- **OTP Generation and Delivery**: Generates cryptographically secure 6-digit OTPs and sends them via SMS
- **OTP Validation**: Validates OTPs with 5-minute expiration and 3-attempt limit
- **Session Management**: Creates and manages user sessions with JWT tokens
- **Token Refresh**: Allows refreshing expired tokens
- **Logout**: Securely terminates user sessions
- **30-Day Inactivity Timeout**: Automatically logs out users after 30 days of inactivity

## API Endpoints

### POST /auth/sendOTP
Send OTP to a mobile number for authentication.

**Request Body:**
```json
{
  "mobileNumber": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresAt": "2024-01-15T10:35:00.000Z",
  "attemptsRemaining": 3
}
```

### POST /auth/verifyOTP
Verify OTP and create a session.

**Request Body:**
```json
{
  "mobileNumber": "+919876543210",
  "otp": "123456",
  "deviceId": "device-unique-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "authToken": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "user_abc123",
    "expiresAt": "2024-02-14T10:30:00.000Z"
  }
}
```

### POST /auth/refreshToken
Refresh an authentication token.

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "authToken": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "user_abc123",
    "expiresAt": "2024-02-14T10:30:00.000Z"
  }
}
```

### POST /auth/logout
Logout and delete the session.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Environment Variables

- `OTP_TABLE`: DynamoDB table name for OTP storage (default: `farmer-platform-otp`)
- `SESSION_TABLE`: DynamoDB table name for session storage (default: `farmer-platform-sessions`)
- `USER_TABLE`: DynamoDB table name for user storage (default: `farmer-platform-users`)
- `JWT_SECRET`: Secret key for JWT token generation (required in production)
- `NODE_ENV`: Environment (development/production)
- `MOCK_SMS`: Set to 'true' to mock SMS sending for testing
- `MSG91_API_KEY`: API key for MSG91 SMS service (optional)
- `MSG91_SENDER_ID`: Sender ID for MSG91 (default: `FARMPL`)

## DynamoDB Tables

### OTP Table
- **Primary Key**: `mobileNumber` (String)
- **Attributes**: `otp`, `expiresAt`, `attempts`, `createdAt`
- **TTL**: Set on `expiresAt` for automatic cleanup

### Session Table
- **Primary Key**: `sessionId` (String)
- **Attributes**: `userId`, `authToken`, `deviceId`, `expiresAt`, `lastActivityAt`, `createdAt`
- **TTL**: Set on `expiresAt` for automatic cleanup

### User Table
- **Primary Key**: `mobileNumber` (String)
- **Attributes**: `userId`, `createdAt`, `updatedAt`

## Security Features

1. **Cryptographically Secure OTP**: Uses Node.js crypto module for random number generation
2. **JWT Tokens**: Signed tokens with expiration
3. **Rate Limiting**: 3 attempts per OTP
4. **Time-based Expiration**: 5-minute OTP expiration, 30-day session expiration
5. **Inactivity Timeout**: 30-day automatic logout
6. **Input Validation**: Validates mobile number format (Indian numbers)

## Building and Deployment

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Package for deployment
cd ../..
./scripts/package-lambda.sh auth
```

## Testing

The authentication module includes comprehensive property-based tests using fast-check to validate:
- OTP generation and delivery
- OTP validation with expiration and attempt limits
- Session creation and management
- Token refresh functionality
- Inactivity timeout behavior

See the test files for detailed test cases.
