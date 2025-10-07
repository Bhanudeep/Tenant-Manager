# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-10-07

### Added
- Initial release of @bhanudeepsimhadri/tenant-manager
- Core TenantManager class for multi-tenant configuration management
- ThemeManager utility for dynamic theming
- AssetManager utility for asset loading and preloading
- ConfigValidator utility for configuration validation
- Framework adapters for React, Angular, and Vue
- TypeScript support with full type definitions
- Session storage integration
- URL parameter parsing for tenant detection
- API integration for loading configurations from backend
- Sub-tenant support
- Event system for tenant change notifications
- Comprehensive documentation and examples

### Features
- Multi-tenant configuration management
- Dynamic theming with CSS variable injection
- Asset loading from blob storage and local paths
- Framework-agnostic core with specific adapters
- URL parameter parsing (direct and encoded)
- Session storage persistence
- Type-safe configuration validation
- Event-driven architecture
- Asset preloading with lazy loading support
- Favicon and title management
- Error handling and validation

### Framework Support
- Vanilla JavaScript/TypeScript
- React hooks and HOCs
- Angular services and initializers
- Vue 2 and Vue 3 composables and plugins