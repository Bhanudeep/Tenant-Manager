# @Bhanudeep/tenant-manager

A framework-agnostic TypeScript package for multi-tenant applications with dynamic theming, asset management, and configuration loading.

## Features

- 🏢 **Multi-tenant configuration management**
- 🎨 **Dynamic theming system**
- 📦 **Asset loading from blob storage and local paths**
- 🔧 **Framework adapters for React, Angular, and Vue**
- 📱 **URL parameter parsing for tenant detection**
- 💾 **Session storage integration**
- ⚡ **TypeScript first with full type safety**
- 🌐 **Framework-agnostic core**

## Installation

```bash
npm install @Bhanudeep/tenant-manager
```

## Quick Start

### Vanilla JavaScript/TypeScript

```typescript
import { TenantManager, ThemeManager } from '@Bhanudeep/tenant-manager';

// Initialize with configuration
const tenantManager = new TenantManager({
  apiBaseUrl: 'https://your-api.com',
  enableAutoTheming: true,
  enableUrlParsing: true,
  onTenantChange: (tenantId, subTenantId) => {
    console.log('Tenant changed:', tenantId, subTenantId);
  }
});

// Initialize the manager
await tenantManager.initialize();

// Get current configuration
const config = tenantManager.getCurrentConfig();
console.log('Tenant config:', config);

// Get asset paths
const logoPath = tenantManager.getAssetPath('partnerLogo');
```

### React

```typescript
import React from 'react';
import { createTenantHook } from '@Bhanudeep/tenant-manager/react';

// Create the hook with configuration
const useTenant = createTenantHook();

function MyComponent() {
  const { 
    currentTenant, 
    config, 
    getAssetPath, 
    switchTenant 
  } = useTenant({
    apiBaseUrl: 'https://your-api.com',
    enableAutoTheming: true
  });

  return (
    <div>
      <h1>Current Tenant: {currentTenant}</h1>
      <img src={getAssetPath('partnerLogo') || ''} alt="Partner Logo" />
      <button onClick={() => switchTenant('newTenant')}>
        Switch Tenant
      </button>
    </div>
  );
}
```

### Angular

```typescript
// tenant.service.ts
import { Injectable } from '@angular/core';
import { createAngularTenantService } from '@Bhanudeep/tenant-manager/angular';

@Injectable({ providedIn: 'root' })
export class TenantService extends createAngularTenantService({
  apiBaseUrl: 'https://your-api.com',
  enableAutoTheming: true
}) {}

// app.module.ts
import { APP_INITIALIZER } from '@angular/core';
import { createAngularInitializer } from '@Bhanudeep/tenant-manager/angular';

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: createAngularInitializer,
      deps: [TenantService],
      multi: true
    }
  ]
})
export class AppModule {}

// component.ts
import { Component } from '@angular/core';
import { TenantService } from './tenant.service';

@Component({
  template: `
    <h1>Current Tenant: {{ tenantService.getCurrentTenant() }}</h1>
    <img [src]="tenantService.getAssetPath('partnerLogo')" alt="Logo">
  `
})
export class MyComponent {
  constructor(public tenantService: TenantService) {}
}
```

### Vue 3

```typescript
// main.ts
import { createApp } from 'vue';
import { createTenantPlugin } from '@Bhanudeep/tenant-manager/vue';

const app = createApp(App);
app.use(createTenantPlugin({
  apiBaseUrl: 'https://your-api.com'
}));

// component.vue
<template>
  <div>
    <h1>Current Tenant: {{ currentTenant }}</h1>
    <img :src="getAssetPath('partnerLogo')" alt="Logo">
  </div>
</template>

<script setup>
import { createUseTenant } from '@Bhanudeep/tenant-manager/vue';

const useTenant = createUseTenant();
const { currentTenant, getAssetPath } = useTenant();
</script>
```

## Configuration Options

```typescript
interface InitializationOptions {
  // API Configuration
  apiBaseUrl?: string;                    // Base URL for tenant API
  customHeaders?: Record<string, string>; // Custom headers for API requests
  
  // Storage Configuration
  storageKey?: string;                    // Session storage key for tenant (default: 'RedemptionPartnerCode')
  subTenantStorageKey?: string;          // Session storage key for sub-tenant (default: 'tenant')
  enableSessionStorage?: boolean;         // Enable session storage (default: true)
  
  // URL Parameter Configuration
  urlParamKey?: string;                   // URL parameter for tenant (default: 'RedemptionPartnerCode')
  subTenantParamKey?: string;            // URL parameter for sub-tenant (default: 'tenant')
  encodedParamKey?: string;              // Encoded parameter key (default: 'p')
  enableUrlParsing?: boolean;            // Enable URL parsing (default: true)
  
  // Theming
  enableAutoTheming?: boolean;           // Enable automatic theming (default: true)
  
  // Defaults
  defaultTenant?: string;                // Default tenant ID (default: 'default')
  
  // Callbacks
  onError?: (error: Error) => void;
  onTenantChange?: (tenantId: string, subTenantId?: string) => void;
  onConfigLoad?: (config: TenantConfig) => void;
}
```

## Tenant Configuration Structure

```typescript
interface TenantConfig {
  // Asset paths
  welcomeImg?: string;
  partnerLogo?: string;
  partnerImg?: string;
  combinedLogo?: string;
  storeLogo?: string;
  welcomevouchertypePath?: string;
  vouchertypePath?: string;
  termsAndConditionsPath?: string;
  privacyPolicyPath?: string;
  countryList?: string;
  showBanner?: string;
  
  // Configuration
  mode?: string;                          // CSS mode class
  redemptionPartnerCode?: string;
  country?: string;
  title?: string;
  currencySymbol?: string;
  partnerName?: string;
  paymentPartner?: string;               // 'stripe', 'paypal', etc.
  clicker?: string | boolean;
  
  // Sub-tenants
  subTenants?: {
    [key: string]: TenantConfig;
  };
  
  // Custom properties
  [key: string]: any;
}
```

## Dynamic Theming

The package includes a powerful theming system that can be configured per tenant:

```typescript
import { ThemeManager } from '@Bhanudeep/tenant-manager';

const themeManager = ThemeManager.getInstance();

// Register themes
themeManager.registerThemes({
  'tenant1': {
    'primary-color': '#de021b',
    'background-color': '#171c1c',
    'background-image': 'url(../assets/tenant1/gradient.svg)'
  },
  'tenant2': {
    'primary-color': '#0bc9ac',
    'background-color': '#ffffff',
    'background-image': 'url(../assets/tenant2/gradient.svg)'
  }
});

// Apply theme
themeManager.applyTheme('tenant1');
```

### CSS Variables

The theme system automatically sets CSS variables that you can use in your stylesheets:

```css
.my-component {
  color: var(--tenant-primary-color);
  background: var(--tenant-background-color);
  background-image: var(--tenant-background-image);
}

/* Mode-specific styles */
.tenant1-mode .special-element {
  border: 2px solid var(--tenant-primary-color);
}
```

## Asset Management

```typescript
import { AssetManager } from '@Bhanudeep/tenant-manager';

const assetManager = new AssetManager();

// Preload images for better performance
const imagePaths = ['logo.png', 'background.jpg', 'banner.svg'];
await assetManager.preloadImages(imagePaths);

// Change favicon dynamically
assetManager.changeFavicon('/assets/tenant1/favicon.ico');

// Update page title
assetManager.updateTitle('Tenant 1 - My App');

// Get asset URL with cache busting
const logoUrl = assetManager.getAssetUrl('/assets/logo.png', true);
```

## URL Parameter Formats

The package supports multiple URL parameter formats for tenant detection:

### Direct Parameters
```
https://myapp.com/#/page?RedemptionPartnerCode=tenant1&tenant=subtenant1
```

### Encoded Parameters
```
https://myapp.com/#/page?p=eyJDb2RlIjoidGVuYW50MSIsIlRlbmFudCI6InN1YnRlbmFudDEifQ==
```

The encoded parameter should be a base64-encoded JSON object:
```json
{
  "Code": "tenant1",
  "Tenant": "subtenant1"
}
```

## Configuration Validation

```typescript
import { ConfigValidator } from '@Bhanudeep/tenant-manager';

// Validate configuration
const { isValid, errors } = ConfigValidator.validateTenantConfig(config);
if (!isValid) {
  console.error('Configuration errors:', errors);
}

// Sanitize configuration
const sanitizedConfig = ConfigValidator.sanitizeConfig(rawConfig);

// Validate encoded parameters
const tenantInfo = ConfigValidator.validateEncodedParam(encodedParam);
```

## API Integration

The package can fetch tenant configurations from your backend API. The API should return a response in this format:

```json
{
  "success": true,
  "data": {
    "partnerLogo": "https://blob.storage.com/tenant1/logo.png",
    "partnerImg": "https://blob.storage.com/tenant1/background.jpg",
    "mode": "tenant1-mode",
    "title": "Tenant 1 Application",
    "primaryColor": "#de021b",
    "paymentPartner": "stripe",
    "clicker": true,
    "subTenants": {
      "subtenant1": {
        "partnerLogo": "https://blob.storage.com/tenant1/subtenant1/logo.png",
        "mode": "tenant1-subtenant1-mode"
      }
    }
  }
}
```

## Events

Listen to tenant management events:

```typescript
tenantManager.on('tenantChange', (payload) => {
  console.log('Tenant changed:', payload.tenantId, payload.subTenantId);
});

tenantManager.on('configLoad', (payload) => {
  console.log('Configuration loaded:', payload.config);
});

tenantManager.on('error', (payload) => {
  console.error('Error occurred:', payload.error);
});
```

## Best Practices

### 1. Initialize Early
Initialize the tenant manager as early as possible in your application lifecycle:

```typescript
// In your main.ts or index.ts
import { initializeTenantManager } from '@Bhanudeep/tenant-manager';

async function bootstrap() {
  const tenantManager = await initializeTenantManager({
    apiBaseUrl: process.env.REACT_APP_API_URL,
    enableAutoTheming: true
  });
  
  // Start your app after tenant initialization
  startApp();
}

bootstrap().catch(console.error);
```

### 2. Error Handling
Always handle initialization errors gracefully:

```typescript
const tenantManager = new TenantManager({
  onError: (error) => {
    // Log error to your monitoring service
    console.error('Tenant Manager Error:', error);
    
    // Show user-friendly error message
    showErrorToast('Failed to load tenant configuration');
  }
});
```

### 3. Asset Preloading
Preload critical assets during initialization:

```typescript
tenantManager.on('configLoad', async (payload) => {
  const assetManager = new AssetManager();
  const imagePaths = assetManager.extractImagePaths(payload.config);
  
  // Preload images in the background
  assetManager.preloadImages(imagePaths, { lazyLoad: true }).catch(console.warn);
});
```

### 4. Caching
The package automatically caches configurations, but you can clear them when needed:

```typescript
// Clear cached configurations
tenantManager.destroy();

// Reinitialize with fresh data
await tenantManager.initialize();
```

## TypeScript Support

The package is built with TypeScript and provides full type safety:

```typescript
import type { TenantConfig, InitializationOptions } from '@Bhanudeep/tenant-manager';

// Type-safe configuration
const config: InitializationOptions = {
  apiBaseUrl: 'https://api.example.com',
  enableAutoTheming: true,
  onTenantChange: (tenantId: string, subTenantId?: string) => {
    // TypeScript ensures correct parameter types
    console.log(`Switched to ${tenantId}/${subTenantId || 'main'}`);
  }
};

// Type-safe asset access
const assetPath: string | null = tenantManager.getAssetPath('partnerLogo');
```

## Browser Support

- Modern browsers (ES2020+)
- Chrome 80+
- Firefox 72+
- Safari 13.1+
- Edge 80+

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

For issues and questions, please use the GitHub issue tracker.
