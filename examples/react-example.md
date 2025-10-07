# React Integration Example

This example demonstrates how to integrate the Tenant Manager package in a React application.

## Installation

```bash
npm install @bhanudeep/tenant-manager
```

## Setup

### 1. Main Entry Point (`src/index.tsx`)

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { TenantConfigProvider } from '@bhanudeep/tenant-manager/react';
import App from './App';
import './index.css';

const initOptions = {
  redemptionPartnerCode: 'Privilege_Dufry',
  subTenantId: 'alipay', // optional
  k8sUrl: 'https://your-api-url.com',
  cacheTimeout: 24 * 60 * 60 * 1000 // 24 hours
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TenantConfigProvider initOptions={initOptions} autoInitialize={true}>
      <App />
    </TenantConfigProvider>
  </React.StrictMode>
);
```

### 2. App Component (`src/App.tsx`)

```tsx
import React from 'react';
import { useReactTenantConfig } from '@bhanudeep/tenant-manager/react';
import Header from './components/Header';
import TenantInfo from './components/TenantInfo';
import Actions from './components/Actions';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

function App() {
  const { isInitialized, currentTenant, currentSubTenant } = useReactTenantConfig();

  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <TenantInfo />
        <Actions />
      </main>
    </div>
  );
}

export default App;
```

### 3. Header Component (`src/components/Header.tsx`)

```tsx
import React, { useState } from 'react';
import { useReactTenantConfig } from '@bhanudeep/tenant-manager/react';
import './Header.css';

const Header: React.FC = () => {
  const { getConfig } = useReactTenantConfig();
  const [imageError, setImageError] = useState(false);

  const logoUrl = getConfig<string>('storeLogo') || 
                  getConfig<string>('partnerLogo') || 
                  '/assets/default-logo.png';
  const tenantTitle = getConfig<string>('title') || 'Default Title';

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <header className="tenant-header">
      <div className="logo-container">
        <img 
          src={imageError ? '/assets/default-logo.png' : logoUrl}
          alt={tenantTitle}
          className="tenant-logo"
          onError={handleImageError}
        />
        <h1 className="tenant-title">{tenantTitle}</h1>
      </div>
      
      <nav className="navigation">
        <a href="#" className="nav-link">Home</a>
        <a href="#" className="nav-link">Products</a>
        <a href="#" className="nav-link">About</a>
      </nav>
    </header>
  );
};

export default Header;
```

### 4. Tenant Info Component (`src/components/TenantInfo.tsx`)

```tsx
import React from 'react';
import { useReactTenantConfig } from '@bhanudeep/tenant-manager/react';
import './TenantInfo.css';

const TenantInfo: React.FC = () => {
  const { 
    currentTenant, 
    currentSubTenant, 
    getConfig 
  } = useReactTenantConfig();

  const title = getConfig<string>('title') || '';
  const currencySymbol = getConfig<string>('currencySymbol') || '';
  const country = getConfig<string>('country') || '';
  const mode = getConfig<string>('mode') || '';

  return (
    <div className="tenant-info">
      <h2>Tenant Information</h2>
      <div className="info-grid">
        <div className="info-item">
          <strong>Current Tenant:</strong>
          <span>{currentTenant}</span>
        </div>
        {currentSubTenant && (
          <div className="info-item">
            <strong>Sub-tenant:</strong>
            <span>{currentSubTenant}</span>
          </div>
        )}
        <div className="info-item">
          <strong>Title:</strong>
          <span>{title}</span>
        </div>
        <div className="info-item">
          <strong>Currency:</strong>
          <span>{currencySymbol}</span>
        </div>
        <div className="info-item">
          <strong>Country:</strong>
          <span>{country}</span>
        </div>
        <div className="info-item">
          <strong>Mode:</strong>
          <span>{mode}</span>
        </div>
      </div>
    </div>
  );
};

export default TenantInfo;
```

### 5. Actions Component (`src/components/Actions.tsx`)

```tsx
import React, { useState } from 'react';
import { useReactTenantConfig } from '@bhanudeep/tenant-manager/react';
import './Actions.css';

const Actions: React.FC = () => {
  const { tenantCore } = useReactTenantConfig();
  const [loading, setLoading] = useState(false);

  const switchTenant = async (tenantCode: string, subTenantId?: string) => {
    setLoading(true);
    try {
      await tenantCore.initializeTenant({
        redemptionPartnerCode: tenantCode,
        subTenantId,
        k8sUrl: 'https://your-api-url.com'
      });
    } catch (error) {
      console.error('Failed to switch tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    tenantCore.clearCache();
    console.log('Cache cleared');
  };

  return (
    <div className="actions">
      <h3>Actions</h3>
      <div className="button-group">
        <button 
          onClick={() => switchTenant('default')}
          disabled={loading}
          className="action-button"
        >
          Switch to Default
        </button>
        
        <button 
          onClick={() => switchTenant('Privilege_Dufry')}
          disabled={loading}
          className="action-button"
        >
          Switch to Privilege Dufry
        </button>
        
        <button 
          onClick={() => switchTenant('Privilege_Dufry', 'alipay')}
          disabled={loading}
          className="action-button"
        >
          Switch to Alipay Sub-tenant
        </button>
        
        <button 
          onClick={clearCache}
          disabled={loading}
          className="action-button secondary"
        >
          Clear Cache
        </button>
      </div>
      
      {loading && (
        <div className="loading-indicator">
          Switching tenant...
        </div>
      )}
    </div>
  );
};

export default Actions;
```

### 6. Loading Spinner (`src/components/LoadingSpinner.tsx`)

```tsx
import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading tenant configuration...</p>
    </div>
  );
};

export default LoadingSpinner;
```

### 7. Custom Hook for Advanced Usage (`src/hooks/useTenantTheme.ts`)

```tsx
import { useEffect, useState } from 'react';
import { useReactTenantConfig } from '@bhanudeep/tenant-manager/react';

interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

export const useTenantTheme = (): ThemeConfig => {
  const { getConfig, currentTenant, currentSubTenant } = useReactTenantConfig();
  const [theme, setTheme] = useState<ThemeConfig>({
    primaryColor: '#007bff',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    borderColor: '#dee2e6'
  });

  useEffect(() => {
    const mode = getConfig<string>('mode') || 'default-mode';
    
    // Define theme configurations based on tenant mode
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

    const newTheme = themeConfigs[mode] || themeConfigs['default-mode'];
    setTheme(newTheme);

    // Apply CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--tenant-primary-color', newTheme.primaryColor);
    root.style.setProperty('--tenant-bg-color', newTheme.backgroundColor);
    root.style.setProperty('--tenant-text-color', newTheme.textColor);
    root.style.setProperty('--tenant-border-color', newTheme.borderColor);

  }, [currentTenant, currentSubTenant, getConfig]);

  return theme;
};
```

### 8. Higher-Order Component Example (`src/hoc/withTenantConfig.tsx`)

```tsx
import React from 'react';
import { useReactTenantConfig } from '@bhanudeep/tenant-manager';

interface TenantConfigProps {
  tenantConfig: ReturnType<typeof useReactTenantConfig>;
}

export function withTenantConfig<P extends object>(
  WrappedComponent: React.ComponentType<P & TenantConfigProps>
) {
  const WithTenantConfigComponent: React.FC<P> = (props) => {
    const tenantConfig = useReactTenantConfig();

    return <WrappedComponent {...props} tenantConfig={tenantConfig} />;
  };

  WithTenantConfigComponent.displayName = 
    `withTenantConfig(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithTenantConfigComponent;
}

// Usage example:
interface MyComponentProps {
  title: string;
  tenantConfig: ReturnType<typeof useReactTenantConfig>;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, tenantConfig }) => {
  const { currentTenant, getConfig } = tenantConfig;
  
  return (
    <div>
      <h2>{title}</h2>
      <p>Current tenant: {currentTenant}</p>
    </div>
  );
};

export default withTenantConfig(MyComponent);
```

### 9. CSS Styles

**App.css**:
```css
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
```

**Header.css**:
```css
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
```

**TenantInfo.css**:
```css
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
```

### 10. Package.json Dependencies

```json
{
  "dependencies": {
    "@bhanudeep/tenant-manager": "^1.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
```

## Advanced Usage Patterns

### 1. Conditional Rendering Based on Tenant

```tsx
import React from 'react';
import { useReactTenantConfig } from '@bhanudeep/tenant-manager';

const ConditionalFeature: React.FC = () => {
  const { currentTenant, currentSubTenant, getConfig } = useReactTenantConfig();

  // Show different features based on tenant
  if (currentTenant === 'Privilege_Dufry' && currentSubTenant === 'alipay') {
    return <AlipaySpecificFeature />;
  }

  if (currentTenant === 'Privilege_Dufry') {
    return <DufryFeature />;
  }

  return <DefaultFeature />;
};
```

### 2. Tenant-aware API Calls

```tsx
import React, { useEffect, useState } from 'react';
import { useReactTenantConfig } from '@bhanudeep/tenant-manager';

const TenantDataComponent: React.FC = () => {
  const { currentTenant, getConfig } = useReactTenantConfig();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchTenantData = async () => {
      const apiUrl = getConfig<string>('apiUrl') || 'https://default-api.com';
      const response = await fetch(`${apiUrl}/tenant-data`, {
        headers: {
          'X-Tenant-Code': currentTenant
        }
      });
      const result = await response.json();
      setData(result);
    };

    fetchTenantData();
  }, [currentTenant, getConfig]);

  return <div>{/* Render tenant-specific data */}</div>;
};
```

### 3. Dynamic Form Configuration

```tsx
import React from 'react';
import { useReactTenantConfig } from '@bhanudeep/tenant-manager';

const DynamicForm: React.FC = () => {
  const { getConfig } = useReactTenantConfig();
  
  const formConfig = getConfig('formConfiguration') || {
    fields: ['name', 'email'],
    validation: { required: ['name', 'email'] }
  };

  return (
    <form>
      {formConfig.fields.map((field: string) => (
        <div key={field}>
          <label>{field}</label>
          <input 
            type="text" 
            name={field}
            required={formConfig.validation.required.includes(field)}
          />
        </div>
      ))}
    </form>
  );
};
```

This React integration provides a complete, production-ready solution with proper TypeScript types, error handling, and advanced usage patterns.