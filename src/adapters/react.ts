import { TenantManager } from '../core/TenantManager.js';
import type { InitializationOptions, TenantConfig } from '../types/index.js';

/**
 * React Hook for Tenant Management
 */
export interface UseTenantManagerReturn {
  tenantManager: TenantManager;
  currentTenant: string | null;
  currentSubTenant: string | null;
  config: TenantConfig | null;
  isLoading: boolean;
  isInitialized: boolean;
  switchTenant: (tenantId: string, subTenantId?: string) => Promise<void>;
  getAssetPath: (assetKey: string) => string | null;
  getConfig: (key: string) => any;
}

/**
 * React Hook implementation (works with any React-like framework)
 */
export function createTenantHook() {
  let managerInstance: TenantManager | null = null;

  return function useTenantManager(options: InitializationOptions = {}): UseTenantManagerReturn {
    // This is a pseudo-implementation that shows the interface
    // In a real React app, you'd use useState, useEffect, etc.
    
    if (!managerInstance) {
      managerInstance = new TenantManager(options);
    }

    const state = managerInstance.getState();

    return {
      tenantManager: managerInstance,
      currentTenant: state.currentTenant,
      currentSubTenant: state.currentSubTenant,
      config: state.config,
      isLoading: state.isLoading,
      isInitialized: state.isInitialized,
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
 * React Context Provider (example implementation)
 */
export interface TenantProviderProps {
  children: any;
  options: InitializationOptions;
}

export function createTenantProvider() {
  return {
    // Provider component interface
    TenantProvider: (props: TenantProviderProps) => {
      // This would be implemented with actual React context
      return props.children;
    },
    
    // Context hook
    useTenantContext: () => {
      // This would use React.useContext
      return createTenantHook()();
    }
  };
}

/**
 * Higher-Order Component for React
 */
export interface WithTenantProps {
  tenantManager: TenantManager;
  tenantConfig: TenantConfig | null;
  currentTenant: string | null;
  currentSubTenant: string | null;
}

export function createWithTenant() {
  return function withTenant<P extends object>(
    WrappedComponent: any,
    options: InitializationOptions = {}
  ) {
    return function WithTenantComponent(props: P) {
      const tenantHook = createTenantHook();
      const tenantProps = tenantHook(options);
      
      const enhancedProps = {
        ...props,
        tenantManager: tenantProps.tenantManager,
        tenantConfig: tenantProps.config,
        currentTenant: tenantProps.currentTenant,
        currentSubTenant: tenantProps.currentSubTenant
      };

      return WrappedComponent(enhancedProps);
    };
  };
}