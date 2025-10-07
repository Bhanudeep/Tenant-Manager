import { TenantManager } from '../core/TenantManager.js';
import type { InitializationOptions, TenantConfig } from '../types/index.js';

/**
 * Vue 3 Composition API Hook for Tenant Management
 */
export interface VueTenantComposable {
  tenantManager: TenantManager;
  currentTenant: any; // Ref<string | null>
  currentSubTenant: any; // Ref<string | null>
  config: any; // Ref<TenantConfig | null>
  isLoading: any; // Ref<boolean>
  isInitialized: any; // Ref<boolean>
  switchTenant: (tenantId: string, subTenantId?: string) => Promise<void>;
  getAssetPath: (assetKey: string) => string | null;
  getConfig: (key: string) => any;
}

/**
 * Vue 3 Composable Factory
 * 
 * Usage in Vue 3:
 * 
 * ```typescript
 * import { createUseTenant } from '@bhanudeepsimhadri/tenant-manager/vue';
 * 
 * const useTenant = createUseTenant({
 *   apiBaseUrl: 'https://your-api.com',
 *   enableAutoTheming: true
 * });
 * 
 * // In your component:
 * export default {
 *   setup() {
 *     const { currentTenant, config, switchTenant } = useTenant();
 *     return { currentTenant, config, switchTenant };
 *   }
 * }
 * ```
 */
export function createUseTenant(options: InitializationOptions = {}) {
  let managerInstance: TenantManager | null = null;

  return function useTenant(): VueTenantComposable {
    if (!managerInstance) {
      managerInstance = new TenantManager(options);
    }

    const state = managerInstance.getState();

    // In a real Vue implementation, these would be reactive refs
    const reactiveState = {
      currentTenant: { value: state.currentTenant },
      currentSubTenant: { value: state.currentSubTenant },
      config: { value: state.config },
      isLoading: { value: state.isLoading },
      isInitialized: { value: state.isInitialized }
    };

    return {
      tenantManager: managerInstance,
      currentTenant: reactiveState.currentTenant,
      currentSubTenant: reactiveState.currentSubTenant,
      config: reactiveState.config,
      isLoading: reactiveState.isLoading,
      isInitialized: reactiveState.isInitialized,
      switchTenant: (tenantId: string, subTenantId?: string) => 
        managerInstance!.switchTenant(tenantId, subTenantId),
      getAssetPath: (assetKey: string) => 
        managerInstance!.getAssetPath(assetKey),
      getConfig: (key: string) => 
        managerInstance!.getConfig(key)
    };
  };
}

/**
 * Vue 3 Plugin
 * 
 * Usage:
 * 
 * ```typescript
 * import { createApp } from 'vue';
 * import { createTenantPlugin } from '@bhanudeepsimhadri/tenant-manager/vue';
 * 
 * const app = createApp(App);
 * app.use(createTenantPlugin({
 *   apiBaseUrl: 'https://your-api.com'
 * }));
 * ```
 */
export function createTenantPlugin(options: InitializationOptions = {}) {
  return {
    install(app: any, pluginOptions: InitializationOptions = {}) {
      const finalOptions = { ...options, ...pluginOptions };
      const manager = new TenantManager(finalOptions);

      // Provide tenant manager globally
      app.provide('tenantManager', manager);
      app.config.globalProperties.$tenantManager = manager;

      // Initialize on app mount
      manager.initialize().catch(console.error);
    }
  };
}

/**
 * Vue 2 Mixin (for legacy Vue 2 support)
 * 
 * Usage:
 * 
 * ```javascript
 * import { createTenantMixin } from '@bhanudeepsimhadri/tenant-manager/vue';
 * 
 * export default {
 *   mixins: [createTenantMixin()],
 *   computed: {
 *     partnerLogo() {
 *       return this.$getTenantAsset('partnerLogo');
 *     }
 *   }
 * }
 * ```
 */
export function createTenantMixin(options: InitializationOptions = {}) {
  const tenantManager = new TenantManager(options);

  return {
    data() {
      return {
        $tenantManager: tenantManager,
        $tenantState: tenantManager.getState()
      };
    },

    async created(this: any) {
      try {
        await tenantManager.initialize();
        this.$tenantState = tenantManager.getState();
      } catch (error) {
        console.error('Failed to initialize tenant manager:', error);
      }
    },

    methods: {
      $switchTenant(tenantId: string, subTenantId?: string) {
        return tenantManager.switchTenant(tenantId, subTenantId);
      },

      $getTenantAsset(assetKey: string): string | null {
        return tenantManager.getAssetPath(assetKey);
      },

      $getTenantConfig(key: string): any {
        return tenantManager.getConfig(key);
      },

      $getCurrentTenant(): string | null {
        return tenantManager.getCurrentTenant();
      },

      $getCurrentSubTenant(): string | null {
        return tenantManager.getCurrentSubTenant();
      }
    },

    computed: {
      $currentTenant(this: any): string | null {
        return this.$tenantState.currentTenant;
      },

      $currentSubTenant(this: any): string | null {
        return this.$tenantState.currentSubTenant;
      },

      $tenantConfig(this: any): TenantConfig | null {
        return this.$tenantState.config;
      },

      $isTenantLoading(this: any): boolean {
        return this.$tenantState.isLoading;
      },

      $isTenantInitialized(this: any): boolean {
        return this.$tenantState.isInitialized;
      }
    }
  };
}

/**
 * Vue directive for conditional rendering based on tenant
 * 
 * Usage:
 * 
 * ```html
 * <div v-tenant-only="'tenant1'">Only for tenant1</div>
 * <div v-tenant-only="['tenant1', 'tenant2']">For multiple tenants</div>
 * ```
 */
export function createTenantDirective(tenantManager: TenantManager) {
  return {
    mounted(el: HTMLElement, binding: any) {
      const allowedTenants = Array.isArray(binding.value) ? binding.value : [binding.value];
      const currentTenant = tenantManager.getCurrentTenant();
      
      if (!currentTenant || !allowedTenants.includes(currentTenant)) {
        el.style.display = 'none';
      }
    },

    updated(el: HTMLElement, binding: any) {
      const allowedTenants = Array.isArray(binding.value) ? binding.value : [binding.value];
      const currentTenant = tenantManager.getCurrentTenant();
      
      if (!currentTenant || !allowedTenants.includes(currentTenant)) {
        el.style.display = 'none';
      } else {
        el.style.display = '';
      }
    }
  };
}

/**
 * Vue filter for getting tenant assets (Vue 2 only)
 * 
 * Usage:
 * 
 * ```html
 * <img :src="'partnerLogo' | tenantAsset" />
 * ```
 */
export function createTenantAssetFilter(tenantManager: TenantManager) {
  return function tenantAssetFilter(assetKey: string): string | null {
    return tenantManager.getAssetPath(assetKey);
  };
}