// Core type definitions for the Farmer Decision Support Platform

export interface Location {
  state: string;
  district: string;
  village: string;
  pincode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface UserProfile {
  userId: string;
  mobileNumber: string;
  name: string;
  location: Location;
  farmSize: number; // in acres
  primaryCrops: string[];
  soilType: string;
  languagePreference: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthToken {
  token: string;
  userId: string;
  expiresAt: Date;
}

export interface OTPResponse {
  success: boolean;
  expiresAt: Date;
  attemptsRemaining: number;
}

// Re-export sync types
export * from './sync';
