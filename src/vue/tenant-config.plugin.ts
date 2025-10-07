// src/vue/tenant-config.plugin.ts
import { Plugin, App, ref, reactive, onMounted, inject, InjectionKey } from 'vue';
import { TenantConfigCore } from '../core/tenant-config.core';
import { IHttpClient, ITenantInitOptions, ITenantConfig } from '../core/interfaces';

// Vue HTTP client adapter (using fetch, can be customized to use axios)
const vueHttpClient: IHttpClient = {
  get: async <T = any>(url: string, options?: { headers?: Record<string, string> }): Promise<T> => {
    const response = await fetch(url, {
      method: 'GET',
      headers: options?.headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
};

// Vue reactive state interface
export interface VueTenantConfigState {
  tenantCore: TenantConfigCore;
  currentTenant: string;
  currentSubTenant: string | null;
  isInitialized: boolean;
  config: ITenantConfig | undefined;
}

// Injection key for providing/injecting the tenant config
export const TenantConfigKey: InjectionKey<VueTenantConfigState> = Symbol('TenantConfig');

// Vue plugin options
export interface TenantConfigPluginOptions {
  initOptions?: ITenantInitOptions;
  autoInitialize?: boolean;
}

// Vue plugin
export const TenantConfigPlugin: Plugin = {
  install(app: App, options: TenantConfigPluginOptions = {}) {
    const core = new TenantConfigCore(vueHttpClient);
    const { autoInitialize = true, initOptions } = options;

    // Create reactive state
    const state = reactive<VueTenantConfigState>({
      tenantCore: core,
      currentTenant: 'default',
      currentSubTenant: null,
      isInitialized: false,
      config: undefined
    });

    // Subscribe to core state changes
    core.currentTenant$.subscribe(tenant => {
      state.currentTenant = tenant;
      state.config = core.getAllConfig();
    });

    if (core.currentSubTenant$) {
      core.currentSubTenant$.subscribe(subTenant => {
        state.currentSubTenant = subTenant;
        state.config = core.getAllConfig();
      });
    }

    // Auto-initialize if enabled
    if (autoInitialize) {
      const initialize = async () => {
        try {
          let finalOptions = initOptions;
          
          if (!finalOptions) {
            // Try to get from session storage if no options provided
            const redemptionPartnerCode = sessionStorage.getItem('RedemptionPartnerCode') || 'default';
            const subTenantId = sessionStorage.getItem('SubTenantId') || undefined;
            
            finalOptions = {
              redemptionPartnerCode,
              subTenantId
            };
          }

          await core.initializeTenant(finalOptions);
          state.isInitialized = true;
        } catch (error) {
          console.error('Failed to initialize tenant:', error);
          state.isInitialized = true; // Still mark as initialized to prevent infinite loading
        }
      };

      // Initialize on next tick to ensure the app is mounted
      app.config.globalProperties.$nextTick(() => {
        initialize();
      });
    }

    // Provide the state to child components
    app.provide(TenantConfigKey, state);

    // Add global properties for Options API compatibility
    app.config.globalProperties.$tenantConfig = state;
    app.config.globalProperties.$getTenantConfig = <T = any>(key: string): T | undefined => {
      return core.getConfig<T>(key);
    };
    app.config.globalProperties.$getAllTenantConfig = (): ITenantConfig | undefined => {
      return core.getAllConfig();
    };
    app.config.globalProperties.$initializeTenant = (options: ITenantInitOptions): Promise<void> => {
      return core.initializeTenant(options);
    };
  }
};

// Composable for using tenant config in composition API
export function useTenantConfig(): VueTenantConfigState {
  const state = inject(TenantConfigKey);
  
  if (!state) {
    throw new Error('useTenantConfig must be used within a component tree that has TenantConfigPlugin installed');
  }
  
  return state;
}

// Composable with initialization logic
export function useTenantConfigWithInit(initOptions?: ITenantInitOptions) {
  const state = useTenantConfig();
  
  onMounted(async () => {
    if (!state.isInitialized && initOptions) {
      try {
        await state.tenantCore.initializeTenant(initOptions);
        state.isInitialized = true;
      } catch (error) {
        console.error('Failed to initialize tenant:', error);
        state.isInitialized = true;
      }
    }
  });
  
  return state;
}

// Helper function to create the plugin with options
export function createTenantConfigPlugin(options: TenantConfigPluginOptions = {}): Plugin {
  return {
    install(app: App) {
      TenantConfigPlugin.install!(app, options);
    }
  };
}

export default TenantConfigPlugin;