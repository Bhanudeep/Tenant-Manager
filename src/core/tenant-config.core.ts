// src/core/tenant-config.core.ts
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  IHttpClient, 
  IState, 
  ITenantConfig, 
  IAssetMapping, 
  ILegalDocument,
  ICachedConfig,
  ITenantInitOptions
} from './interfaces';

export class TenantConfigCore implements IState<string> {
  private currentTenantSubject = new BehaviorSubject<string>('default');
  private currentSubTenantSubject = new BehaviorSubject<string | null>(null);
  public currentTenant$: Observable<string> = this.currentTenantSubject.asObservable();
  public currentSubTenant$?: Observable<string | null> = this.currentSubTenantSubject.asObservable();

  private tenantConfig: { [key: string]: ITenantConfig } = {};
  private cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private assetMapping: IAssetMapping = {
    'Privilege_Dufry': {
      mode: 'Privilege_Dufry-mode',
      redemptionPartnerCode: 'Privilege_Dufry',
      partnerLogo: 'assets/tenants/Privilege_Dufry/images/logo.png',
      country: 'US',
      title: 'Privilege Dufry',
      currencySymbol: '$',
      subTenants: {
        'alipay': {
          mode: 'Privilege_Dufry-alipay-mode',
          redemptionPartnerCode: 'Privilege_Dufry',
          country: 'CN',
          title: 'Privilege Dufry Alipay',
          currencySymbol: '¥'
        }
      }
    },
    'default': {
      mode: 'default-mode',
      redemptionPartnerCode: 'default',
      partnerLogo: 'assets/tenants/default/images/logo.png',
      country: 'US',
      title: 'Default Tenant',
      currencySymbol: '$'
    }
    // Add more tenants here
  };

  constructor(private httpClient: IHttpClient) {}

  get currentTenant(): string {
    return this.currentTenantSubject.getValue();
  }

  get currentSubTenant(): string | null {
    return this.currentSubTenantSubject.getValue();
  }

  private isCacheValid(cachedConfig: ICachedConfig): boolean {
    return Date.now() - cachedConfig.timestamp < this.cacheTimeout;
  }

  private getCachedConfig(redemptionPartnerCode: string): ITenantConfig | null {
    try {
      const cached = sessionStorage.getItem(`tenant_config_${redemptionPartnerCode}`);
      if (cached) {
        const cachedConfig: ICachedConfig = JSON.parse(cached);
        if (this.isCacheValid(cachedConfig)) {
          return cachedConfig.data;
        }
        // Remove expired cache
        sessionStorage.removeItem(`tenant_config_${redemptionPartnerCode}`);
      }
    } catch (error) {
      console.warn('Failed to parse cached config:', error);
    }
    return null;
  }

  private async fetchTenantConfigFromAPI(
    redemptionPartnerCode: string,
    k8sUrl: string | undefined,
    subTenantId?: string
  ): Promise<ITenantConfig | null> {
    if (!k8sUrl) {
      console.warn('K8s URL not provided, using local asset mapping only');
      const baseConfig = this.assetMapping[redemptionPartnerCode];
      return baseConfig ? { ...baseConfig } : null;
    }

    const assetsUrl = `${k8sUrl}/promotional-partner/api/promotionalpartner/${encodeURIComponent(redemptionPartnerCode)}/assets`;
    const timestamp = Date.now();
    
    // Clear stale config
    delete this.tenantConfig[redemptionPartnerCode];

    try {
      const config = await this.httpClient.get<ITenantConfig>(assetsUrl, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      // Merge API config with local asset mapping
      const baseAssetConfig = this.assetMapping[redemptionPartnerCode];
      if (!baseAssetConfig) {
        throw new Error(`No asset mapping found for tenant: ${redemptionPartnerCode}`);
      }
      
      const mergedConfig: ITenantConfig = {
        ...baseAssetConfig,
        ...config,
        welcomeImg: config.BrandImageUrl ? `${config.BrandImageUrl}?_t=${timestamp}` : baseAssetConfig.partnerLogo,
        storeLogo: config.LogoUrl ? `${config.LogoUrl}?_t=${timestamp}` : baseAssetConfig.partnerLogo,
        partnerName: config.Title || baseAssetConfig.title,
        redemptionPartnerCode,
      };

      // Merge sub-tenant config if provided
      if (subTenantId && baseAssetConfig.subTenants?.[subTenantId]) {
        const subTenantConfig = baseAssetConfig.subTenants[subTenantId];
        Object.assign(mergedConfig, subTenantConfig, {
          currentSubTenant: subTenantId,
          subTenantId
        });
      }

      // Fetch legal documents
      try {
        const legalUrl = `${k8sUrl}/legalterms/api/voucher/publiclegaldocument?code=${encodeURIComponent(redemptionPartnerCode)}`;
        const legalResp = await this.httpClient.get<{ Results: ILegalDocument[] }>(legalUrl);
        
        if (legalResp.Results && legalResp.Results.length > 0) {
          const termsDoc = legalResp.Results.find(r => r.Code.includes(redemptionPartnerCode)) || legalResp.Results[0];
          if (termsDoc) {
            mergedConfig.termsAndConditionsPath = `${termsDoc.Url}?_t=${timestamp}`;
          }
          if (legalResp.Results[0]) {
            mergedConfig.privacyPolicyPath = `${legalResp.Results[0].Url}?_t=${timestamp}`;
          }
        }
      } catch (legalError) {
        console.warn('Failed to fetch legal documents:', legalError);
      }

      // Cache the merged config
      this.tenantConfig[redemptionPartnerCode] = mergedConfig;
      sessionStorage.setItem(`tenant_config_${redemptionPartnerCode}`, JSON.stringify({ 
        data: mergedConfig, 
        timestamp 
      }));
      
      return mergedConfig;
    } catch (error) {
      console.error('API fetch failed. Using local asset mapping:', error);
      const baseConfig = this.assetMapping[redemptionPartnerCode];
      return baseConfig ? { ...baseConfig } : null;
    }
  }

  async initializeTenant(options: ITenantInitOptions): Promise<void>;
  async initializeTenant(redemptionPartnerCode: string, subTenantId?: string, k8sUrl?: string): Promise<void>;
  async initializeTenant(
    optionsOrCode: ITenantInitOptions | string,
    subTenantId?: string,
    k8sUrl?: string
  ): Promise<void> {
    let redemptionPartnerCode: string;
    let finalSubTenantId: string | undefined;
    let finalK8sUrl: string | undefined;
    let cacheTimeout: number | undefined;

    if (typeof optionsOrCode === 'string') {
      redemptionPartnerCode = optionsOrCode;
      finalSubTenantId = subTenantId;
      finalK8sUrl = k8sUrl;
    } else {
      redemptionPartnerCode = optionsOrCode.redemptionPartnerCode;
      finalSubTenantId = optionsOrCode.subTenantId;
      finalK8sUrl = optionsOrCode.k8sUrl;
      cacheTimeout = optionsOrCode.cacheTimeout;
    }

    if (cacheTimeout) {
      this.cacheTimeout = cacheTimeout;
    }

    if (!this.assetMapping[redemptionPartnerCode]) {
      console.error(`Invalid tenant code: ${redemptionPartnerCode}`);
      return;
    }

    // Validate sub-tenant
    const validSubTenant = finalSubTenantId ? 
      this.assetMapping[redemptionPartnerCode]?.subTenants?.[finalSubTenantId] : null;
    const resolvedSubTenantId = validSubTenant ? finalSubTenantId : undefined;

    // Check cache first
    let config = this.getCachedConfig(redemptionPartnerCode);
    
    // If no valid cache, fetch from API
    if (!config) {
      config = await this.fetchTenantConfigFromAPI(redemptionPartnerCode, finalK8sUrl, resolvedSubTenantId);
    }

    if (!config) {
      console.error(`Failed to load config for tenant: ${redemptionPartnerCode}`);
      return;
    }

    // Update state subjects
    this.currentTenantSubject.next(redemptionPartnerCode);
    
    if (resolvedSubTenantId) {
      this.currentSubTenantSubject.next(resolvedSubTenantId);
      sessionStorage.setItem('SubTenantId', resolvedSubTenantId);
    } else {
      this.currentSubTenantSubject.next(null);
      sessionStorage.removeItem('SubTenantId');
    }

    // Store tenant info in session storage
    sessionStorage.setItem('RedemptionPartnerCode', redemptionPartnerCode);

    // Apply CSS mode class
    this.applyModeClass(config);

    // Load tenant-specific CSS
    await this.loadTenantStyles(redemptionPartnerCode, resolvedSubTenantId);
  }

  private applyModeClass(config: ITenantConfig): void {
    const currentModeClass = this.getModeClass(config);
    
    // Remove any existing mode classes
    document.body.classList.forEach(cls => {
      if (cls.endsWith('-mode')) {
        document.body.classList.remove(cls);
      }
    });
    
    document.body.classList.add(currentModeClass);
  }

  private getModeClass(config: ITenantConfig): string {
    return config.subTenantId ? `${config.mode}-${config.subTenantId}` : config.mode;
  }

  private loadTenantStyles(tenant: string, subTenant?: string): Promise<void> {
    return new Promise((resolve) => {
      const oldLink = document.getElementById('tenant-specific-styles') as HTMLLinkElement;
      if (oldLink) {
        oldLink.remove();
      }

      const head = document.getElementsByTagName('head')[0];
      if (!head) {
        console.warn('Document head not found, cannot load tenant styles');
        resolve();
        return;
      }
      
      const link = document.createElement('link');
      link.id = 'tenant-specific-styles';
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = subTenant 
        ? `assets/tenants/${tenant}/${subTenant}/styles/tenant.css` 
        : `assets/tenants/${tenant}/styles/tenant.css`;
      
      // Wait for CSS to load
      link.addEventListener('load', () => resolve());
      link.addEventListener('error', () => {
        console.warn(`Failed to load tenant styles: ${link.href}`);
        resolve(); // Don't block initialization on CSS load failure
      });
      
      head.appendChild(link);
    });
  }

  getCurrentTenant(): string {
    return this.currentTenantSubject.getValue();
  }

  getCurrentSubTenant(): string | null {
    return this.currentSubTenantSubject.getValue();
  }

  getConfig<T = any>(key: string): T | undefined {
    const tenant = this.getCurrentTenant();
    const config = this.tenantConfig[tenant] || this.assetMapping[tenant];
    return config ? (config as any)[key] as T : undefined;
  }

  getAllConfig(): ITenantConfig | undefined {
    const tenant = this.getCurrentTenant();
    const config = this.tenantConfig[tenant];
    if (config) return config;
    
    const assetConfig = this.assetMapping[tenant];
    return assetConfig ? { ...assetConfig } : undefined;
  }

  // Method to update asset mapping (useful for dynamic tenant registration)
  updateAssetMapping(tenantCode: string, assetConfig: IAssetMapping[string]): void {
    this.assetMapping[tenantCode] = assetConfig;
  }

  // Method to clear cache
  clearCache(tenantCode?: string): void {
    if (tenantCode) {
      sessionStorage.removeItem(`tenant_config_${tenantCode}`);
      delete this.tenantConfig[tenantCode];
    } else {
      // Clear all tenant caches
      Object.keys(this.tenantConfig).forEach(code => {
        sessionStorage.removeItem(`tenant_config_${code}`);
      });
      this.tenantConfig = {};
    }
  }
}