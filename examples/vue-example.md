# Vue Integration Example

This example demonstrates how to integrate the Tenant Manager package in a Vue 3 application using both Composition API and Options API.

## Installation

```bash
npm install @bhanudeep/tenant-manager
```

## Setup

### 1. Main Entry Point (`src/main.ts`)

```typescript
import { createApp } from 'vue';
import { TenantConfigPlugin } from '@bhanudeep/tenant-manager/vue';
import App from './App.vue';
import './style.css';

const app = createApp(App);

// Install the tenant config plugin
app.use(TenantConfigPlugin, {
  autoInitialize: true,
  initOptions: {
    redemptionPartnerCode: 'Privilege_Dufry',
    subTenantId: 'alipay', // optional
    k8sUrl: 'https://your-api-url.com',
    cacheTimeout: 24 * 60 * 60 * 1000 // 24 hours
  }
});

app.mount('#app');
```

### 2. App Component (`src/App.vue`)

```vue
<template>
  <div class="app-container">
    <HeaderComponent />
    <main class="main-content">
      <LoadingSpinner v-if="!isInitialized" />
      <template v-else>
        <TenantInfo />
        <ActionsComponent />
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useVueTenantConfig } from '@bhanudeep/tenant-manager/vue';
import HeaderComponent from './components/HeaderComponent.vue';
import TenantInfo from './components/TenantInfo.vue';
import ActionsComponent from './components/ActionsComponent.vue';
import LoadingSpinner from './components/LoadingSpinner.vue';

const { isInitialized } = useVueTenantConfig();
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: var(--tenant-bg-color, #ffffff);
  color: var(--tenant-text-color, #333333);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
```

### 3. Header Component (`src/components/HeaderComponent.vue`)

```vue
<template>
  <header class="tenant-header">
    <div class="logo-container">
      <img 
        :src="displayLogoUrl"
        :alt="tenantTitle"
        class="tenant-logo"
        @error="handleImageError"
      />
      <h1 class="tenant-title">{{ tenantTitle }}</h1>
    </div>
    
    <nav class="navigation">
      <a href="#" class="nav-link">Home</a>
      <a href="#" class="nav-link">Products</a>
      <a href="#" class="nav-link">About</a>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useVueTenantConfig } from '@bhanudeep/tenant-manager/vue';

const { tenantCore } = useVueTenantConfig();
const imageError = ref(false);

const logoUrl = computed(() => 
  tenantCore.getConfig<string>('storeLogo') || 
  tenantCore.getConfig<string>('partnerLogo') || 
  '/assets/default-logo.png'
);

const displayLogoUrl = computed(() => 
  imageError.value ? '/assets/default-logo.png' : logoUrl.value
);

const tenantTitle = computed(() => 
  tenantCore.getConfig<string>('title') || 'Default Title'
);

const handleImageError = () => {
  imageError.value = true;
};
</script>

<style scoped>
.tenant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: #ffffff;
  border-bottom: 3px solid var(--tenant-primary-color, #007bff);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.tenant-logo {
  height: 50px;
  width: auto;
  object-fit: contain;
}

.tenant-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--tenant-text-color, #333);
}

.navigation {
  display: flex;
  gap: 25px;
}

.nav-link {
  text-decoration: none;
  color: var(--tenant-primary-color, #007bff);
  font-weight: 500;
  padding: 10px 15px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: var(--tenant-primary-color, #007bff);
  color: white;
}
</style>
```

### 4. Tenant Info Component (`src/components/TenantInfo.vue`)

```vue
<template>
  <div class="tenant-info">
    <h2>Tenant Information</h2>
    <div class="info-grid">
      <div class="info-item">
        <strong>Current Tenant:</strong>
        <span>{{ currentTenant }}</span>
      </div>
      <div v-if="currentSubTenant" class="info-item">
        <strong>Sub-tenant:</strong>
        <span>{{ currentSubTenant }}</span>
      </div>
      <div class="info-item">
        <strong>Title:</strong>
        <span>{{ title }}</span>
      </div>
      <div class="info-item">
        <strong>Currency:</strong>
        <span>{{ currencySymbol }}</span>
      </div>
      <div class="info-item">
        <strong>Country:</strong>
        <span>{{ country }}</span>
      </div>
      <div class="info-item">
        <strong>Mode:</strong>
        <span>{{ mode }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useVueTenantConfig } from '@bhanudeep/tenant-manager';

const { currentTenant, currentSubTenant, tenantCore } = useVueTenantConfig();

const title = computed(() => tenantCore.getConfig<string>('title') || '');
const currencySymbol = computed(() => tenantCore.getConfig<string>('currencySymbol') || '');
const country = computed(() => tenantCore.getConfig<string>('country') || '');
const mode = computed(() => tenantCore.getConfig<string>('mode') || '');
</script>

<style scoped>
.tenant-info {
  background: white;
  border: 1px solid var(--tenant-border-color, #dee2e6);
  border-radius: 8px;
  padding: 24px;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.tenant-info h2 {
  margin-top: 0;
  color: var(--tenant-primary-color, #007bff);
  border-bottom: 2px solid var(--tenant-primary-color, #007bff);
  padding-bottom: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item strong {
  color: var(--tenant-text-color, #333);
  font-size: 0.9rem;
}

.info-item span {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--tenant-primary-color, #007bff);
}
</style>
```

### 5. Actions Component (`src/components/ActionsComponent.vue`)

```vue
<template>
  <div class="actions">
    <h3>Actions</h3>
    <div class="button-group">
      <button 
        @click="switchTenant('default')"
        :disabled="loading"
        class="action-button"
      >
        Switch to Default
      </button>
      
      <button 
        @click="switchTenant('Privilege_Dufry')"
        :disabled="loading"
        class="action-button"
      >
        Switch to Privilege Dufry
      </button>
      
      <button 
        @click="switchTenant('Privilege_Dufry', 'alipay')"
        :disabled="loading"
        class="action-button"
      >
        Switch to Alipay Sub-tenant
      </button>
      
      <button 
        @click="clearCache"
        :disabled="loading"
        class="action-button secondary"
      >
        Clear Cache
      </button>
    </div>
    
    <div v-if="loading" class="loading-indicator">
      Switching tenant...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useVueTenantConfig } from '@bhanudeep/tenant-manager/vue';

const { tenantCore } = useVueTenantConfig();
const loading = ref(false);

const switchTenant = async (tenantCode: string, subTenantId?: string) => {
  loading.value = true;
  try {
    await tenantCore.initializeTenant({
      redemptionPartnerCode: tenantCode,
      subTenantId,
      k8sUrl: 'https://your-api-url.com'
    });
  } catch (error) {
    console.error('Failed to switch tenant:', error);
  } finally {
    loading.value = false;
  }
};

const clearCache = () => {
  tenantCore.clearCache();
  console.log('Cache cleared');
};
</script>

<style scoped>
.actions {
  background: white;
  border: 1px solid var(--tenant-border-color, #dee2e6);
  border-radius: 8px;
  padding: 24px;
  margin: 20px 0;
}

.actions h3 {
  margin-top: 0;
  color: var(--tenant-primary-color, #007bff);
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.action-button {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  background: var(--tenant-primary-color, #007bff);
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.action-button.secondary {
  background: #6c757d;
}

.loading-indicator {
  color: var(--tenant-primary-color, #007bff);
  font-style: italic;
  text-align: center;
  padding: 8px;
}
</style>
```

### 6. Loading Spinner (`src/components/LoadingSpinner.vue`)

```vue
<template>
  <div class="loading-container">
    <div class="spinner"></div>
    <p>Loading tenant configuration...</p>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--tenant-primary-color, #007bff);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

p {
  color: var(--tenant-text-color, #333);
  font-size: 1.1rem;
}
</style>
```

### 7. Options API Example (`src/components/OptionsAPIExample.vue`)

```vue
<template>
  <div class="options-api-example">
    <h3>Options API Example</h3>
    <p>Current tenant: {{ currentTenant }}</p>
    <p>Title: {{ tenantTitle }}</p>
    <button @click="refreshTenant">Refresh</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'OptionsAPIExample',
  
  computed: {
    currentTenant(): string {
      return this.$tenantConfig?.currentTenant || 'unknown';
    },
    
    tenantTitle(): string {
      return this.$getTenantConfig('title') || 'No title';
    }
  },
  
  methods: {
    async refreshTenant() {
      try {
        await this.$initializeTenant({
          redemptionPartnerCode: this.currentTenant,
          k8sUrl: 'https://your-api-url.com'
        });
      } catch (error) {
        console.error('Failed to refresh tenant:', error);
      }
    }
  }
});
</script>
```

### 8. Composable for Theme Management (`src/composables/useTheme.ts`)

```typescript
import { computed, watchEffect } from 'vue';
import { useVueTenantConfig } from '@bhanudeep/tenant-manager/vue';

interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

export function useTheme() {
  const { tenantCore, currentTenant, currentSubTenant } = useVueTenantConfig();

  const theme = computed<ThemeConfig>(() => {
    const mode = tenantCore.getConfig<string>('mode') || 'default-mode';
    
    const themeConfigs: Record<string, ThemeConfig> = {
      'default-mode': {
        primaryColor: '#6c757d',
        backgroundColor: '#f8f9fa',
        textColor: '#495057',
        borderColor: '#dee2e6'
      },
      'Privilege_Dufry-mode': {
        primaryColor: '#d4a574',
        backgroundColor: '#faf8f5',
        textColor: '#2c1810',
        borderColor: '#e6d7c3'
      },
      'Privilege_Dufry-alipay-mode': {
        primaryColor: '#1677ff',
        backgroundColor: '#f0f8ff',
        textColor: '#001529',
        borderColor: '#91d5ff'
      }
    };

    return themeConfigs[mode] || themeConfigs['default-mode'];
  });

  // Apply theme to CSS custom properties
  watchEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--tenant-primary-color', theme.value.primaryColor);
    root.style.setProperty('--tenant-bg-color', theme.value.backgroundColor);
    root.style.setProperty('--tenant-text-color', theme.value.textColor);
    root.style.setProperty('--tenant-border-color', theme.value.borderColor);
  });

  return {
    theme
  };
}
```

### 9. Composable for Tenant Data (`src/composables/useTenantData.ts`)

```typescript
import { ref, computed, watchEffect } from 'vue';
import { useVueTenantConfig } from '@bhanudeep/tenant-manager/vue';

export function useTenantData() {
  const { tenantCore, currentTenant } = useVueTenantConfig();
  const data = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const apiUrl = computed(() => 
    tenantCore.getConfig<string>('apiUrl') || 'https://default-api.com'
  );

  const fetchTenantData = async () => {
    if (!currentTenant) return;

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${apiUrl.value}/tenant-data`, {
        headers: {
          'X-Tenant-Code': currentTenant
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      data.value = await response.json();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  };

  // Refetch data when tenant changes
  watchEffect(() => {
    if (currentTenant) {
      fetchTenantData();
    }
  });

  return {
    data,
    loading,
    error,
    refetch: fetchTenantData
  };
}
```

### 10. Plugin with Custom Configuration (`src/plugins/customTenantPlugin.ts`)

```typescript
import { App } from 'vue';
import { createTenantConfigPlugin } from '@bhanudeep/tenant-manager/vue';

export default {
  install(app: App, options: any = {}) {
    // Create custom tenant plugin with environment-specific config
    const tenantPlugin = createTenantConfigPlugin({
      autoInitialize: options.autoInitialize ?? true,
      initOptions: {
        redemptionPartnerCode: options.defaultTenant || 'default',
        k8sUrl: options.apiUrl || process.env.VUE_APP_API_URL,
        cacheTimeout: options.cacheTimeout || 24 * 60 * 60 * 1000
      }
    });

    app.use(tenantPlugin);

    // Add global error handler for tenant operations
    app.config.errorHandler = (err, instance, info) => {
      if (info.includes('tenant')) {
        console.error('Tenant configuration error:', err);
      }
    };
  }
};
```

### 11. TypeScript Declarations (`src/types/tenant.d.ts`)

```typescript
import { VueTenantConfigState } from '@bhanudeep/tenant-manager/vue';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $tenantConfig: VueTenantConfigState;
    $getTenantConfig: <T = any>(key: string) => T | undefined;
    $getAllTenantConfig: () => any;
    $initializeTenant: (options: any) => Promise<void>;
  }
}
```

### 12. Package.json Dependencies

```json
{
  "dependencies": {
    "@bhanudeep/tenant-manager": "^1.0.0",
    "vue": "^3.3.4"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.2.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5",
    "vue-tsc": "^1.4.2"
  }
}
```

### 13. Global CSS (`src/style.css`)

```css
/* Global CSS variables for theming */
:root {
  --tenant-primary-color: #007bff;
  --tenant-bg-color: #ffffff;
  --tenant-text-color: #333333;
  --tenant-border-color: #dee2e6;
}

/* Base styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--tenant-bg-color);
  color: var(--tenant-text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Tenant mode classes - automatically applied by the package */
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
```

## Advanced Usage Patterns

### 1. Conditional Component Rendering

```vue
<template>
  <div>
    <AlipayComponent v-if="isAlipayTenant" />
    <DufryComponent v-else-if="isDufryTenant" />
    <DefaultComponent v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useVueTenantConfig } from '@bhanudeep/tenant-manager';

const { currentTenant, currentSubTenant } = useVueTenantConfig();

const isAlipayTenant = computed(() => 
  currentTenant === 'Privilege_Dufry' && currentSubTenant === 'alipay'
);

const isDufryTenant = computed(() => 
  currentTenant === 'Privilege_Dufry'
);
</script>
```

### 2. Dynamic Route Configuration

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { inject } from 'vue';
import { TenantConfigKey } from '@bhanudeep/tenant-manager/vue';

const routes = [
  {
    path: '/',
    component: () => import('../views/Home.vue'),
    beforeEnter: (to: any, from: any, next: any) => {
      const tenantConfig = inject(TenantConfigKey);
      const tenant = tenantConfig?.currentTenant;
      
      if (tenant === 'Privilege_Dufry') {
        next('/dufry-home');
      } else {
        next();
      }
    }
  }
];
```

This Vue integration provides comprehensive examples for both Composition API and Options API usage, with proper TypeScript support and advanced patterns for real-world applications.