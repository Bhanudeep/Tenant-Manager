// src/core/interfaces.ts
import { Observable } from 'rxjs';

export interface IHttpClient {
  get<T = any>(url: string, options?: { headers?: Record<string, string> }): Promise<T>;
}

export interface IState<T = string> {
  currentTenant: T;
  currentSubTenant: T | null;
  currentTenant$: Observable<T>; // Use RxJS for Angular, but abstract for other frameworks
  currentSubTenant$?: Observable<T | null>;
}

// Shared tenant config model
export interface ITenantConfig {
  [key: string]: any;
  mode: string;
  redemptionPartnerCode: string;
  country: string;
  title: string;
  currencySymbol: string;
  welcomeImg?: string;
  storeLogo?: string;
  partnerName?: string;
  termsAndConditionsPath?: string;
  privacyPolicyPath?: string;
  currentSubTenant?: string;
  subTenantId?: string;
  BrandImageUrl?: string;
  LogoUrl?: string;
  Title?: string;
}

// Asset mapping structure (shared across frameworks)
export interface IAssetMapping {
  [tenantCode: string]: ITenantConfig & {
    partnerLogo: string;
    subTenants?: Record<string, ITenantConfig>;
  };
}

// Legal document interface
export interface ILegalDocument {
  Code: string;
  Url: string;
  Results?: ILegalDocument[];
}

// Cached config interface
export interface ICachedConfig {
  data: ITenantConfig;
  timestamp: number;
}

// Initialization options
export interface ITenantInitOptions {
  redemptionPartnerCode: string;
  subTenantId?: string;
  k8sUrl?: string;
  cacheTimeout?: number; // in milliseconds
}