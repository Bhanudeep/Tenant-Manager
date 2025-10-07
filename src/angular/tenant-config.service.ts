// src/angular/tenant-config.service.ts
import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TenantConfigCore } from '../core/tenant-config.core';
import { IHttpClient, IState, ITenantInitOptions } from '../core/interfaces';

// Angular HTTP client adapter
class AngularHttpClientAdapter implements IHttpClient {
  constructor(private http: HttpClient) {}

  async get<T = any>(url: string, options?: { headers?: Record<string, string> }): Promise<T> {
    const headers = new HttpHeaders(options?.headers || {});
    return this.http.get<T>(url, { headers }).toPromise() as Promise<T>;
  }
}

@Injectable({ providedIn: 'root' })
export class TenantConfigAngularService extends TenantConfigCore implements IState<string> {
  constructor(private http: HttpClient) {
    super(new AngularHttpClientAdapter(http));
  }

  // Angular-specific initialization method that can be used with APP_INITIALIZER
  initializeForAngular(options: ITenantInitOptions): () => Promise<void> {
    return () => this.initializeTenant(options);
  }

  // Convenience method to get current tenant as Observable (Angular-friendly)
  getCurrentTenant$(): Observable<string> {
    return this.currentTenant$;
  }

  // Convenience method to get current sub-tenant as Observable (Angular-friendly)  
  getCurrentSubTenant$(): Observable<string | null> {
    return this.currentSubTenant$ || new Observable(observer => observer.next(null));
  }
}