import { TenantManager } from '../core/TenantManager.js';
import type { InitializationOptions, TenantConfig } from '../types/index.js';

/**
 * Angular Service interface for Tenant Management
 */
export interface AngularTenantService {
  readonly tenantManager: TenantManager;
  readonly currentTenant$: any; // Observable<string | null>
  readonly currentSubTenant$: any; // Observable<string | null>
  readonly config$: any; // Observable<TenantConfig | null>
  readonly isLoading$: any; // Observable<boolean>
  readonly isInitialized$: any; // Observable<boolean>
  
  initialize(): Promise<void>;
  switchTenant(tenantId: string, subTenantId?: string): Promise<void>;
  getAssetPath(assetKey: string): string | null;
  getConfig(key: string): any;
  getCurrentTenant(): string | null;
  getCurrentSubTenant(): string | null;
  getCurrentConfig(): TenantConfig | null;
}

/**
 * Angular Service Factory
 * 
 * Usage in Angular:
 * 
 * ```typescript
 * import { Injectable } from '@angular/core';
 * import { createAngularTenantService } from '@bhanudeepsimhadri/tenant-manager/angular';
 * 
 * @Injectable({ providedIn: 'root' })
 * export class TenantService extends createAngularTenantService({
 *   apiBaseUrl: 'https://your-api.com',
 *   enableAutoTheming: true
 * }) {}
 * ```
 */
export function createAngularTenantService(options: InitializationOptions = {}) {
  class AngularTenantServiceBase implements AngularTenantService {
    public _tenantManager: TenantManager;
    
    // These would be actual RxJS BehaviorSubjects in a real Angular implementation
    public readonly currentTenant$: any;
    public readonly currentSubTenant$: any;
    public readonly config$: any;
    public readonly isLoading$: any;
    public readonly isInitialized$: any;

    constructor() {
      this._tenantManager = new TenantManager(options);
      
      // In a real Angular implementation, you would create BehaviorSubjects here
      // and subscribe to tenant manager events to update them
      this.currentTenant$ = this.createObservable(() => this._tenantManager.getCurrentTenant());
      this.currentSubTenant$ = this.createObservable(() => this._tenantManager.getCurrentSubTenant());
      this.config$ = this.createObservable(() => this._tenantManager.getCurrentConfig());
      this.isLoading$ = this.createObservable(() => this._tenantManager.getState().isLoading);
      this.isInitialized$ = this.createObservable(() => this._tenantManager.getState().isInitialized);
    }

    public createObservable(getter: () => any): any {
      // This is a placeholder - in real Angular, you'd use BehaviorSubject
      return {
        subscribe: (callback: (value: any) => void) => {
          // Set up event listeners on tenant manager to update observables
          callback(getter());
        }
      };
    }

    get tenantManager(): TenantManager {
      return this._tenantManager;
    }

    async initialize(): Promise<void> {
      return this._tenantManager.initialize();
    }

    async switchTenant(tenantId: string, subTenantId?: string): Promise<void> {
      return this._tenantManager.switchTenant(tenantId, subTenantId);
    }

    getAssetPath(assetKey: string): string | null {
      return this._tenantManager.getAssetPath(assetKey);
    }

    getConfig(key: string): any {
      return this._tenantManager.getConfig(key);
    }

    getCurrentTenant(): string | null {
      return this._tenantManager.getCurrentTenant();
    }

    getCurrentSubTenant(): string | null {
      return this._tenantManager.getCurrentSubTenant();
    }

    getCurrentConfig(): TenantConfig | null {
      return this._tenantManager.getCurrentConfig();
    }
  }

  return AngularTenantServiceBase;
}

/**
 * Angular APP_INITIALIZER factory function
 * 
 * Usage in Angular app.module.ts:
 * 
 * ```typescript
 * import { createAngularInitializer } from '@bhanudeepsimhadri/tenant-manager/angular';
 * 
 * @NgModule({
 *   providers: [
 *     {
 *       provide: APP_INITIALIZER,
 *       useFactory: createAngularInitializer,
 *       deps: [TenantService],
 *       multi: true
 *     }
 *   ]
 * })
 * export class AppModule {}
 * ```
 */
export function createAngularInitializer(tenantService: AngularTenantService) {
  return () => tenantService.initialize();
}

/**
 * Angular Guard for route protection based on tenant
 * 
 * Usage:
 * 
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'protected',
 *     component: ProtectedComponent,
 *     canActivate: [createTenantGuard(['tenant1', 'tenant2'])]
 *   }
 * ];
 * ```
 */
export function createTenantGuard(allowedTenants: string[]) {
  return class TenantGuard {
    constructor(public tenantService: AngularTenantService) {}

    canActivate(): boolean {
      const currentTenant = this.tenantService.getCurrentTenant();
      return currentTenant ? allowedTenants.includes(currentTenant) : false;
    }
  };
}

/**
 * Angular Pipe for getting asset paths
 * 
 * Usage in templates:
 * 
 * ```html
 * <img [src]="'partnerLogo' | tenantAsset" />
 * ```
 */
export function createTenantAssetPipe(tenantService: AngularTenantService) {
  return class TenantAssetPipe {
    transform(assetKey: string): string | null {
      return tenantService.getAssetPath(assetKey);
    }
  };
}

/**
 * Angular Directive for conditional display based on tenant
 * 
 * Usage in templates:
 * 
 * ```html
 * <div *tenantOnly="'tenant1'">This only shows for tenant1</div>
 * <div *tenantOnly="['tenant1', 'tenant2']">This shows for multiple tenants</div>
 * ```
 */
export function createTenantOnlyDirective(tenantService: AngularTenantService) {
  return class TenantOnlyDirective {
    public allowedTenants: string[] = [];

    set tenantOnly(tenants: string | string[]) {
      this.allowedTenants = Array.isArray(tenants) ? tenants : [tenants];
      this.updateVisibility();
    }

    public updateVisibility(): void {
      const currentTenant = tenantService.getCurrentTenant();
      const shouldShow = currentTenant ? this.allowedTenants.includes(currentTenant) : false;
      
      // In real Angular implementation, you would use ViewContainerRef and TemplateRef
      // to show/hide the template based on shouldShow
      console.log('Should show element:', shouldShow);
    }
  };
}