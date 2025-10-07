# Publishing Guide

## Before Publishing

1. **Update Version**: Update the version in `package.json` following [Semantic Versioning](https://semver.org/)
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. **Update Changelog**: Add your changes to `CHANGELOG.md`

3. **Run Tests**: Ensure all tests pass
   ```bash
   npm run test
   npm run typecheck
   ```

4. **Build Package**: Build the distribution files
   ```bash
   npm run build
   ```

## Publishing to NPM

### First Time Setup
1. Create an NPM account if you don't have one
2. Login to NPM:
   ```bash
   npm login
   ```

### Publishing
1. **Dry Run**: Test the publishing process
   ```bash
   npm publish --dry-run
   ```

2. **Publish**: Publish to NPM registry
   ```bash
   npm publish
   ```

### Publishing Scoped Packages
If using a scoped package name (like `@bhanudeep/tenant-manager`):
```bash
npm publish --access public
```

## Post-Publishing

1. **Tag the Release**: Create a git tag for the release
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Create GitHub Release**: Create a release on GitHub with release notes

3. **Update Documentation**: Update any external documentation that references the package

## Beta/Alpha Releases

For pre-release versions:
```bash
# Beta release
npm version 1.1.0-beta.0
npm publish --tag beta

# Alpha release
npm version 1.1.0-alpha.0
npm publish --tag alpha
```

Users can install these with:
```bash
npm install @bhanudeep/tenant-manager@beta
npm install @bhanudeep/tenant-manager@alpha
```

## Unpublishing

If you need to unpublish (use sparingly):
```bash
npm unpublish @bhanudeep/tenant-manager@1.0.0  # Specific version
npm unpublish @bhanudeep/tenant-manager --force  # Entire package (within 24 hours)
```