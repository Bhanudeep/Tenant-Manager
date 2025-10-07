# Cross-Framework Tenant Manager

A framework-agnostic TypeScript package for multi-tenant applications with dynamic theming, asset management, and configuration loading. Compatible with Angular, React, Vue, and vanilla JavaScript.

## Features

- 🏢 **Multi-tenant support** with dynamic configuration loading
- 🎨 **Dynamic theming** with CSS injection and mode classes
- 📦 **Asset management** with tenant-specific resources
- 🔄 **Caching** with configurable timeout and session storage
- 🚀 **Framework adapters** for Angular, React, and Vue
- 📱 **Sub-tenant support** for hierarchical tenant structures
- 🌐 **API integration** with fallback to local configuration

## Installation

```bash
npm install @bhanudeep/tenant-manager
```

## Framework-Specific Usage

### Angular Integration

1. **Install the package:**
   ```bash
   npm install @bhanudeep/tenant-manager
   ```

2. **Import and configure in `app.module.ts`:**
   ```typescript
   import { NgModule, APP_INITIALIZER } from '@angular/core';
   import { BrowserModule } from '@angular/platform-browser';
   import { HttpClientModule } from '@angular/common/http';
   import { TenantConfigAngularService } from '@bhanudeep/tenant-manager';
   import { AppComponent } from './app.component';

   export function initializeTenant(tenantService: TenantConfigAngularService) {
     return tenantService.initializeForAngular({
       redemptionPartnerCode: 'Privilege_Dufry',
       subTenantId: 'alipay', // optional
       k8sUrl: 'https://your-api-url.com'
     });
   }

   @NgModule({
     imports: [BrowserModule, HttpClientModule],
     providers: [
       TenantConfigAngularService,
       {
         provide: APP_INITIALIZER,
         useFactory: initializeTenant,
         deps: [TenantConfigAngularService],
         multi: true
       }
     ],
     bootstrap: [AppComponent]
   })
   export class AppModule {}
   ```

3. **Use in components:**
   ```typescript
   import { Component } from '@angular/core';
   import { TenantConfigAngularService } from '@bhanudeep/tenant-manager';

   @Component({
     selector: 'app-root',
     template: `
       <div class="tenant-header">
         <img [src]="logoUrl" [alt]="tenantTitle">
         <h1>{{ tenantTitle }}</h1>
       </div>
     `
   })
   export class AppComponent {
     logoUrl: string;
     tenantTitle: string;

     constructor(private tenantConfig: TenantConfigAngularService) {
       this.logoUrl = this.tenantConfig.getConfig('storeLogo');
       this.tenantTitle = this.tenantConfig.getConfig('title');
       
       // Subscribe to tenant changes
       this.tenantConfig.getCurrentTenant$().subscribe(tenant => {
         console.log('Current tenant:', tenant);
       });
     }
   }
   ```

### React Integration

1. **Install the package:**
   ```bash
   npm install @bhanudeep/tenant-manager
   ```

2. **Wrap your app with `TenantConfigProvider` in `index.tsx`:**
   ```jsx
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import { TenantConfigProvider } from '@bhanudeep/tenant-manager';
   import App from './App';

   const initOptions = {
     redemptionPartnerCode: 'Privilege_Dufry',
     subTenantId: 'alipay', // optional
     k8sUrl: 'https://your-api-url.com'
   };

   ReactDOM.createRoot(document.getElementById('root')).render(
     <TenantConfigProvider initOptions={initOptions}>
       <App />
     </TenantConfigProvider>
   );
   ```

3. **Use the `useTenantConfig` hook in components:**
   ```jsx
   import React from 'react';
   import { useReactTenantConfig } from '@bhanudeep/tenant-manager';

   function MyComponent() {
     const { 
       currentTenant, 
       currentSubTenant, 
       isInitialized, 
       getConfig, 
       getAllConfig 
     } = useReactTenantConfig();

     const logoUrl = getConfig('storeLogo');
     const title = getConfig('title');
     const currencySymbol = getConfig('currencySymbol');

     if (!isInitialized) {
       return <div>Loading tenant configuration...</div>;
     }

     return (
       <div className="tenant-header">
         <img src={logoUrl} alt={title} />
         <h1>{title}</h1>
         <p>Current tenant: {currentTenant}</p>
         {currentSubTenant && <p>Sub-tenant: {currentSubTenant}</p>}
         <p>Currency: {currencySymbol}</p>
       </div>
     );
   }

   export default MyComponent;
   ```

### Vue Integration

1. **Install the package:**
   ```bash
   npm install @bhanudeep/tenant-manager
   ```

2. **Install the plugin in `main.ts`:**
   ```typescript
   import { createApp } from 'vue';
   import { TenantConfigPlugin } from '@bhanudeep/tenant-manager';
   import App from './App.vue';

   const app = createApp(App);

   app.use(TenantConfigPlugin, {
     autoInitialize: true,
     initOptions: {
       redemptionPartnerCode: 'Privilege_Dufry',
       subTenantId: 'alipay', // optional
       k8sUrl: 'https://your-api-url.com'
     }
   });

   app.mount('#app');
   ```

3. **Use in Vue components:**

   **Composition API:**
   ```vue
   <template>
     <div class="tenant-header" v-if="isInitialized">
       <img :src="logoUrl" :alt="title" />
       <h1>{{ title }}</h1>
       <p>Current tenant: {{ currentTenant }}</p>
       <p v-if="currentSubTenant">Sub-tenant: {{ currentSubTenant }}</p>
     </div>
     <div v-else>Loading tenant configuration...</div>
   </template>

   <script setup>
   import { computed } from 'vue';
   import { useVueTenantConfig } from '@bhanudeep/tenant-manager';

   const { currentTenant, currentSubTenant, isInitialized, tenantCore } = useVueTenantConfig();

   const logoUrl = computed(() => tenantCore.getConfig('storeLogo'));
   const title = computed(() => tenantCore.getConfig('title'));
   </script>
   ```

   **Options API:**
   ```vue
   <template>
     <div class="tenant-header">
       <img :src="logoUrl" :alt="title" />
       <h1>{{ title }}</h1>
     </div>
   </template>

   <script>
   export default {
     computed: {
       logoUrl() {
         return this.$getTenantConfig('storeLogo');
       },
       title() {
         return this.$getTenantConfig('title');
       }
     }
   };
   </script>
   ```

## Core API Reference

### `TenantConfigCore`

The main class that handles tenant configuration logic.

#### Methods

- `initializeTenant(options: ITenantInitOptions): Promise<void>`
- `getCurrentTenant(): string`
- `getCurrentSubTenant(): string | null`
- `getConfig<T>(key: string): T | undefined`
- `getAllConfig(): ITenantConfig | undefined`
- `updateAssetMapping(tenantCode: string, config: IAssetMapping[string]): void`
- `clearCache(tenantCode?: string): void`

#### Properties

- `currentTenant$: Observable<string>` - Observable for current tenant changes
- `currentSubTenant$: Observable<string | null>` - Observable for sub-tenant changes

### Configuration Interface

```typescript
interface ITenantInitOptions {
  redemptionPartnerCode: string;
  subTenantId?: string;
  k8sUrl?: string;
  cacheTimeout?: number; // in milliseconds, default: 24 hours
}

interface ITenantConfig {
  mode: string;
  redemptionPartnerCode: string;
  country: string;
  title: string;
  currencySymbol: string;
  welcomeImg?: string;
  storeLogo?: string;
  partnerName?: string;
  termsAndConditionsPath?: string;
  privacyPolicyPath?: string;
  // ... extensible with additional properties
}
```

## Asset Management

The package supports hierarchical asset management:

```
assets/
└── tenants/
    ├── Privilege_Dufry/
    │   ├── images/
    │   │   └── logo.png
    │   ├── styles/
    │   │   └── tenant.css
    │   └── alipay/          # Sub-tenant
    │       └── styles/
    │           └── tenant.css
    └── default/
        ├── images/
        └── styles/
```

## Dynamic Theming

The package automatically:
1. Applies CSS mode classes to `document.body`
2. Loads tenant-specific CSS files
3. Handles sub-tenant style overrides

CSS classes applied:
- Main tenant: `{mode}-mode` (e.g., `Privilege_Dufry-mode`)
- Sub-tenant: `{mode}-{subTenant}-mode` (e.g., `Privilege_Dufry-alipay-mode`)

## Caching

Configuration is automatically cached in `sessionStorage` with:
- Configurable timeout (default: 24 hours)
- Automatic cache invalidation
- Fallback to local asset mapping

## Framework-Agnostic Usage

You can also use the core functionality without framework adapters:

```typescript
import { TenantConfigCore, IHttpClient } from '@bhanudeep/tenant-manager';

// Implement HTTP client for your environment
const httpClient: IHttpClient = {
  get: async (url, options) => {
    const response = await fetch(url, { headers: options?.headers });
    return response.json();
  }
};

const tenantManager = new TenantConfigCore(httpClient);

await tenantManager.initializeTenant({
  redemptionPartnerCode: 'Privilege_Dufry',
  k8sUrl: 'https://your-api-url.com'
});

const title = tenantManager.getConfig('title');
```

## License

MIT