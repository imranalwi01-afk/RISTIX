# Code Cleanup & Documentation TODO

> **Branch:** `cleanup/unused-code-documentation`  
> **Created:** 2026-01-11  
> **Purpose:** Identify unused code, improve documentation, and mark items for removal


testing

## 🎯 Objectives

1. **Identify Unused Code** - Find and document unused files, functions, and components
2. **Improve Documentation** - Add JSDoc comments and README files where needed
3. **Mark for Removal** - Tag deprecated code with `@deprecated` and `// TODO: Remove`
4. **Cleanup Plan** - Create a systematic plan for safe removal

---

## 📋 Areas to Review

### Frontend (`packages/frontend`)

#### Components
- [ ] Review `/src/components` for unused components
- [ ] Check for duplicate component implementations
- [ ] Document component props and usage
- [ ] Identify deprecated UI patterns

#### Pages
- [ ] Review `/src/app/banking` for unused pages
- [ ] Check for duplicate page implementations
- [ ] Document page purposes and routes
- [ ] Identify pages that can be consolidated

#### Services
- [ ] Review `/src/services` for unused API services
- [ ] Check for duplicate API calls
- [ ] Document API service methods
- [ ] Consolidate similar services

#### Utilities
- [ ] Review `/src/utils` for unused utility functions
- [ ] Document utility function purposes
- [ ] Remove duplicate utilities

### Backend (`packages/new-backend`)

#### Routes
- [ ] Review `/src/routes` for unused route files
- [ ] Check for duplicate route definitions
- [ ] Document route purposes and parameters
- [ ] Identify deprecated endpoints

#### Services
- [ ] Review `/src/services` for unused services
- [ ] Check for duplicate business logic
- [ ] Document service methods
- [ ] Consolidate similar services

#### Repositories
- [ ] Review `/src/repositories` for unused repositories
- [ ] Check for duplicate database queries
- [ ] Document repository methods
- [ ] Optimize database access patterns

#### Middleware
- [ ] Review `/src/middleware` for unused middleware
- [ ] Document middleware purposes
- [ ] Check middleware execution order

---

## 🔍 Cleanup Checklist

### Phase 1: Discovery (Current)
- [ ] Run dependency analysis
- [ ] Identify unused imports
- [ ] Find dead code paths
- [ ] List duplicate implementations
- [ ] Document findings in this file

### Phase 2: Documentation
- [ ] Add JSDoc comments to public APIs
- [ ] Create README files for major modules
- [ ] Document configuration files
- [ ] Add inline comments for complex logic

### Phase 3: Marking
- [ ] Add `@deprecated` tags to old code
- [ ] Add `// TODO: Remove after [date]` comments
- [ ] Create migration guides for deprecated features
- [ ] Update CHANGELOG with deprecation notices

### Phase 4: Safe Removal
- [ ] Remove code marked for >30 days
- [ ] Run full test suite
- [ ] Verify no runtime errors
- [ ] Update documentation
- [ ] Create PR for review

---

## 🛠️ Tools & Commands

### Find Unused Exports
```bash
# Frontend
cd packages/frontend
npx ts-prune

# Backend
cd packages/new-backend
npx ts-prune
```

### Find Unused Dependencies
```bash
npx depcheck
```

### Find Duplicate Code
```bash
npx jscpd packages/frontend/src
npx jscpd packages/new-backend/src
```

### Find TODO Comments
```bash
grep -r "TODO" packages/frontend/src
grep -r "TODO" packages/new-backend/src
```

---

## 📝 Findings Log

### Unused Files Identified
<!-- Add findings here as you discover them -->

### Duplicate Code Found
<!-- Add findings here -->

### Missing Documentation
<!-- Add findings here -->

### Deprecated Features
<!-- Add findings here -->

---

## ⚠️ Important Notes

1. **Never remove code without verification** - Always check if code is used at runtime
2. **Test before removing** - Run full test suite after marking code for removal
3. **Document reasons** - Always explain why code is being removed
4. **Keep backups** - Git history is our backup, but tag important commits
5. **Communicate changes** - Update team on major removals

---

## 🔗 Related Documents

- [CHANGELOG.md](./CHANGELOG.md) - Track all changes
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [README.md](./README.md) - Project overview

---

**Last Updated:** 2026-01-11  
**Status:** In Progress  
**Next Review:** TBD
