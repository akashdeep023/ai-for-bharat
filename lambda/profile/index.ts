import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ProfileService } from './profileService';
import { ProfileRequest, ProfileResponse } from './types';

const profileService = new ProfileService();

/**
 * Lambda handler for profile operations
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  };

  try {
    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: '',
      };
    }

    // Parse request body
    const request: ProfileRequest = event.body ? JSON.parse(event.body) : {};

    // Extract userId from path parameters if available
    const pathUserId = event.pathParameters?.userId;

    let response: ProfileResponse;

    switch (event.httpMethod) {
      case 'POST':
        // Create profile
        if (!request.profile) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Profile data is required',
            }),
          };
        }

        const createdProfile = await profileService.createProfile(
          request.profile as any
        );
        response = {
          success: true,
          profile: createdProfile,
          message: 'Profile created successfully',
        };
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(response),
        };

      case 'GET':
        // Get profile by userId or mobile number
        if (pathUserId) {
          const profile = await profileService.getProfile(pathUserId);
          if (!profile) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({
                success: false,
                error: 'Profile not found',
              }),
            };
          }
          response = {
            success: true,
            profile,
          };
        } else if (request.mobileNumber) {
          const profile = await profileService.getProfileByMobile(
            request.mobileNumber
          );
          if (!profile) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({
                success: false,
                error: 'Profile not found',
              }),
            };
          }
          response = {
            success: true,
            profile,
          };
        } else {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'userId or mobileNumber is required',
            }),
          };
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(response),
        };

      case 'PUT':
        // Update profile
        if (!pathUserId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'userId is required',
            }),
          };
        }
        if (!request.profile) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Profile updates are required',
            }),
          };
        }

        const updatedProfile = await profileService.updateProfile(
          pathUserId,
          request.profile
        );
        response = {
          success: true,
          profile: updatedProfile,
          message: 'Profile updated successfully',
        };
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(response),
        };

      case 'DELETE':
        // Delete profile
        if (!pathUserId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'userId is required',
            }),
          };
        }

        await profileService.deleteProfile(pathUserId);
        response = {
          success: true,
          message: 'Profile deleted successfully',
        };
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(response),
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Method not allowed',
          }),
        };
    }
  } catch (error: any) {
    console.error('Error processing profile request:', error);

    // Handle specific DynamoDB errors
    if (error.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Profile not found or already exists',
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
    };
  }
};
