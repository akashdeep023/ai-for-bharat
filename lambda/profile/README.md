# Profile Lambda Function

This Lambda function handles user profile management operations including create, read, update, and delete (CRUD) operations.

## API Endpoints

### Create Profile
- **Method**: POST
- **Path**: `/profile`
- **Request Body**:
```json
{
  "profile": {
    "mobileNumber": "9876543210",
    "name": "Ramesh Kumar",
    "location": {
      "state": "Karnataka",
      "district": "Mysuru",
      "village": "Hunsur",
      "pincode": "571105",
      "coordinates": {
        "latitude": 12.3051,
        "longitude": 76.2925
      }
    },
    "farmSize": 5.5,
    "primaryCrops": ["Rice", "Sugarcane"],
    "soilType": "Red",
    "languagePreference": "kn"
  }
}
```
- **Response** (201):
```json
{
  "success": true,
  "profile": {
    "userId": "abc123...",
    "mobileNumber": "9876543210",
    "name": "Ramesh Kumar",
    "location": {...},
    "farmSize": 5.5,
    "primaryCrops": ["Rice", "Sugarcane"],
    "soilType": "Red",
    "languagePreference": "kn",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Profile created successfully"
}
```

### Get Profile by User ID
- **Method**: GET
- **Path**: `/profile/{userId}`
- **Response** (200):
```json
{
  "success": true,
  "profile": {...}
}
```

### Get Profile by Mobile Number
- **Method**: GET
- **Path**: `/profile?mobileNumber=9876543210`
- **Query Parameters**:
  - `mobileNumber`: User's mobile number
- **Response** (200):
```json
{
  "success": true,
  "profile": {...}
}
```

### Update Profile
- **Method**: PUT
- **Path**: `/profile/{userId}`
- **Request Body**:
```json
{
  "profile": {
    "name": "Ramesh Kumar Updated",
    "farmSize": 6.0,
    "primaryCrops": ["Rice", "Sugarcane", "Cotton"]
  }
}
```
- **Response** (200):
```json
{
  "success": true,
  "profile": {...},
  "message": "Profile updated successfully"
}
```

### Delete Profile
- **Method**: DELETE
- **Path**: `/profile/{userId}`
- **Response** (200):
```json
{
  "success": true,
  "message": "Profile deleted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Profile data is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Profile not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Data Validation

The profile service validates:
- **Mobile Number**: Must be a valid 10-digit Indian mobile number (starting with 6-9)
- **Farm Size**: Must be greater than 0
- **Location**: Must include state, district, and pincode
- **Coordinates**: Must be valid latitude/longitude within India's bounds
- **Primary Crops**: At least one crop is required
- **Soil Type**: Required field

## Environment Variables

- `PROFILES_TABLE`: DynamoDB table name for user profiles (default: `UserProfiles`)

## DynamoDB Schema

### Table: UserProfiles
- **Primary Key**: `userId` (String)
- **Global Secondary Index**: `MobileNumberIndex` on `mobileNumber`

### Attributes:
- `userId`: Unique identifier (generated)
- `mobileNumber`: User's mobile number (unique)
- `name`: User's full name
- `location`: Location object with state, district, village, pincode, coordinates
- `farmSize`: Farm size in acres
- `primaryCrops`: Array of crop names
- `soilType`: Type of soil
- `languagePreference`: Language code (e.g., "en", "hi", "kn")
- `createdAt`: ISO timestamp
- `updatedAt`: ISO timestamp

## Testing

Run tests with:
```bash
npm test
```

## Building

Build the Lambda function:
```bash
npm run build
```

## Deployment

The Lambda function is deployed via Terraform. See `terraform/lambda.tf` for configuration.
