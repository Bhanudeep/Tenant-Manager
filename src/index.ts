// src/index.ts

// Export core interfaces and utilities only
export * from './core/interfaces';
export { TenantConfigCore } from './core/tenant-config.core';

// Framework adapters are exported via separate entry points:
// - @bhanudeep/tenant-manager/angular
// - @bhanudeep/tenant-manager/react  
// - @bhanudeep/tenant-manager/vue