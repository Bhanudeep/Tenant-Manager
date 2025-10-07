// Vue-specific exports
export * from '../core/interfaces';
export { TenantConfigCore } from '../core/tenant-config.core';
export { 
  TenantConfigPlugin,
  useTenantConfig as useVueTenantConfig,
  useTenantConfigWithInit,
  createTenantConfigPlugin,
  TenantConfigKey,
  type VueTenantConfigState,
  type TenantConfigPluginOptions
} from './tenant-config.plugin';

// Re-export default Vue plugin
export { default as VueTenantConfigPlugin } from './tenant-config.plugin';