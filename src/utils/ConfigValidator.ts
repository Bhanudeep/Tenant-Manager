/**
 * Configuration validator for tenant configurations
 */

import type { TenantConfig } from '../types/index.js';

export class ConfigValidator {
  /**
   * Validate tenant configuration object
   */
  static validateTenantConfig(config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config || typeof config !== 'object') {
      errors.push('Configuration must be an object');
      return { isValid: false, errors };
    }

    // Validate required fields (optional - adjust based on your needs)
    const requiredFields = ['redemptionPartnerCode'];
    requiredFields.forEach(field => {
      if (!config[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate field types
    const stringFields = ['mode', 'country', 'title', 'currencySymbol', 'paymentPartner'];
    stringFields.forEach(field => {
      if (config[field] && typeof config[field] !== 'string') {
        errors.push(`Field '${field}' must be a string`);
      }
    });

    // Validate URL fields
    const urlFields = [
      'welcomeImg', 'partnerLogo', 'partnerImg', 'combinedLogo', 'storeLogo',
      'welcomevouchertypePath', 'vouchertypePath', 'termsAndConditionsPath',
      'privacyPolicyPath', 'countryList', 'showBanner'
    ];
    
    urlFields.forEach(field => {
      if (config[field] && !ConfigValidator.isValidUrl(config[field])) {
        errors.push(`Field '${field}' must be a valid URL or path`);
      }
    });

    // Validate sub-tenants
    if (config.subTenants) {
      if (typeof config.subTenants !== 'object') {
        errors.push('subTenants must be an object');
      } else {
        Object.entries(config.subTenants).forEach(([key, subConfig]) => {
          const subValidation = ConfigValidator.validateTenantConfig(subConfig);
          subValidation.errors.forEach(error => {
            errors.push(`Sub-tenant '${key}': ${error}`);
          });
        });
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate initialization options
   */
  static validateInitializationOptions(options: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!options || typeof options !== 'object') {
      return { isValid: true, errors }; // Options are optional
    }

    // Validate URL fields
    if (options.apiBaseUrl && !ConfigValidator.isValidUrl(options.apiBaseUrl)) {
      errors.push('apiBaseUrl must be a valid URL');
    }

    // Validate string fields
    const stringFields = ['defaultTenant', 'storageKey', 'subTenantStorageKey', 'urlParamKey', 'subTenantParamKey', 'encodedParamKey'];
    stringFields.forEach(field => {
      if (options[field] && typeof options[field] !== 'string') {
        errors.push(`Field '${field}' must be a string`);
      }
    });

    // Validate boolean fields
    const booleanFields = ['enableSessionStorage', 'enableUrlParsing', 'enableAutoTheming'];
    booleanFields.forEach(field => {
      if (options[field] !== undefined && typeof options[field] !== 'boolean') {
        errors.push(`Field '${field}' must be a boolean`);
      }
    });

    // Validate function fields
    const functionFields = ['onError', 'onTenantChange', 'onConfigLoad'];
    functionFields.forEach(field => {
      if (options[field] && typeof options[field] !== 'function') {
        errors.push(`Field '${field}' must be a function`);
      }
    });

    // Validate custom headers
    if (options.customHeaders) {
      if (typeof options.customHeaders !== 'object') {
        errors.push('customHeaders must be an object');
      } else {
        Object.entries(options.customHeaders).forEach(([key, value]) => {
          if (typeof key !== 'string' || typeof value !== 'string') {
            errors.push('customHeaders must contain only string key-value pairs');
          }
        });
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Basic URL validation
   */
  private static isValidUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    // Allow relative paths
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return true;
    }

    // Allow asset paths
    if (url.startsWith('assets/')) {
      return true;
    }

    // Validate full URLs
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize configuration object
   */
  static sanitizeConfig(config: any): TenantConfig {
    if (!config || typeof config !== 'object') {
      return {};
    }

    const sanitized: TenantConfig = {};
    
    // Copy safe string fields
    const stringFields = [
      'welcomeImg', 'partnerLogo', 'partnerImg', 'combinedLogo', 'storeLogo',
      'welcomevouchertypePath', 'vouchertypePath', 'termsAndConditionsPath',
      'privacyPolicyPath', 'mode', 'redemptionPartnerCode', 'country', 'title',
      'currencySymbol', 'partnerName', 'paymentPartner', 'countryList', 'showBanner'
    ];

    stringFields.forEach(field => {
      if (config[field] && typeof config[field] === 'string') {
        sanitized[field] = config[field];
      }
    });

    // Handle clicker field (can be string or boolean)
    if (config.clicker !== undefined) {
      if (typeof config.clicker === 'boolean') {
        sanitized.clicker = config.clicker;
      } else if (typeof config.clicker === 'string') {
        sanitized.clicker = config.clicker.toLowerCase() === 'true';
      }
    }

    // Sanitize sub-tenants
    if (config.subTenants && typeof config.subTenants === 'object') {
      sanitized.subTenants = {};
      Object.entries(config.subTenants).forEach(([key, subConfig]) => {
        if (typeof key === 'string' && subConfig) {
          sanitized.subTenants![key] = ConfigValidator.sanitizeConfig(subConfig);
        }
      });
    }

    return sanitized;
  }

  /**
   * Merge configurations with priority
   */
  static mergeConfigs(baseConfig: TenantConfig, overrideConfig: TenantConfig): TenantConfig {
    const merged: TenantConfig = { ...baseConfig };

    Object.entries(overrideConfig).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'subTenants' && typeof value === 'object' && typeof merged[key] === 'object') {
          merged[key] = { ...merged[key], ...value };
        } else {
          merged[key] = value;
        }
      }
    });

    return merged;
  }

  /**
   * Validate and extract tenant info from encoded parameter
   */
  static validateEncodedParam(encodedParam: string): { tenantId?: string; subTenantId?: string } | null {
    try {
      if (!encodedParam || typeof encodedParam !== 'string') {
        return null;
      }

      const decodedString = atob(encodedParam);
      const decodedData = JSON.parse(decodedString);

      if (!decodedData || typeof decodedData !== 'object') {
        return null;
      }

      const result: { tenantId?: string; subTenantId?: string } = {};

      if (decodedData.Code && typeof decodedData.Code === 'string') {
        result.tenantId = decodedData.Code;
      } else if (decodedData.tenantId && typeof decodedData.tenantId === 'string') {
        result.tenantId = decodedData.tenantId;
      }

      if (decodedData.Tenant && typeof decodedData.Tenant === 'string') {
        result.subTenantId = decodedData.Tenant;
      } else if (decodedData.subTenantId && typeof decodedData.subTenantId === 'string') {
        result.subTenantId = decodedData.subTenantId;
      }

      return Object.keys(result).length > 0 ? result : null;
    } catch {
      return null;
    }
  }
}