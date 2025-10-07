# Package Summary

## @bhanudeep/tenant-manager

A comprehensive, framework-agnostic TypeScript package for multi-tenant applications with dynamic theming, asset management, and configuration loading. Built to work seamlessly with Angular, React, Vue, and vanilla JavaScript/TypeScript.

## 🚀 Key Features

### Core Functionality
- **Framework-Agnostic Core**: Built with `TenantConfigCore` class that works independently of any framework
- **Multi-Tenant Support**: Full support for hierarchical tenant structures with sub-tenant capabilities
- **Dynamic Configuration Loading**: RESTful API integration with intelligent fallback to local configurations
- **Caching Strategy**: Session storage-based caching with configurable TTL and automatic invalidation
- **Real-time Updates**: RxJS-based observable state management for reactive UI updates

### Dynamic Theming & Assets
- **Automatic CSS Injection**: Dynamic loading of tenant-specific stylesheets
- **Mode Class Application**: Automatic application of CSS classes to document body
- **Asset Management**: Hierarchical organization of tenant and sub-tenant assets
- **Cache Busting**: Timestamp-based URL generation for fresh asset loading
- **Error Handling**: Graceful fallback for missing assets and configurations

### Framework Integration
- **Angular**: Native service with `APP_INITIALIZER` integration and HTTP client abstraction
- **React**: Context provider with hooks-based API and Higher-Order Component support
- **Vue 3**: Plugin system with both Composition API and Options API support
- **Vanilla JS/TS**: Direct core usage with custom HTTP client implementation

## 📦 Installation

```bash
npm install @bhanudeep/tenant-manager
```

## 🎯 Quick Start

### Framework-Agnostic (Core)
```typescript
import { TenantConfigCore, IHttpClient } from '@bhanudeep/tenant-manager';

const httpClient: IHttpClient = {
  get: async (url, options) => {
    const response = await fetch(url, { headers: options?.headers });
    return response.json();
  }
};

const tenantManager = new TenantConfigCore(httpClient);

await tenantManager.initializeTenant({
  redemptionPartnerCode: 'Privilege_Dufry',
  subTenantId: 'alipay',
  k8sUrl: 'https://your-api-url.com'
});

const title = tenantManager.getConfig('title');
```

### Angular
```typescript
import { TenantConfigAngularService } from '@bhanudeep/tenant-manager';

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (service: TenantConfigAngularService) => 
        service.initializeForAngular({ redemptionPartnerCode: 'Privilege_Dufry' }),
      deps: [TenantConfigAngularService],
      multi: true
    }
  ]
})
export class AppModule {}
```

### React
```jsx
import { TenantConfigProvider, useReactTenantConfig } from '@bhanudeep/tenant-manager';

function App() {
  return (
    <TenantConfigProvider initOptions={{ redemptionPartnerCode: 'Privilege_Dufry' }}>
      <MyComponent />
    </TenantConfigProvider>
  );
}

function MyComponent() {
  const { currentTenant, getConfig, isInitialized } = useReactTenantConfig();
  const title = getConfig('title');
  return <h1>{title}</h1>;
}
```

### Vue 3
```typescript
import { TenantConfigPlugin } from '@bhanudeep/tenant-manager';

app.use(TenantConfigPlugin, {
  initOptions: { redemptionPartnerCode: 'Privilege_Dufry' }
});
```

```vue
<script setup>
import { useVueTenantConfig } from '@bhanudeep/tenant-manager';

const { tenantCore, currentTenant } = useVueTenantConfig();
const title = computed(() => tenantCore.getConfig('title'));
</script>
```

## 🏗 Architecture

### Core Components
- **TenantConfigCore**: Main business logic and state management
- **HTTP Client Abstraction**: Framework-specific HTTP implementations
- **Observable State**: RxJS-based reactive state management
- **Asset Management**: Dynamic CSS and resource loading
- **Caching Layer**: Session storage with intelligent invalidation

### API Integration
- **Promotional Partner API**: Dynamic configuration loading
- **Legal Document API**: Terms and conditions retrieval
- **Asset URLs**: Dynamic asset path generation with cache busting
- **Error Handling**: Graceful degradation to local configurations

## 📊 Configuration Structure

```typescript
interface ITenantConfig {
  mode: string;                      // CSS mode class
  redemptionPartnerCode: string;     // Unique tenant identifier
  country: string;                   // Locale/region
  title: string;                     // Display title
  currencySymbol: string;            // Currency symbol
  welcomeImg?: string;               // Welcome/banner image
  storeLogo?: string;                // Logo URL
  partnerName?: string;              // Partner display name
  termsAndConditionsPath?: string;   // Legal document URL
  privacyPolicyPath?: string;        // Privacy policy URL
}
```

## 🎨 Asset Organization

```
assets/tenants/
├── Privilege_Dufry/
│   ├── images/logo.png
│   ├── styles/tenant.css
│   └── alipay/              # Sub-tenant
│       └── styles/tenant.css
└── default/
    ├── images/logo.png
    └── styles/tenant.css
```

## 🔧 Advanced Features

- **Sub-tenant Hierarchies**: Multi-level tenant structures with inheritance
- **Cache Management**: Configurable TTL and manual cache clearing
- **URL Parameter Detection**: Automatic tenant detection from URL
- **Event System**: Custom events for tenant changes
- **TypeScript Support**: Full type definitions and intellisense
- **Error Boundaries**: Comprehensive error handling and logging
- **Performance Optimization**: Lazy loading and efficient caching

## 📚 Documentation

- [Complete Integration Guide](./README.md)
- [Angular Examples](./examples/angular-example.md)
- [React Examples](./examples/react-example.md)
- [Vue Examples](./examples/vue-example.md)
- [Vanilla JS Examples](./examples/vanilla-example.md)

## 🔄 Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history and migration guides.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.