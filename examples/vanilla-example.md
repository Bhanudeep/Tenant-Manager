# Vanilla JavaScript/TypeScript Integration Example

This example demonstrates how to use the Tenant Manager package in vanilla JavaScript/TypeScript applications without any framework.

## Installation

```bash
npm install @bhanudeep/tenant-manager
```

## Basic Usage

### 1. HTML Setup (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tenant Manager - Vanilla Example</title>
  <style>
    /* Base styles */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 20px;
      background: var(--tenant-bg-color, #ffffff);
      color: var(--tenant-text-color, #333333);
      transition: all 0.3s ease;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
      background: white;
      border: 1px solid var(--tenant-border-color, #ddd);
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .logo {
      height: 60px;
      width: auto;
    }
    
    .tenant-info {
      background: white;
      border: 1px solid var(--tenant-border-color, #ddd);
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .info-item strong {
      font-size: 0.9rem;
      color: #666;
    }
    
    .info-item span {
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--tenant-primary-color, #007bff);
    }
    
    .actions {
      background: white;
      border: 1px solid var(--tenant-border-color, #ddd);
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    
    .button-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 15px;
    }
    
    button {
      padding: 12px 20px;
      border: none;
      border-radius: 6px;
      background: var(--tenant-primary-color, #007bff);
      color: white;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    button.secondary {
      background: #6c757d;
    }
    
    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    
    /* Tenant-specific themes */
    .default-mode {
      --tenant-primary-color: #6c757d;
      --tenant-bg-color: #f8f9fa;
      --tenant-text-color: #495057;
      --tenant-border-color: #dee2e6;
    }
    
    .Privilege_Dufry-mode {
      --tenant-primary-color: #d4a574;
      --tenant-bg-color: #faf8f5;
      --tenant-text-color: #2c1810;
      --tenant-border-color: #e6d7c3;
    }
    
    .Privilege_Dufry-alipay-mode {
      --tenant-primary-color: #1677ff;
      --tenant-bg-color: #f0f8ff;
      --tenant-text-color: #001529;
      --tenant-border-color: #91d5ff;
    }
  </style>
</head>
<body>
  <div class="container">
    <div id="loading" class="loading">
      <h2>Loading tenant configuration...</h2>
    </div>
    
    <div id="app" style="display: none;">
      <div class="header">
        <img id="tenant-logo" class="logo" src="" alt="Tenant Logo">
        <div>
          <h1 id="tenant-title">Loading...</h1>
          <p id="tenant-subtitle"></p>
        </div>
      </div>
      
      <div class="tenant-info">
        <h2>Tenant Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>Current Tenant:</strong>
            <span id="current-tenant">-</span>
          </div>
          <div class="info-item" id="sub-tenant-item" style="display: none;">
            <strong>Sub-tenant:</strong>
            <span id="current-sub-tenant">-</span>
          </div>
          <div class="info-item">
            <strong>Title:</strong>
            <span id="title">-</span>
          </div>
          <div class="info-item">
            <strong>Currency:</strong>
            <span id="currency">-</span>
          </div>
          <div class="info-item">
            <strong>Country:</strong>
            <span id="country">-</span>
          </div>
          <div class="info-item">
            <strong>Mode:</strong>
            <span id="mode">-</span>
          </div>
        </div>
      </div>
      
      <div class="actions">
        <h3>Actions</h3>
        <div class="button-group">
          <button id="btn-default">Switch to Default</button>
          <button id="btn-dufry">Switch to Privilege Dufry</button>
          <button id="btn-alipay">Switch to Alipay Sub-tenant</button>
          <button id="btn-clear" class="secondary">Clear Cache</button>
        </div>
        <div id="action-status"></div>
      </div>
    </div>
  </div>

  <script type="module" src="app.js"></script>
</body>
</html>
```

### 2. JavaScript Implementation (`app.js`)

```javascript
import { TenantConfigCore } from '@bhanudeep/tenant-manager';

// HTTP client implementation using fetch
class FetchHttpClient {
  async get(url, options = {}) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
}

// Application class
class TenantApp {
  constructor() {
    this.httpClient = new FetchHttpClient();
    this.tenantManager = new TenantConfigCore(this.httpClient);
    this.elements = {};
    this.isInitialized = false;
    
    this.init();
  }
  
  async init() {
    this.bindElements();
    this.attachEventListeners();
    this.subscribeToTenantChanges();
    
    try {
      await this.initializeTenant();
      this.showApp();
      this.updateUI();
    } catch (error) {
      console.error('Failed to initialize tenant:', error);
      this.showError('Failed to load tenant configuration');
    }
  }
  
  bindElements() {
    this.elements = {
      loading: document.getElementById('loading'),
      app: document.getElementById('app'),
      tenantLogo: document.getElementById('tenant-logo'),
      tenantTitle: document.getElementById('tenant-title'),
      tenantSubtitle: document.getElementById('tenant-subtitle'),
      currentTenant: document.getElementById('current-tenant'),
      currentSubTenant: document.getElementById('current-sub-tenant'),
      subTenantItem: document.getElementById('sub-tenant-item'),
      title: document.getElementById('title'),
      currency: document.getElementById('currency'),
      country: document.getElementById('country'),
      mode: document.getElementById('mode'),
      btnDefault: document.getElementById('btn-default'),
      btnDufry: document.getElementById('btn-dufry'),
      btnAlipay: document.getElementById('btn-alipay'),
      btnClear: document.getElementById('btn-clear'),
      actionStatus: document.getElementById('action-status')
    };
  }
  
  attachEventListeners() {
    this.elements.btnDefault.addEventListener('click', () => 
      this.switchTenant('default'));
    
    this.elements.btnDufry.addEventListener('click', () => 
      this.switchTenant('Privilege_Dufry'));
    
    this.elements.btnAlipay.addEventListener('click', () => 
      this.switchTenant('Privilege_Dufry', 'alipay'));
    
    this.elements.btnClear.addEventListener('click', () => 
      this.clearCache());
    
    // Handle image load errors
    this.elements.tenantLogo.addEventListener('error', () => {
      this.elements.tenantLogo.src = '/assets/default-logo.png';
    });
  }
  
  subscribeToTenantChanges() {
    // Subscribe to tenant changes
    this.tenantManager.currentTenant$.subscribe(tenant => {
      console.log('Tenant changed:', tenant);
      this.updateUI();
    });
    
    // Subscribe to sub-tenant changes
    if (this.tenantManager.currentSubTenant$) {
      this.tenantManager.currentSubTenant$.subscribe(subTenant => {
        console.log('Sub-tenant changed:', subTenant);
        this.updateUI();
      });
    }
  }
  
  async initializeTenant() {
    // Get initial tenant from URL params or session storage
    const urlParams = new URLSearchParams(window.location.search);
    const redemptionPartnerCode = 
      urlParams.get('tenant') || 
      sessionStorage.getItem('RedemptionPartnerCode') || 
      'Privilege_Dufry';
    
    const subTenantId = 
      urlParams.get('subTenant') || 
      sessionStorage.getItem('SubTenantId') || 
      'alipay';
    
    await this.tenantManager.initializeTenant({
      redemptionPartnerCode,
      subTenantId,
      k8sUrl: 'https://your-api-url.com',
      cacheTimeout: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    this.isInitialized = true;
  }
  
  updateUI() {
    if (!this.isInitialized) return;
    
    const currentTenant = this.tenantManager.getCurrentTenant();
    const currentSubTenant = this.tenantManager.getCurrentSubTenant();
    
    // Update tenant information
    this.elements.currentTenant.textContent = currentTenant;
    
    if (currentSubTenant) {
      this.elements.currentSubTenant.textContent = currentSubTenant;
      this.elements.subTenantItem.style.display = 'block';
    } else {
      this.elements.subTenantItem.style.display = 'none';
    }
    
    // Update configuration values
    const title = this.tenantManager.getConfig('title') || 'Unknown';
    const currency = this.tenantManager.getConfig('currencySymbol') || '';
    const country = this.tenantManager.getConfig('country') || '';
    const mode = this.tenantManager.getConfig('mode') || '';
    
    this.elements.title.textContent = title;
    this.elements.currency.textContent = currency;
    this.elements.country.textContent = country;
    this.elements.mode.textContent = mode;
    
    // Update header
    this.elements.tenantTitle.textContent = title;
    this.elements.tenantSubtitle.textContent = 
      `${currentTenant}${currentSubTenant ? ' - ' + currentSubTenant : ''}`;
    
    // Update logo
    const logoUrl = this.tenantManager.getConfig('storeLogo') || 
                   this.tenantManager.getConfig('partnerLogo') || 
                   '/assets/default-logo.png';
    this.elements.tenantLogo.src = logoUrl;
  }
  
  async switchTenant(tenantCode, subTenantId = undefined) {
    this.setButtonsDisabled(true);
    this.showActionStatus('Switching tenant...');
    
    try {
      await this.tenantManager.initializeTenant({
        redemptionPartnerCode: tenantCode,
        subTenantId,
        k8sUrl: 'https://your-api-url.com'
      });
      
      // Update URL params
      const url = new URL(window.location);
      url.searchParams.set('tenant', tenantCode);
      if (subTenantId) {
        url.searchParams.set('subTenant', subTenantId);
      } else {
        url.searchParams.delete('subTenant');
      }
      window.history.pushState({}, '', url);
      
      this.showActionStatus('Tenant switched successfully!');
      setTimeout(() => this.clearActionStatus(), 2000);
      
    } catch (error) {
      console.error('Failed to switch tenant:', error);
      this.showActionStatus('Failed to switch tenant', 'error');
      setTimeout(() => this.clearActionStatus(), 3000);
    } finally {
      this.setButtonsDisabled(false);
    }
  }
  
  clearCache() {
    this.tenantManager.clearCache();
    this.showActionStatus('Cache cleared!');
    setTimeout(() => this.clearActionStatus(), 2000);
  }
  
  setButtonsDisabled(disabled) {
    const buttons = [
      this.elements.btnDefault,
      this.elements.btnDufry,
      this.elements.btnAlipay,
      this.elements.btnClear
    ];
    
    buttons.forEach(btn => btn.disabled = disabled);
  }
  
  showActionStatus(message, type = 'info') {
    this.elements.actionStatus.textContent = message;
    this.elements.actionStatus.style.color = type === 'error' ? '#dc3545' : '#28a745';
    this.elements.actionStatus.style.fontWeight = '500';
    this.elements.actionStatus.style.marginTop = '10px';
  }
  
  clearActionStatus() {
    this.elements.actionStatus.textContent = '';
  }
  
  showApp() {
    this.elements.loading.style.display = 'none';
    this.elements.app.style.display = 'block';
  }
  
  showError(message) {
    this.elements.loading.innerHTML = `
      <h2 style="color: #dc3545;">Error</h2>
      <p>${message}</p>
    `;
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new TenantApp());
} else {
  new TenantApp();
}

// Export for potential external use
window.TenantApp = TenantApp;
```

### 3. TypeScript Implementation (`app.ts`)

```typescript
import { TenantConfigCore, IHttpClient, ITenantInitOptions } from '@bhanudeep/tenant-manager';

// HTTP client implementation
class FetchHttpClient implements IHttpClient {
  async get<T = any>(url: string, options?: { headers?: Record<string, string> }): Promise<T> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
}

// UI Element interfaces
interface Elements {
  loading: HTMLElement;
  app: HTMLElement;
  tenantLogo: HTMLImageElement;
  tenantTitle: HTMLElement;
  tenantSubtitle: HTMLElement;
  currentTenant: HTMLElement;
  currentSubTenant: HTMLElement;
  subTenantItem: HTMLElement;
  title: HTMLElement;
  currency: HTMLElement;
  country: HTMLElement;
  mode: HTMLElement;
  btnDefault: HTMLButtonElement;
  btnDufry: HTMLButtonElement;
  btnAlipay: HTMLButtonElement;
  btnClear: HTMLButtonElement;
  actionStatus: HTMLElement;
}

// Main application class
class TenantApp {
  private httpClient: IHttpClient;
  private tenantManager: TenantConfigCore;
  private elements: Elements = {} as Elements;
  private isInitialized = false;
  
  constructor() {
    this.httpClient = new FetchHttpClient();
    this.tenantManager = new TenantConfigCore(this.httpClient);
    
    this.init();
  }
  
  private async init(): Promise<void> {
    this.bindElements();
    this.attachEventListeners();
    this.subscribeToTenantChanges();
    
    try {
      await this.initializeTenant();
      this.showApp();
      this.updateUI();
    } catch (error) {
      console.error('Failed to initialize tenant:', error);
      this.showError('Failed to load tenant configuration');
    }
  }
  
  private bindElements(): void {
    const getElementById = (id: string): HTMLElement => {
      const element = document.getElementById(id);
      if (!element) {
        throw new Error(`Element with id '${id}' not found`);
      }
      return element;
    };
    
    this.elements = {
      loading: getElementById('loading'),
      app: getElementById('app'),
      tenantLogo: getElementById('tenant-logo') as HTMLImageElement,
      tenantTitle: getElementById('tenant-title'),
      tenantSubtitle: getElementById('tenant-subtitle'),
      currentTenant: getElementById('current-tenant'),
      currentSubTenant: getElementById('current-sub-tenant'),
      subTenantItem: getElementById('sub-tenant-item'),
      title: getElementById('title'),
      currency: getElementById('currency'),
      country: getElementById('country'),
      mode: getElementById('mode'),
      btnDefault: getElementById('btn-default') as HTMLButtonElement,
      btnDufry: getElementById('btn-dufry') as HTMLButtonElement,
      btnAlipay: getElementById('btn-alipay') as HTMLButtonElement,
      btnClear: getElementById('btn-clear') as HTMLButtonElement,
      actionStatus: getElementById('action-status')
    };
  }
  
  private attachEventListeners(): void {
    this.elements.btnDefault.addEventListener('click', () => 
      this.switchTenant('default'));
    
    this.elements.btnDufry.addEventListener('click', () => 
      this.switchTenant('Privilege_Dufry'));
    
    this.elements.btnAlipay.addEventListener('click', () => 
      this.switchTenant('Privilege_Dufry', 'alipay'));
    
    this.elements.btnClear.addEventListener('click', () => 
      this.clearCache());
    
    // Handle image load errors
    this.elements.tenantLogo.addEventListener('error', () => {
      this.elements.tenantLogo.src = '/assets/default-logo.png';
    });
  }
  
  private subscribeToTenantChanges(): void {
    this.tenantManager.currentTenant$.subscribe((tenant: string) => {
      console.log('Tenant changed:', tenant);
      this.updateUI();
    });
    
    if (this.tenantManager.currentSubTenant$) {
      this.tenantManager.currentSubTenant$.subscribe((subTenant: string | null) => {
        console.log('Sub-tenant changed:', subTenant);
        this.updateUI();
      });
    }
  }
  
  private async initializeTenant(): Promise<void> {
    const urlParams = new URLSearchParams(window.location.search);
    const redemptionPartnerCode = 
      urlParams.get('tenant') || 
      sessionStorage.getItem('RedemptionPartnerCode') || 
      'Privilege_Dufry';
    
    const subTenantId = 
      urlParams.get('subTenant') || 
      sessionStorage.getItem('SubTenantId') || 
      'alipay';
    
    const initOptions: ITenantInitOptions = {
      redemptionPartnerCode,
      subTenantId,
      k8sUrl: 'https://your-api-url.com',
      cacheTimeout: 24 * 60 * 60 * 1000
    };
    
    await this.tenantManager.initializeTenant(initOptions);
    this.isInitialized = true;
  }
  
  private updateUI(): void {
    if (!this.isInitialized) return;
    
    const currentTenant = this.tenantManager.getCurrentTenant();
    const currentSubTenant = this.tenantManager.getCurrentSubTenant();
    
    // Update tenant information
    this.elements.currentTenant.textContent = currentTenant;
    
    if (currentSubTenant) {
      this.elements.currentSubTenant.textContent = currentSubTenant;
      this.elements.subTenantItem.style.display = 'block';
    } else {
      this.elements.subTenantItem.style.display = 'none';
    }
    
    // Update configuration values
    const title = this.tenantManager.getConfig<string>('title') || 'Unknown';
    const currency = this.tenantManager.getConfig<string>('currencySymbol') || '';
    const country = this.tenantManager.getConfig<string>('country') || '';
    const mode = this.tenantManager.getConfig<string>('mode') || '';
    
    this.elements.title.textContent = title;
    this.elements.currency.textContent = currency;
    this.elements.country.textContent = country;
    this.elements.mode.textContent = mode;
    
    // Update header
    this.elements.tenantTitle.textContent = title;
    this.elements.tenantSubtitle.textContent = 
      `${currentTenant}${currentSubTenant ? ' - ' + currentSubTenant : ''}`;
    
    // Update logo
    const logoUrl = this.tenantManager.getConfig<string>('storeLogo') || 
                   this.tenantManager.getConfig<string>('partnerLogo') || 
                   '/assets/default-logo.png';
    this.elements.tenantLogo.src = logoUrl;
  }
  
  private async switchTenant(tenantCode: string, subTenantId?: string): Promise<void> {
    this.setButtonsDisabled(true);
    this.showActionStatus('Switching tenant...');
    
    try {
      const initOptions: ITenantInitOptions = {
        redemptionPartnerCode: tenantCode,
        subTenantId,
        k8sUrl: 'https://your-api-url.com'
      };
      
      await this.tenantManager.initializeTenant(initOptions);
      
      // Update URL params
      const url = new URL(window.location.href);
      url.searchParams.set('tenant', tenantCode);
      if (subTenantId) {
        url.searchParams.set('subTenant', subTenantId);
      } else {
        url.searchParams.delete('subTenant');
      }
      window.history.pushState({}, '', url.toString());
      
      this.showActionStatus('Tenant switched successfully!');
      setTimeout(() => this.clearActionStatus(), 2000);
      
    } catch (error) {
      console.error('Failed to switch tenant:', error);
      this.showActionStatus('Failed to switch tenant', 'error');
      setTimeout(() => this.clearActionStatus(), 3000);
    } finally {
      this.setButtonsDisabled(false);
    }
  }
  
  private clearCache(): void {
    this.tenantManager.clearCache();
    this.showActionStatus('Cache cleared!');
    setTimeout(() => this.clearActionStatus(), 2000);
  }
  
  private setButtonsDisabled(disabled: boolean): void {
    const buttons = [
      this.elements.btnDefault,
      this.elements.btnDufry,
      this.elements.btnAlipay,
      this.elements.btnClear
    ];
    
    buttons.forEach(btn => btn.disabled = disabled);
  }
  
  private showActionStatus(message: string, type: 'info' | 'error' = 'info'): void {
    this.elements.actionStatus.textContent = message;
    this.elements.actionStatus.style.color = type === 'error' ? '#dc3545' : '#28a745';
    this.elements.actionStatus.style.fontWeight = '500';
    this.elements.actionStatus.style.marginTop = '10px';
  }
  
  private clearActionStatus(): void {
    this.elements.actionStatus.textContent = '';
  }
  
  private showApp(): void {
    this.elements.loading.style.display = 'none';
    this.elements.app.style.display = 'block';
  }
  
  private showError(message: string): void {
    this.elements.loading.innerHTML = `
      <h2 style="color: #dc3545;">Error</h2>
      <p>${message}</p>
    `;
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new TenantApp());
} else {
  new TenantApp();
}

// Export for potential external use
declare global {
  interface Window {
    TenantApp: typeof TenantApp;
  }
}

window.TenantApp = TenantApp;
```

### 4. Package.json for Vanilla Project

```json
{
  "name": "tenant-manager-vanilla-example",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@bhanudeep/tenant-manager": "^1.0.2"
  },
  "devDependencies": {
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
```

### 5. Vite Configuration (`vite.config.js`)

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

## Advanced Features

### 1. Custom HTTP Client with Authentication

```typescript
class AuthenticatedHttpClient implements IHttpClient {
  private authToken: string | null = null;
  
  setAuthToken(token: string): void {
    this.authToken = token;
  }
  
  async get<T = any>(url: string, options?: { headers?: Record<string, string> }): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      ...options?.headers
    };
    
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
}
```

### 2. URL Parameter Detection

```typescript
class URLTenantDetector {
  static detectFromURL(): { tenant?: string; subTenant?: string } {
    const urlParams = new URLSearchParams(window.location.search);
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    
    // Check query parameters
    const tenant = urlParams.get('tenant') || urlParams.get('t');
    const subTenant = urlParams.get('subTenant') || urlParams.get('st');
    
    // Check path segments
    const tenantFromPath = pathSegments.find(segment => 
      segment.startsWith('tenant-'))?.replace('tenant-', '');
    
    return {
      tenant: tenant || tenantFromPath,
      subTenant
    };
  }
}
```

### 3. Event System Integration

```typescript
class TenantEventManager {
  private eventTarget = new EventTarget();
  
  addEventListener(type: string, listener: EventListener): void {
    this.eventTarget.addEventListener(type, listener);
  }
  
  removeEventListener(type: string, listener: EventListener): void {
    this.eventTarget.removeEventListener(type, listener);
  }
  
  dispatchTenantChange(tenant: string, subTenant?: string | null): void {
    const event = new CustomEvent('tenantchange', {
      detail: { tenant, subTenant }
    });
    this.eventTarget.dispatchEvent(event);
  }
}

// Usage
const eventManager = new TenantEventManager();

eventManager.addEventListener('tenantchange', (event) => {
  const { tenant, subTenant } = event.detail;
  console.log(`Tenant changed to: ${tenant}`, subTenant);
  
  // Update analytics
  gtag('config', 'GA_TRACKING_ID', {
    custom_map: { tenant, subTenant }
  });
});
```

This vanilla implementation provides a complete, framework-independent solution that demonstrates the full capabilities of the tenant management package.