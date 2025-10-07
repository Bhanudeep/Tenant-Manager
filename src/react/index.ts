// React-specific exports
export * from '../core/interfaces';
export { TenantConfigCore } from '../core/tenant-config.core';
export { 
  TenantConfigProvider, 
  useTenantConfig as useReactTenantConfig,
  withTenantConfig 
} from './tenant-config.provider';