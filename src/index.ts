/**
 * @bhanudeepsimhadri/tenant-manager
 * 
 * A framework-agnostic TypeScript package for multi-tenant applications 
 * with dynamic theming, asset management, and configuration loading.
 */

// Core exports
export { TenantManager } from './core/TenantManager.js';

// Utility exports
export { ThemeManager } from './utils/ThemeManager.js';
export { AssetManager } from './utils/AssetManager.js';
export { ConfigValidator } from './utils/ConfigValidator.js';

// Type exports
export type {
  TenantConfig,
  ThemeConfig,
  TenantThemeMapping,
  APIResponse,
  InitializationOptions,
  TenantManagerState,
  StyleInjectionOptions,
  AssetPreloadOptions,
  EventType,
  TenantEventPayload,
  TenantEventListener
} from './types/index.js';

// Import types and classes for local use
import { TenantManager } from './core/TenantManager.js';
import { ThemeManager } from './utils/ThemeManager.js';
import type { InitializationOptions, TenantThemeMapping } from './types/index.js';

// Framework adapter exports
export * from './adapters/react.js';
export * from './adapters/angular.js';
export * from './adapters/vue.js';

/**
 * Factory function to create a pre-configured TenantManager instance
 */
export function createTenantManager(options: InitializationOptions = {}) {
  return new TenantManager(options);
}

/**
 * Initialize tenant management for vanilla JS/TS applications
 */
export async function initializeTenantManager(options: InitializationOptions = {}) {
  const manager = new TenantManager(options);
  await manager.initialize();
  return manager;
}

/**
 * Global instance for simple use cases (singleton pattern)
 */
let globalInstance: TenantManager | null = null;

/**
 * Get or create the global tenant manager instance
 */
export function getGlobalTenantManager(options?: InitializationOptions): TenantManager {
  if (!globalInstance) {
    globalInstance = new TenantManager(options);
  }
  return globalInstance;
}

/**
 * Reset the global instance (useful for testing)
 */
export function resetGlobalTenantManager(): void {
  if (globalInstance) {
    globalInstance.destroy();
    globalInstance = null;
  }
}

/**
 * Utility function to quickly set up tenant theming with predefined themes
 */
export function setupQuickTheming(themes: TenantThemeMapping, options: InitializationOptions = {}) {
  const themeManager = ThemeManager.getInstance();
  themeManager.registerThemes(themes);

  const tenantManager = new TenantManager({
    ...options,
    enableAutoTheming: true,
    onTenantChange: (tenantId: string, subTenantId?: string) => {
      themeManager.applyTheme(tenantId);
      options.onTenantChange?.(tenantId, subTenantId);
    }
  });

  return { tenantManager, themeManager };
}

// Default export for convenience
export default TenantManager;