// SMS Gateway integration for OTP delivery

import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const snsClient = new SNSClient({});

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send SMS using AWS SNS
 * In production, this could be replaced with other SMS providers like Twilio, MSG91, etc.
 */
export async function sendSMS(
  mobileNumber: string,
  message: string
): Promise<SMSResult> {
  try {
    // For development/testing, log the SMS instead of sending
    if (process.env.NODE_ENV === 'development' || process.env.MOCK_SMS === 'true') {
      console.log('Mock SMS sent to:', mobileNumber);
      console.log('Message:', message);
      return {
        success: true,
        messageId: 'mock-message-id',
      };
    }

    // Send SMS via AWS SNS
    const command = new PublishCommand({
      PhoneNumber: mobileNumber,
      Message: message,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional', // Use Transactional for OTP messages
        },
      },
    });

    const response = await snsClient.send(command);

    return {
      success: true,
      messageId: response.MessageId,
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send SMS using alternative provider (e.g., MSG91 for India)
 * This is a placeholder for integration with Indian SMS providers
 */
export async function sendSMSViaMSG91(
  mobileNumber: string,
  message: string
): Promise<SMSResult> {
  try {
    const apiKey = process.env.MSG91_API_KEY;
    const senderId = process.env.MSG91_SENDER_ID || 'FARMPL';

    if (!apiKey) {
      throw new Error('MSG91 API key not configured');
    }

    // Remove +91 prefix for MSG91
    const phoneNumber = mobileNumber.replace('+91', '');

    // MSG91 API call would go here
    // For now, this is a placeholder
    console.log('MSG91 SMS would be sent to:', phoneNumber);
    console.log('Message:', message);

    return {
      success: true,
      messageId: 'msg91-message-id',
    };
  } catch (error) {
    console.error('Error sending SMS via MSG91:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
