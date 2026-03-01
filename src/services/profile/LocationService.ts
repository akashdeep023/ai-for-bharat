import { Location } from '../../types';

/**
 * LocationService manages user location data
 * Provides validation and geocoding capabilities
 */
export class LocationService {
  /**
   * Validate location data
   */
  validateLocation(location: Location): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields
    if (!location.state || location.state.trim() === '') {
      errors.push('State is required');
    }

    if (!location.district || location.district.trim() === '') {
      errors.push('District is required');
    }

    if (!location.pincode || location.pincode.trim() === '') {
      errors.push('Pincode is required');
    } else {
      // Validate Indian pincode format (6 digits)
      const pincodeRegex = /^[1-9][0-9]{5}$/;
      if (!pincodeRegex.test(location.pincode)) {
        errors.push('Invalid pincode format. Must be 6 digits.');
      }
    }

    // Validate coordinates
    if (location.coordinates) {
      const { latitude, longitude } = location.coordinates;

      if (latitude < -90 || latitude > 90) {
        errors.push('Latitude must be between -90 and 90');
      }

      if (longitude < -180 || longitude > 180) {
        errors.push('Longitude must be between -180 and 180');
      }

      // Validate coordinates are within India's approximate bounds
      // India: Latitude 8°N to 37°N, Longitude 68°E to 97°E
      if (latitude < 8 || latitude > 37) {
        errors.push('Latitude appears to be outside India');
      }

      if (longitude < 68 || longitude > 97) {
        errors.push('Longitude appears to be outside India');
      }
    } else {
      errors.push('Coordinates are required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate distance between two locations in kilometers
   * Uses Haversine formula
   */
  calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // Earth's radius in kilometers

    const lat1 = this.toRadians(loc1.coordinates.latitude);
    const lat2 = this.toRadians(loc2.coordinates.latitude);
    const deltaLat = this.toRadians(loc2.coordinates.latitude - loc1.coordinates.latitude);
    const deltaLon = this.toRadians(loc2.coordinates.longitude - loc1.coordinates.longitude);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Get location display string
   */
  getLocationString(location: Location): string {
    const parts = [location.village, location.district, location.state]
      .filter(part => part && part.trim() !== '')
      .join(', ');

    return parts || 'Unknown Location';
  }

  /**
   * Check if location is within radius of another location
   */
  isWithinRadius(center: Location, target: Location, radiusKm: number): boolean {
    const distance = this.calculateDistance(center, target);
    return distance <= radiusKm;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Normalize location data (trim whitespace, capitalize)
   */
  normalizeLocation(location: Location): Location {
    return {
      state: this.capitalizeWords(location.state.trim()),
      district: this.capitalizeWords(location.district.trim()),
      village: location.village ? this.capitalizeWords(location.village.trim()) : '',
      pincode: location.pincode.trim(),
      coordinates: {
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
      },
    };
  }

  /**
   * Capitalize first letter of each word
   */
  private capitalizeWords(str: string): string {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
