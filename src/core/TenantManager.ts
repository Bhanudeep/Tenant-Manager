import type { 
  TenantConfig, 
  InitializationOptions, 
  TenantManagerState,
  TenantEventListener,
  TenantEventPayload,
  EventType,
  APIResponse
} from '../types/index.js';

/**
 * Core tenant management class that handles tenant configuration,
 * API calls, theming, and asset management
 */
export class TenantManager {
  private state: TenantManagerState = {
    currentTenant: null,
    currentSubTenant: null,
    config: null,
    isInitialized: false,
    isLoading: false
  };

  private options: Required<InitializationOptions>;
  private eventListeners: Map<EventType, TenantEventListener[]> = new Map();
  private tenantConfigs: Map<string, TenantConfig> = new Map();

  constructor(options: InitializationOptions = {}) {
    this.options = {
      apiBaseUrl: '',
      defaultTenant: 'default',
      storageKey: 'RedemptionPartnerCode',
      subTenantStorageKey: 'tenant',
      urlParamKey: 'RedemptionPartnerCode',
      subTenantParamKey: 'tenant',
      encodedParamKey: 'p',
      enableSessionStorage: true,
      enableUrlParsing: true,
      enableAutoTheming: true,
      customHeaders: {},
      onError: (error: Error) => console.error('TenantManager Error:', error),
      onTenantChange: () => {},
      onConfigLoad: () => {},
      ...options
    };

    // Initialize event listeners map
    ['tenantChange', 'subTenantChange', 'configLoad', 'error', 'initialized'].forEach(eventType => {
      this.eventListeners.set(eventType as EventType, []);
    });
  }

  /**
   * Initialize the tenant manager
   */
  async initialize(): Promise<void> {
    try {
      this.state.isLoading = true;
      
      // Get tenant information from various sources
      const { tenantId, subTenantId } = this.resolveTenantFromSources();
      
      if (tenantId) {
        await this.loadTenantConfig(tenantId, subTenantId ?? undefined);
      } else {
        await this.loadTenantConfig(this.options.defaultTenant);
      }

      this.state.isInitialized = true;
      this.emit('initialized', { type: 'initialized' });
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.handleError(err);
      throw err;
    } finally {
      this.state.isLoading = false;
    }
  }

  /**
   * Load tenant configuration from API and local config
   */
  async loadTenantConfig(tenantId: string, subTenantId?: string): Promise<TenantConfig> {
    try {
      this.state.isLoading = true;
      
      let config: TenantConfig = {};

      // Try to load from API first if URL is provided
      if (this.options.apiBaseUrl) {
        try {
          const apiConfig = await this.fetchConfigFromAPI(tenantId, subTenantId);
          config = { ...config, ...apiConfig };
        } catch (apiError) {
          console.warn('Failed to load config from API, falling back to local config:', apiError);
        }
      }

      // Merge with any cached local config
      const cachedConfig = this.tenantConfigs.get(tenantId);
      if (cachedConfig) {
        config = { ...cachedConfig, ...config };
      }

      // Handle sub-tenant configuration
      if (subTenantId && config.subTenants?.[subTenantId]) {
        config = { ...config, ...config.subTenants[subTenantId] };
      }

      // Update state
      this.state.currentTenant = tenantId;
      this.state.currentSubTenant = subTenantId || null;
      this.state.config = config;

      // Cache the config
      this.tenantConfigs.set(tenantId, config);

      // Store in session storage if enabled
      if (this.options.enableSessionStorage) {
        this.storeInSessionStorage(tenantId, subTenantId);
      }

      // Apply theming if enabled
      if (this.options.enableAutoTheming) {
        this.applyTheming(config);
      }

      // Emit events
      this.emit('configLoad', { type: 'configLoad', tenantId, subTenantId: subTenantId ?? undefined, config });
      this.emit('tenantChange', { type: 'tenantChange', tenantId, subTenantId: subTenantId ?? undefined, config });
      
      // Call callbacks
      this.options.onConfigLoad(config);
      this.options.onTenantChange(tenantId, subTenantId);

      return config;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.handleError(err);
      throw err;
    } finally {
      this.state.isLoading = false;
    }
  }

  /**
   * Fetch configuration from API
   */
  private async fetchConfigFromAPI(tenantId: string, _subTenantId?: string): Promise<TenantConfig> {
    const url = `${this.options.apiBaseUrl}/promotional-partner/api/promotionalpartner/${encodeURIComponent(tenantId)}/assets`;
    const timestamp = Date.now();
    
    const headers = {
      'Content-Type': 'application/json',
      ...this.options.customHeaders
    };

    const response = await fetch(`${url}?t=${timestamp}`, {
      method: 'GET',
      headers,
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: APIResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'API returned unsuccessful response');
    }

    return data.data || {};
  }

  /**
   * Resolve tenant information from various sources
   */
  private resolveTenantFromSources(): { tenantId: string | null; subTenantId: string | null } {
    let tenantId: string | null = null;
    let subTenantId: string | null = null;

    // 1. Try session storage first
    if (this.options.enableSessionStorage && typeof sessionStorage !== 'undefined') {
      tenantId = sessionStorage.getItem(this.options.storageKey);
      subTenantId = sessionStorage.getItem(this.options.subTenantStorageKey);
    }

    // 2. Try URL parameters if not found in storage
    if (!tenantId && this.options.enableUrlParsing && typeof window !== 'undefined') {
      const urlParams = this.parseUrlParameters();
      tenantId = urlParams.tenantId;
      subTenantId = urlParams.subTenantId || subTenantId;
    }

    return { tenantId, subTenantId };
  }

  /**
   * Parse URL parameters for tenant information
   */
  private parseUrlParameters(): { tenantId: string | null; subTenantId: string | null } {
    let tenantId: string | null = null;
    let subTenantId: string | null = null;

    if (typeof window === 'undefined') {
      return { tenantId, subTenantId };
    }

    // Get query string from hash or regular URL
    const hashPart = window.location.hash;
    let queryString = '';
    
    if (hashPart.includes('?')) {
      queryString = hashPart.substring(hashPart.indexOf('?'));
    } else if (window.location.search) {
      queryString = window.location.search;
    }

    if (queryString) {
      const urlParams = new URLSearchParams(queryString);
      
      // Direct parameters
      tenantId = urlParams.get(this.options.urlParamKey);
      subTenantId = urlParams.get(this.options.subTenantParamKey);
      
      // Try encoded parameter
      if (!tenantId && urlParams.get(this.options.encodedParamKey)) {
        try {
          const decodedString = atob(urlParams.get(this.options.encodedParamKey)!);
          const decodedData = JSON.parse(decodedString);
          tenantId = decodedData.Code || decodedData.tenantId;
          subTenantId = decodedData.Tenant || decodedData.subTenantId || subTenantId;
        } catch (error) {
          console.warn('Failed to decode URL parameter:', error);
        }
      }
    }

    return { tenantId, subTenantId };
  }

  /**
   * Store tenant information in session storage
   */
  private storeInSessionStorage(tenantId: string, subTenantId?: string): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(this.options.storageKey, tenantId);
      if (subTenantId) {
        sessionStorage.setItem(this.options.subTenantStorageKey, subTenantId);
      }
    }
  }

  /**
   * Apply theming based on tenant configuration
   */
  private applyTheming(config: TenantConfig): void {
    if (!config.mode || typeof document === 'undefined') return;

    // Remove existing mode classes
    document.body.classList.forEach(cls => {
      if (cls.endsWith('-mode')) {
        document.body.classList.remove(cls);
      }
    });

    // Add new mode class
    document.body.classList.add(config.mode);

    // Apply CSS custom properties if available
    if (config.primaryColor) {
      document.documentElement.style.setProperty('--tenant-primary-color', config.primaryColor);
    }
    if (config.backgroundColor) {
      document.documentElement.style.setProperty('--tenant-background-color', config.backgroundColor);
    }
  }

  /**
   * Get current tenant configuration
   */
  getCurrentConfig(): TenantConfig | null {
    return this.state.config;
  }

  /**
   * Get current tenant ID
   */
  getCurrentTenant(): string | null {
    return this.state.currentTenant;
  }

  /**
   * Get current sub-tenant ID
   */
  getCurrentSubTenant(): string | null {
    return this.state.currentSubTenant;
  }

  /**
   * Get asset path for a specific asset key
   */
  getAssetPath(assetKey: string, _tenantId?: string, subTenantId?: string): string | null {
    const config = this.state.config;
    if (!config) return null;

    // Check sub-tenant config first if applicable
    if (subTenantId && config.subTenants?.[subTenantId]?.[assetKey]) {
      return config.subTenants[subTenantId][assetKey];
    }

    // Fallback to main config
    return config[assetKey] || null;
  }

  /**
   * Get configuration value by key
   */
  getConfig(key: string): any {
    return this.state.config?.[key] || null;
  }

  /**
   * Check if tenant is valid
   */
  isValidTenant(tenantId: string): boolean {
    return this.tenantConfigs.has(tenantId);
  }

  /**
   * Check if sub-tenant is valid for a given tenant
   */
  isValidSubTenant(tenantId: string, subTenantId: string): boolean {
    const config = this.tenantConfigs.get(tenantId);
    return !!(config?.subTenants?.[subTenantId]);
  }

  /**
   * Manually set tenant configuration (for testing or local overrides)
   */
  setTenantConfig(tenantId: string, config: TenantConfig): void {
    this.tenantConfigs.set(tenantId, config);
  }

  /**
   * Switch to a different tenant
   */
  async switchTenant(tenantId: string, subTenantId?: string): Promise<void> {
    await this.loadTenantConfig(tenantId, subTenantId);
  }

  /**
   * Get current state
   */
  getState(): TenantManagerState {
    return { ...this.state };
  }

  /**
   * Event listener management
   */
  on(eventType: EventType, listener: TenantEventListener): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(listener);
    this.eventListeners.set(eventType, listeners);
  }

  off(eventType: EventType, listener: TenantEventListener): void {
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(eventType: EventType, payload: TenantEventPayload): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(listener => {
      try {
        listener(payload);
      } catch (error) {
        console.error(`Error in ${eventType} listener:`, error);
      }
    });
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    this.emit('error', { type: 'error', error });
    this.options.onError(error);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.eventListeners.clear();
    this.tenantConfigs.clear();
    this.state = {
      currentTenant: null,
      currentSubTenant: null,
      config: null,
      isInitialized: false,
      isLoading: false
    };
  }
}