import type { AssetPreloadOptions } from '../types/index.js';

/**
 * Utility class for managing and preloading tenant assets
 */
export class AssetManager {
  private preloadedImages: Set<string> = new Set();
  private preloadedFonts: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  /**
   * Preload images for a tenant configuration
   */
  async preloadImages(imagePaths: string[], options: AssetPreloadOptions = {}): Promise<void> {
    const { timeout = 10000, lazyLoad = false } = options;

    if (lazyLoad) {
      // Use Intersection Observer for lazy loading
      this.setupLazyLoading(imagePaths);
      return;
    }

    const promises = imagePaths
      .filter(path => path && !this.preloadedImages.has(path))
      .map(path => this.preloadSingleImage(path, timeout));

    await Promise.allSettled(promises);
  }

  /**
   * Preload a single image
   */
  private preloadSingleImage(src: string, timeout: number): Promise<void> {
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      const timeoutId = setTimeout(() => {
        reject(new Error(`Image load timeout: ${src}`));
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        this.preloadedImages.add(src);
        resolve();
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });

    this.loadingPromises.set(src, promise);
    
    promise.finally(() => {
      this.loadingPromises.delete(src);
    });

    return promise;
  }

  /**
   * Setup lazy loading for images
   */
  private setupLazyLoading(imagePaths: string[]): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      this.preloadImages(imagePaths, { lazyLoad: false });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });

    // Add lazy loading attributes to existing images
    imagePaths.forEach(path => {
      const images = document.querySelectorAll(`img[src="${path}"]`);
      images.forEach(img => {
        const imgElement = img as HTMLImageElement;
        imgElement.dataset.src = imgElement.src;
        imgElement.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="transparent"/></svg>';
        observer.observe(imgElement);
      });
    });
  }

  /**
   * Preload fonts
   */
  async preloadFonts(fontUrls: string[]): Promise<void> {
    const promises = fontUrls
      .filter(url => url && !this.preloadedFonts.has(url))
      .map(url => this.preloadSingleFont(url));

    await Promise.allSettled(promises);
  }

  /**
   * Preload a single font
   */
  private preloadSingleFont(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      
      link.onload = () => {
        this.preloadedFonts.add(url);
        resolve();
      };
      
      link.onerror = () => {
        reject(new Error(`Failed to preload font: ${url}`));
      };

      link.href = url;
      document.head.appendChild(link);
    });
  }

  /**
   * Get asset URL with cache busting
   */
  getAssetUrl(basePath: string, cacheBust = true): string {
    if (!basePath) return '';
    
    if (cacheBust) {
      const separator = basePath.includes('?') ? '&' : '?';
      return `${basePath}${separator}t=${Date.now()}`;
    }
    
    return basePath;
  }

  /**
   * Change favicon dynamically
   */
  changeFavicon(iconUrl: string): void {
    if (!iconUrl) return;

    // Remove existing favicon
    const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
    existingFavicons.forEach(favicon => favicon.remove());

    // Add new favicon
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/x-icon';
    favicon.href = this.getAssetUrl(iconUrl);
    document.head.appendChild(favicon);
  }

  /**
   * Update page title
   */
  updateTitle(title: string, suffix?: string): void {
    if (title) {
      document.title = suffix ? `${title} | ${suffix}` : title;
    }
  }

  /**
   * Extract image paths from tenant configuration
   */
  extractImagePaths(config: any): string[] {
    const imagePaths: string[] = [];
    const imageKeys = [
      'welcomeImg',
      'partnerLogo',
      'partnerImg',
      'combinedLogo',
      'storeLogo',
      'welcomevouchertypePath',
      'vouchertypePath',
      'showBanner'
    ];

    imageKeys.forEach(key => {
      if (config[key] && typeof config[key] === 'string') {
        imagePaths.push(config[key]);
      }
    });

    // Extract from sub-tenants
    if (config.subTenants) {
      Object.values(config.subTenants).forEach((subConfig: any) => {
        imageKeys.forEach(key => {
          if (subConfig[key] && typeof subConfig[key] === 'string') {
            imagePaths.push(subConfig[key]);
          }
        });
      });
    }

    return imagePaths.filter(Boolean);
  }

  /**
   * Check if image is preloaded
   */
  isImagePreloaded(src: string): boolean {
    return this.preloadedImages.has(src);
  }

  /**
   * Check if font is preloaded
   */
  isFontPreloaded(url: string): boolean {
    return this.preloadedFonts.has(url);
  }

  /**
   * Clear all preloaded assets
   */
  clearPreloaded(): void {
    this.preloadedImages.clear();
    this.preloadedFonts.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get preload statistics
   */
  getStats(): { images: number; fonts: number; loading: number } {
    return {
      images: this.preloadedImages.size,
      fonts: this.preloadedFonts.size,
      loading: this.loadingPromises.size
    };
  }
}