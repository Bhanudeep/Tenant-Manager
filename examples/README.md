# Examples

This directory contains usage examples for different frameworks and scenarios.

## Basic Example

```typescript
// basic-usage.ts
import { TenantManager } from '@bhanudeepsimhadri/tenant-manager';

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
import { ThemeManager } from '@bhanudeepsimhadri/tenant-manager';

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