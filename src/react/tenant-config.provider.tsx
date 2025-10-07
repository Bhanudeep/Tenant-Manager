// src/react/tenant-config.provider.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { TenantConfigCore } from '../core/tenant-config.core';
import { IHttpClient, ITenantInitOptions, ITenantConfig } from '../core/interfaces';

// React HTTP client adapter (using fetch)
const reactHttpClient: IHttpClient = {
  get: async <T = any>(url: string, options?: { headers?: Record<string, string> }): Promise<T> => {
    const response = await fetch(url, { 
      headers: options?.headers,
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};

// Context interface
interface TenantConfigContextType {
  tenantCore: TenantConfigCore;
  currentTenant: string;
  currentSubTenant: string | null;
  isInitialized: boolean;
  config: ITenantConfig | undefined;
  getConfig: <T = any>(key: string) => T | undefined;
  getAllConfig: () => ITenantConfig | undefined;
}

// Context for tenant state
const TenantConfigContext = createContext<TenantConfigContextType | undefined>(undefined);

// Provider props
interface TenantConfigProviderProps {
  children: ReactNode;
  initOptions?: ITenantInitOptions;
  autoInitialize?: boolean;
}

export const TenantConfigProvider: React.FC<TenantConfigProviderProps> = ({ 
  children, 
  initOptions,
  autoInitialize = true 
}) => {
  const [core] = useState(() => new TenantConfigCore(reactHttpClient));
  const [currentTenant, setCurrentTenant] = useState<string>('default');
  const [currentSubTenant, setCurrentSubTenant] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [config, setConfig] = useState<ITenantConfig | undefined>(undefined);

  // Subscribe to core state changes
  useEffect(() => {
    const tenantSub = core.currentTenant$.subscribe(setCurrentTenant);
    const subTenantSub = core.currentSubTenant$?.subscribe(setCurrentSubTenant);

    return () => {
      tenantSub.unsubscribe();
      subTenantSub?.unsubscribe();
    };
  }, [core]);

  // Update config when tenant changes
  useEffect(() => {
    setConfig(core.getAllConfig());
  }, [core, currentTenant, currentSubTenant]);

  // Auto-initialize tenant on mount
  useEffect(() => {
    if (!autoInitialize) return;

    const initialize = async () => {
      try {
        let options = initOptions;
        
        if (!options) {
          // Try to get from session storage if no options provided
          const redemptionPartnerCode = sessionStorage.getItem('RedemptionPartnerCode') || 'default';
          const subTenantId = sessionStorage.getItem('SubTenantId') || undefined;
          
          options = {
            redemptionPartnerCode,
            subTenantId
          };
        }

        await core.initializeTenant(options);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize tenant:', error);
        setIsInitialized(true); // Still mark as initialized to prevent infinite loading
      }
    };

    initialize();
  }, [core, initOptions, autoInitialize]);

  const contextValue: TenantConfigContextType = {
    tenantCore: core,
    currentTenant,
    currentSubTenant,
    isInitialized,
    config,
    getConfig: core.getConfig.bind(core),
    getAllConfig: core.getAllConfig.bind(core)
  };

  return (
    <TenantConfigContext.Provider value={contextValue}>
      {children}
    </TenantConfigContext.Provider>
  );
};

// Hook to use tenant config
export const useTenantConfig = (): TenantConfigContextType => {
  const context = useContext(TenantConfigContext);
  if (!context) {
    throw new Error('useTenantConfig must be used within a TenantConfigProvider');
  }
  return context;
};

// Higher-order component for class components
export function withTenantConfig<P extends object>(
  Component: React.ComponentType<P & { tenantConfig: TenantConfigContextType }>
): React.FC<P> {
  return (props: P) => {
    const tenantConfig = useTenantConfig();
    return <Component {...props} tenantConfig={tenantConfig} />;
  };
}