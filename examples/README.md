# Examples

# Framework Integration Examples

This directory contains example implementations for integrating the Tenant Manager package with different frameworks.

## Examples Included

- **Angular**: Complete Angular application setup with APP_INITIALIZER
- **React**: React application with Context Provider and hooks
- **Vue**: Vue 3 application with plugin integration
- **Vanilla**: Framework-agnostic vanilla JavaScript/TypeScript usage

Each example demonstrates:
- Package installation and setup
- Tenant initialization
- Configuration access
- Dynamic theming
- Asset management

## Quick Start

Choose your framework and follow the corresponding example:

1. **Angular**: See `angular-example/`
2. **React**: See `react-example/`  
3. **Vue**: See `vue-example/`
4. **Vanilla JS/TS**: See `vanilla-example/`

## Common Configuration

All examples use the same basic tenant configuration:

```typescript
const initOptions = {
  redemptionPartnerCode: 'Privilege_Dufry',
  subTenantId: 'alipay', // optional
  k8sUrl: 'https://your-api-url.com',
  cacheTimeout: 24 * 60 * 60 * 1000 // 24 hours
};
```

## Asset Structure

Ensure your assets are organized as follows:

```
public/assets/tenants/
├── Privilege_Dufry/
│   ├── images/logo.png
│   ├── styles/tenant.css
│   └── alipay/
│       └── styles/tenant.css
└── default/
    ├── images/logo.png
    └── styles/tenant.css
```

## Basic Example

```typescript
// basic-usage.ts
import { TenantManager } from '@bhanudeep/tenant-manager';

async function main() {
  const manager = new TenantManager({
    apiBaseUrl: 'https://your-api.com',
    enableAutoTheming: true,
    onTenantChange: (tenantId, subTenantId) => {
      console.log('Switched to:', tenantId, subTenantId);
    }
  });

  await manager.initialize();
  
  const config = manager.getCurrentConfig();
  console.log('Current config:', config);
  
  const logo = manager.getAssetPath('partnerLogo');
  console.log('Logo path:', logo);
}

main().catch(console.error);
```

## React Example

See the React section in the main README for detailed examples.

## Angular Example

See the Angular section in the main README for detailed examples.

## Vue Example

See the Vue section in the main README for detailed examples.

## Advanced Theming

```typescript
import { ThemeManager } from '@bhanudeep/tenant-manager';

const themeManager = ThemeManager.getInstance();

// Register multiple themes
themeManager.registerThemes({
  'dufry': {
    'primary-color': '#de021b',
    'background-color': '#171c1c',
    'background-image': 'url(../assets/dufry/gradient.svg)'
  },
  'alipay': {
    'primary-color': '#1677ff',
    'background-color': '#f0f2f5',
    'background-image': 'url(../assets/alipay/gradient.svg)'
  }
});

// Apply theme dynamically
themeManager.applyTheme('dufry');
```