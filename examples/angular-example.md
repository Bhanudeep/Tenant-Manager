# Angular Integration Example

This example demonstrates how to integrate the Tenant Manager package in an Angular application.

## Installation

```bash
npm install @bhanudeep/tenant-manager
```

## Setup

### 1. App Module Configuration (`app.module.ts`)

```typescript
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { TenantConfigAngularService } from '@bhanudeep/tenant-manager/angular';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header.component';

// Factory function for APP_INITIALIZER
export function initializeTenant(tenantService: TenantConfigAngularService) {
  return tenantService.initializeForAngular({
    redemptionPartnerCode: 'Privilege_Dufry',
    subTenantId: 'alipay', // optional
    k8sUrl: 'https://your-api-url.com',
    cacheTimeout: 24 * 60 * 60 * 1000 // 24 hours
  });
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
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
export class AppModule { }
```

### 2. App Component (`app.component.ts`)

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TenantConfigAngularService } from '@bhanudeep/tenant-manager/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <app-header></app-header>
      <main class="main-content">
        <div class="tenant-info">
          <h2>Tenant Information</h2>
          <p><strong>Current Tenant:</strong> {{ currentTenant }}</p>
          <p *ngIf="currentSubTenant"><strong>Sub-tenant:</strong> {{ currentSubTenant }}</p>
          <p><strong>Title:</strong> {{ tenantTitle }}</p>
          <p><strong>Currency:</strong> {{ currencySymbol }}</p>
          <p><strong>Country:</strong> {{ country }}</p>
        </div>
        
        <div class="actions">
          <button (click)="switchTenant('default')">Switch to Default</button>
          <button (click)="switchTenant('Privilege_Dufry')">Switch to Privilege Dufry</button>
          <button (click)="clearCache()">Clear Cache</button>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      padding: 20px;
    }
    
    .main-content {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .tenant-info {
      background: var(--tenant-bg-color, #f5f5f5);
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    
    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      background: var(--tenant-primary-color, #007bff);
      color: white;
      cursor: pointer;
    }
    
    button:hover {
      opacity: 0.9;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  currentTenant = '';
  currentSubTenant: string | null = null;
  tenantTitle = '';
  currencySymbol = '';
  country = '';
  
  private subscriptions = new Subscription();

  constructor(private tenantConfig: TenantConfigAngularService) {}

  ngOnInit() {
    // Subscribe to tenant changes
    this.subscriptions.add(
      this.tenantConfig.getCurrentTenant$().subscribe(tenant => {
        this.currentTenant = tenant;
        this.updateTenantInfo();
      })
    );

    this.subscriptions.add(
      this.tenantConfig.getCurrentSubTenant$().subscribe(subTenant => {
        this.currentSubTenant = subTenant;
        this.updateTenantInfo();
      })
    );

    // Initial load
    this.updateTenantInfo();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private updateTenantInfo() {
    this.tenantTitle = this.tenantConfig.getConfig('title') || '';
    this.currencySymbol = this.tenantConfig.getConfig('currencySymbol') || '';
    this.country = this.tenantConfig.getConfig('country') || '';
  }

  async switchTenant(tenantCode: string) {
    try {
      await this.tenantConfig.initializeTenant({
        redemptionPartnerCode: tenantCode,
        k8sUrl: 'https://your-api-url.com'
      });
    } catch (error) {
      console.error('Failed to switch tenant:', error);
    }
  }

  clearCache() {
    this.tenantConfig.clearCache();
    console.log('Cache cleared');
  }
}
```

### 3. Header Component (`components/header.component.ts`)

```typescript
import { Component, OnInit } from '@angular/core';
import { TenantConfigAngularService } from '@bhanudeep/tenant-manager/angular';

@Component({
  selector: 'app-header',
  template: `
    <header class="tenant-header">
      <div class="logo-container">
        <img 
          [src]="logoUrl" 
          [alt]="tenantTitle"
          class="tenant-logo"
          (error)="onImageError($event)"
        />
        <h1 class="tenant-title">{{ tenantTitle }}</h1>
      </div>
      
      <nav class="navigation">
        <a href="#" class="nav-link">Home</a>
        <a href="#" class="nav-link">Products</a>
        <a href="#" class="nav-link">About</a>
      </nav>
    </header>
  `,
  styles: [`
    .tenant-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      background: var(--tenant-header-bg, #ffffff);
      border-bottom: 2px solid var(--tenant-primary-color, #007bff);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
      color: var(--tenant-text-color, #333);
      font-size: 1.5rem;
    }
    
    .navigation {
      display: flex;
      gap: 20px;
    }
    
    .nav-link {
      text-decoration: none;
      color: var(--tenant-link-color, #007bff);
      font-weight: 500;
      padding: 8px 12px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    
    .nav-link:hover {
      background: var(--tenant-link-hover-bg, rgba(0,123,255,0.1));
    }
  `]
})
export class HeaderComponent implements OnInit {
  logoUrl = '';
  tenantTitle = '';

  constructor(private tenantConfig: TenantConfigAngularService) {}

  ngOnInit() {
    this.loadTenantData();
    
    // Update when tenant changes
    this.tenantConfig.getCurrentTenant$().subscribe(() => {
      this.loadTenantData();
    });
  }

  private loadTenantData() {
    this.logoUrl = this.tenantConfig.getConfig('storeLogo') || 
                   this.tenantConfig.getConfig('partnerLogo') || 
                   'assets/default-logo.png';
    this.tenantTitle = this.tenantConfig.getConfig('title') || 'Default Title';
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-logo.png';
  }
}
```

### 4. Package.json Dependencies

```json
{
  "dependencies": {
    "@angular/animations": "^16.0.0",
    "@angular/common": "^16.0.0",
    "@angular/compiler": "^16.0.0",
    "@angular/core": "^16.0.0",
    "@angular/platform-browser": "^16.0.0",
    "@angular/platform-browser-dynamic": "^16.0.0",
    "@angular/router": "^16.0.0",
    "@bhanudeep/tenant-manager": "^1.0.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.13.0"
  }
}
```

### 5. Sample CSS Variables (`styles.css`)

```css
/* Global styles with CSS custom properties for theming */

/* Default theme */
:root {
  --tenant-primary-color: #007bff;
  --tenant-bg-color: #f8f9fa;
  --tenant-text-color: #333333;
  --tenant-header-bg: #ffffff;
  --tenant-link-color: #007bff;
  --tenant-link-hover-bg: rgba(0,123,255,0.1);
}

/* Privilege Dufry theme */
.Privilege_Dufry-mode {
  --tenant-primary-color: #d4a574;
  --tenant-bg-color: #faf8f5;
  --tenant-text-color: #2c1810;
  --tenant-header-bg: #ffffff;
  --tenant-link-color: #d4a574;
  --tenant-link-hover-bg: rgba(212,165,116,0.1);
}

/* Privilege Dufry Alipay sub-tenant theme */
.Privilege_Dufry-alipay-mode {
  --tenant-primary-color: #1677ff;
  --tenant-bg-color: #f0f8ff;
  --tenant-text-color: #001529;
  --tenant-header-bg: #ffffff;
  --tenant-link-color: #1677ff;
  --tenant-link-hover-bg: rgba(22,119,255,0.1);
}

/* Default theme */
.default-mode {
  --tenant-primary-color: #6c757d;
  --tenant-bg-color: #f8f9fa;
  --tenant-text-color: #495057;
  --tenant-header-bg: #ffffff;
  --tenant-link-color: #6c757d;
  --tenant-link-hover-bg: rgba(108,117,125,0.1);
}
```

## Usage Notes

1. **APP_INITIALIZER**: Ensures tenant configuration is loaded before the app starts
2. **Reactive Updates**: Components automatically update when tenant configuration changes
3. **Error Handling**: Includes fallback images and error handling
4. **CSS Variables**: Uses CSS custom properties for dynamic theming
5. **Caching**: Configuration is automatically cached for performance

## Advanced Features

### Custom HTTP Interceptor

You can add an HTTP interceptor to automatically include tenant headers:

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { TenantConfigAngularService } from '@bhanudeep/tenant-manager/angular';

@Injectable()
export class TenantHeaderInterceptor implements HttpInterceptor {
  constructor(private tenantConfig: TenantConfigAngularService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const tenantCode = this.tenantConfig.getCurrentTenant();
    const modifiedReq = req.clone({
      headers: req.headers.set('X-Tenant-Code', tenantCode)
    });
    return next.handle(modifiedReq);
  }
}
```

### Route Guards

Create route guards that check tenant configuration:

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TenantConfigAngularService } from '@bhanudeep/tenant-manager/angular';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private tenantConfig: TenantConfigAngularService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const tenant = this.tenantConfig.getCurrentTenant();
    if (tenant === 'default') {
      this.router.navigate(['/tenant-setup']);
      return false;
    }
    return true;
  }
}
```