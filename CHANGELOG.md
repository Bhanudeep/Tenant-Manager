# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2024-10-07

### Added
- **Cross-Framework Architecture**: Complete rewrite as framework-agnostic package
- **Core Framework**: Framework-agnostic tenant configuration management with `TenantConfigCore`
- **Multi-framework Support**: Angular, React, and Vue 3 adapters with native integration patterns
- **Dynamic Theming**: Automatic CSS injection and mode class application to document body
- **Asset Management**: Hierarchical tenant and sub-tenant asset organization
- **Configuration Caching**: Session storage with configurable timeout and automatic invalidation
- **API Integration**: RESTful API support with intelligent fallback to local asset mapping
- **Sub-tenant Support**: Hierarchical tenant structures with override capabilities
- **TypeScript Support**: Full TypeScript definitions and comprehensive type safety

### Core Features
- `TenantConfigCore` class for framework-agnostic functionality
- HTTP client abstraction for different framework implementations  
- Observable-based state management using RxJS for real-time updates
- Automatic cache management with session storage and TTL
- Dynamic CSS loading and theme application with error handling
- Configurable initialization options with environment-specific settings
- Legal document fetching and URL generation with cache busting

### Framework Adapters
- **Angular**: Service with `APP_INITIALIZER` integration and HTTP interceptor support
- **React**: Context provider with hooks-based API and HOC patterns
- **Vue**: Plugin with both Composition API and Options API support

### API Features
- Tenant configuration fetching from promotional partner APIs
- Legal document retrieval with automatic URL generation
- Cache-control headers for fresh data retrieval
- Error handling with graceful fallback to local configurations
- Asset URL generation with timestamp-based cache busting

### Documentation
- Complete README with framework-specific integration guides
- Detailed examples for Angular, React, and Vue implementations
- Advanced usage patterns and best practices
- TypeScript interface documentation and API reference
- Asset organization guidelines and theming instructions

### Build System  
- Core-only TypeScript compilation for framework independence
- Framework adapter distribution for peer dependency compatibility
- Proper package.json configuration with optional peer dependencies
- ESNext module format with declaration maps