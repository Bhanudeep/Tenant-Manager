import type { TenantConfig, ThemeConfig, TenantThemeMapping, StyleInjectionOptions } from '../types/index.js';

/**
 * Utility class for managing dynamic theming based on tenant configuration
 */
export class ThemeManager {
  private static instance: ThemeManager;
  private themeMapping: TenantThemeMapping = {};
  private appliedStyles: Map<string, HTMLStyleElement> = new Map();

  private constructor() {}

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * Register theme configuration for a tenant
   */
  registerTheme(tenantId: string, theme: ThemeConfig): void {
    this.themeMapping[tenantId] = theme;
  }

  /**
   * Register multiple themes at once
   */
  registerThemes(themes: TenantThemeMapping): void {
    this.themeMapping = { ...this.themeMapping, ...themes };
  }

  /**
   * Apply theme for a specific tenant
   */
  applyTheme(tenantId: string, config?: TenantConfig, options: StyleInjectionOptions = {}): void {
    const theme = this.themeMapping[tenantId];
    if (!theme) {
      console.warn(`No theme found for tenant: ${tenantId}`);
      return;
    }

    // Remove existing mode classes
    document.body.classList.forEach(cls => {
      if (cls.endsWith('-mode')) {
        document.body.classList.remove(cls);
      }
    });

    // Apply mode class
    const modeClass = config?.mode || `${tenantId}-mode`;
    document.body.classList.add(modeClass);

    // Apply CSS custom properties
    this.applyCSSVariables(theme);

    // Inject additional styles if needed
    this.injectCustomStyles(tenantId, theme, options);
  }

  /**
   * Apply CSS custom properties from theme config
   */
  private applyCSSVariables(theme: ThemeConfig): void {
    const root = document.documentElement;

    // Map theme properties to CSS variables
    const cssVariableMap: { [key: string]: string } = {
      'primary-color': '--tenant-primary-color',
      'background-color': '--tenant-background-color',
      'background-image': '--tenant-background-image',
      'active-step-color': '--tenant-active-step-color',
      'active-step-shadow': '--tenant-active-step-shadow',
      'active-step-border': '--tenant-active-step-border',
      'previous-step-color': '--tenant-previous-step-color'
    };

    Object.entries(theme).forEach(([key, value]) => {
      const cssVar = cssVariableMap[key] || `--tenant-${key}`;
      if (value) {
        root.style.setProperty(cssVar, String(value));
      }
    });
  }

  /**
   * Inject custom CSS styles for a tenant
   */
  private injectCustomStyles(tenantId: string, theme: ThemeConfig, options: StyleInjectionOptions): void {
    const styleId = options.styleId || `tenant-theme-${tenantId}`;
    
    // Remove existing styles for this tenant
    const existingStyle = this.appliedStyles.get(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Generate CSS from theme configuration
    const css = this.generateThemeCSS(tenantId, theme, options.important);
    
    // Create and inject new style element
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = css;
    
    const targetElement = options.targetElement || document.head;
    targetElement.appendChild(styleElement);
    
    this.appliedStyles.set(styleId, styleElement);
  }

  /**
   * Generate CSS from theme configuration
   */
  private generateThemeCSS(tenantId: string, theme: ThemeConfig, important = false): string {
    const modeClass = `${tenantId}-mode`;
    const importantSuffix = important ? ' !important' : '';
    
    let css = `.${modeClass} {\n`;

    // Apply CSS variables
    Object.entries(theme).forEach(([key, value]) => {
      if (value) {
        const cssVar = `--tenant-${key}`;
        css += `  ${cssVar}: ${value}${importantSuffix};\n`;
      }
    });

    // Add specific style rules
    if (theme['primary-color']) {
      css += `  --ion-color-primary: ${theme['primary-color']}${importantSuffix};\n`;
      css += `  --pulse-color: ${theme['primary-color']}${importantSuffix};\n`;
    }

    if (theme['background-color']) {
      css += `  --app-background: ${theme['background-color']}${importantSuffix};\n`;
    }

    if (theme['background-image']) {
      css += `}\n\n`;
      css += `.${modeClass} ion-content {\n`;
      css += `  background: ${theme['background-image']} no-repeat center center / cover${importantSuffix};\n`;
      css += `}\n\n`;
      css += `.${modeClass} .gradient-bckgr {\n`;
      css += `  --background: none${importantSuffix};\n`;
      css += `  background-image: ${theme['background-image']}${importantSuffix};\n`;
      css += `  background-size: 100% 100%${importantSuffix};\n`;
      css += `  transform: translateZ(0);\n`;
      css += `  -webkit-transform: translateZ(0);\n`;
      css += `  -webkit-backface-visibility: hidden;\n`;
      css += `  backface-visibility: hidden;\n`;
    } else {
      css += '}\n';
    }

    // Add button styles
    if (theme['primary-color']) {
      css += `\n.${modeClass} ion-button.button-solid {\n`;
      css += `  --background: ${theme['primary-color']}${importantSuffix};\n`;
      css += `  --color: #fff${importantSuffix};\n`;
      css += `  --border-radius: 30px${importantSuffix};\n`;
      css += '}\n';
    }

    return css;
  }

  /**
   * Remove theme for a specific tenant
   */
  removeTheme(tenantId: string): void {
    const styleId = `tenant-theme-${tenantId}`;
    const styleElement = this.appliedStyles.get(styleId);
    
    if (styleElement) {
      styleElement.remove();
      this.appliedStyles.delete(styleId);
    }

    // Remove mode class
    document.body.classList.remove(`${tenantId}-mode`);
  }

  /**
   * Get current theme for a tenant
   */
  getTheme(tenantId: string): ThemeConfig | null {
    return this.themeMapping[tenantId] || null;
  }

  /**
   * Check if theme exists for a tenant
   */
  hasTheme(tenantId: string): boolean {
    return !!this.themeMapping[tenantId];
  }

  /**
   * Clear all themes and styles
   */
  clearAll(): void {
    // Remove all applied styles
    this.appliedStyles.forEach(styleElement => styleElement.remove());
    this.appliedStyles.clear();

    // Remove all mode classes
    document.body.classList.forEach(cls => {
      if (cls.endsWith('-mode')) {
        document.body.classList.remove(cls);
      }
    });

    // Clear theme mapping
    this.themeMapping = {};
  }

  /**
   * Create a theme from tenant configuration
   */
  static createThemeFromConfig(config: TenantConfig): ThemeConfig {
    return {
      'primary-color': config.primaryColor,
      'background-color': config.backgroundColor,
      'background-image': config.backgroundImage,
      'active-step-color': config.activeStepColor,
      'active-step-shadow': config.activeStepShadow,
      'active-step-border': config.activeStepBorder,
      'previous-step-color': config.previousStepColor
    };
  }
}