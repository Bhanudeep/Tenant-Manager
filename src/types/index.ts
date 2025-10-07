/**
 * Core interfaces for the tenant management system
 */

export interface TenantConfig {
  welcomeImg?: string;
  partnerLogo?: string;
  partnerImg?: string;
  combinedLogo?: string;
  storeLogo?: string;
  welcomevouchertypePath?: string;
  vouchertypePath?: string;
  termsAndConditionsPath?: string;
  privacyPolicyPath?: string;
  mode?: string;
  redemptionPartnerCode?: string;
  country?: string;
  title?: string;
  currencySymbol?: string;
  partnerName?: string;
  paymentPartner?: string;
  clicker?: string | boolean;
  countryList?: string;
  showBanner?: string;
  subTenants?: { [key: string]: TenantConfig };
  [key: string]: any;
}

export interface ThemeConfig {
  'background-color'?: string;
  'primary-color'?: string;
  'background-image'?: string;
  'active-step-color'?: string;
  'active-step-shadow'?: string;
  'active-step-border'?: string;
  'previous-step-color'?: string;
  [key: string]: any;
}

export interface TenantThemeMapping {
  [tenantId: string]: ThemeConfig;
}

export interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  [key: string]: any;
}

export interface InitializationOptions {
  apiBaseUrl?: string;
  defaultTenant?: string;
  storageKey?: string;
  subTenantStorageKey?: string;
  urlParamKey?: string;
  subTenantParamKey?: string;
  encodedParamKey?: string;
  enableSessionStorage?: boolean;
  enableUrlParsing?: boolean;
  enableAutoTheming?: boolean;
  customHeaders?: { [key: string]: string };
  onError?: (error: Error) => void;
  onTenantChange?: (tenantId: string, subTenantId?: string) => void;
  onConfigLoad?: (config: TenantConfig) => void;
}

export interface TenantManagerState {
  currentTenant: string | null;
  currentSubTenant: string | null;
  config: TenantConfig | null;
  isInitialized: boolean;
  isLoading: boolean;
}

export interface StyleInjectionOptions {
  targetElement?: HTMLElement;
  styleId?: string;
  important?: boolean;
}

export interface AssetPreloadOptions {
  preloadImages?: boolean;
  preloadFonts?: boolean;
  lazyLoad?: boolean;
  timeout?: number;
}

export type EventType = 'tenantChange' | 'subTenantChange' | 'configLoad' | 'error' | 'initialized';

export interface TenantEventPayload {
  type: EventType;
  tenantId?: string;
  subTenantId?: string | undefined;
  config?: TenantConfig;
  error?: Error;
}

export type TenantEventListener = (payload: TenantEventPayload) => void;