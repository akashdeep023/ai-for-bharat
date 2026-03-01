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
  farmSize: number;
  primaryCrops: string[];
  soilType: string;
  languagePreference: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileRequest {
  operation: 'create' | 'get' | 'update' | 'delete';
  userId?: string;
  mobileNumber?: string;
  profile?: Partial<UserProfile>;
}

export interface ProfileResponse {
  success: boolean;
  profile?: UserProfile;
  message?: string;
  error?: string;
}
