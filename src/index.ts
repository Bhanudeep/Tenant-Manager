// src/index.ts

// Export core interfaces and utilities
export * from './core/interfaces';
export { TenantConfigCore } from './core/tenant-config.core';

// Re-export framework adapters
export { TenantConfigAngularService } from './angular/tenant-config.service';
export { 
  TenantConfigProvider, 
  useTenantConfig as useReactTenantConfig,
  withTenantConfig 
} from './react/tenant-config.provider';
export { 
  TenantConfigPlugin,
  useTenantConfig as useVueTenantConfig,
  useTenantConfigWithInit,
  createTenantConfigPlugin,
  TenantConfigKey,
  type VueTenantConfigState,
  type TenantConfigPluginOptions
} from './vue/tenant-config.plugin';

// Re-export default Vue plugin
export { default as VueTenantConfigPlugin } from './vue/tenant-config.plugin';