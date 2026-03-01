/**
 * FarmDataManager handles farm-specific data validation and management
 */
export class FarmDataManager {
  // Common Indian crops
  private static readonly COMMON_CROPS = [
    'Rice',
    'Wheat',
    'Cotton',
    'Sugarcane',
    'Maize',
    'Pulses',
    'Groundnut',
    'Soybean',
    'Mustard',
    'Sunflower',
    'Potato',
    'Onion',
    'Tomato',
    'Chilli',
    'Turmeric',
    'Tea',
    'Coffee',
    'Rubber',
    'Coconut',
    'Banana',
    'Mango',
    'Orange',
  ];

  // Common soil types in India
  private static readonly SOIL_TYPES = [
    'Alluvial',
    'Black',
    'Red',
    'Laterite',
    'Desert',
    'Mountain',
    'Saline',
    'Peaty',
  ];

  /**
   * Validate farm size
   */
  validateFarmSize(farmSize: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (farmSize <= 0) {
      errors.push('Farm size must be greater than 0');
    }

    if (farmSize > 10000) {
      errors.push('Farm size seems unusually large. Please verify.');
    }

    // Warn for very small farms (less than 0.1 acres)
    if (farmSize < 0.1) {
      errors.push('Farm size is very small. Please verify the value.');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate primary crops
   */
  validatePrimaryCrops(crops: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!crops || crops.length === 0) {
      errors.push('At least one primary crop is required');
    }

    if (crops.length > 10) {
      errors.push('Too many primary crops. Please select up to 10 crops.');
    }

    // Check for empty or invalid crop names
    const invalidCrops = crops.filter(crop => !crop || crop.trim() === '');
    if (invalidCrops.length > 0) {
      errors.push('Crop names cannot be empty');
    }

    // Check for duplicate crops
    const uniqueCrops = new Set(crops.map(c => c.toLowerCase().trim()));
    if (uniqueCrops.size !== crops.length) {
      errors.push('Duplicate crops found. Please remove duplicates.');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate soil type
   */
  validateSoilType(soilType: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!soilType || soilType.trim() === '') {
      errors.push('Soil type is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get list of common crops
   */
  getCommonCrops(): string[] {
    return [...FarmDataManager.COMMON_CROPS];
  }

  /**
   * Get list of soil types
   */
  getSoilTypes(): string[] {
    return [...FarmDataManager.SOIL_TYPES];
  }

  /**
   * Check if crop is in common crops list
   */
  isCommonCrop(cropName: string): boolean {
    return FarmDataManager.COMMON_CROPS.some(
      crop => crop.toLowerCase() === cropName.toLowerCase().trim()
    );
  }

  /**
   * Check if soil type is valid
   */
  isValidSoilType(soilType: string): boolean {
    return FarmDataManager.SOIL_TYPES.some(
      type => type.toLowerCase() === soilType.toLowerCase().trim()
    );
  }

  /**
   * Normalize crop names (capitalize first letter)
   */
  normalizeCropNames(crops: string[]): string[] {
    return crops.map(crop =>
      crop
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    );
  }

  /**
   * Normalize soil type
   */
  normalizeSoilType(soilType: string): string {
    const normalized = soilType.trim();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
  }

  /**
   * Calculate farm category based on size
   * According to Indian agricultural classification
   */
  getFarmCategory(farmSize: number): string {
    if (farmSize < 1) {
      return 'Marginal'; // Less than 1 acre
    } else if (farmSize < 2.5) {
      return 'Small'; // 1-2.5 acres
    } else if (farmSize < 10) {
      return 'Semi-Medium'; // 2.5-10 acres
    } else if (farmSize < 25) {
      return 'Medium'; // 10-25 acres
    } else {
      return 'Large'; // More than 25 acres
    }
  }

  /**
   * Validate complete farm data
   */
  validateFarmData(farmData: {
    farmSize: number;
    primaryCrops: string[];
    soilType: string;
  }): { valid: boolean; errors: string[] } {
    const allErrors: string[] = [];

    const sizeValidation = this.validateFarmSize(farmData.farmSize);
    if (!sizeValidation.valid) {
      allErrors.push(...sizeValidation.errors);
    }

    const cropsValidation = this.validatePrimaryCrops(farmData.primaryCrops);
    if (!cropsValidation.valid) {
      allErrors.push(...cropsValidation.errors);
    }

    const soilValidation = this.validateSoilType(farmData.soilType);
    if (!soilValidation.valid) {
      allErrors.push(...soilValidation.errors);
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  /**
   * Get farm data summary
   */
  getFarmSummary(farmData: {
    farmSize: number;
    primaryCrops: string[];
    soilType: string;
  }): string {
    const category = this.getFarmCategory(farmData.farmSize);
    const cropsStr = farmData.primaryCrops.join(', ');
    
    return `${category} farm (${farmData.farmSize} acres) with ${farmData.soilType} soil, growing ${cropsStr}`;
  }
}
