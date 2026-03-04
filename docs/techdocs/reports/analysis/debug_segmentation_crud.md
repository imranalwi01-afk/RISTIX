# Debugging CRUD Segmentation - Action Plan

## Masalah Utama
CRUD operations tidak berfungsi pada halaman segmentation collective

## Kemungkinan Penyebab & Solusi

### 1. Authentication Issues (Priority: HIGH)
**Symptom:** API returns 401 Unauthorized
**Root Cause:** Missing or invalid auth token

#### Debug Steps:
```bash
# Check browser console untuk auth token
# Buka browser dev tools -> Application -> Cookies/LocalStorage
# Verify auth_token exists dan valid

# Test API dengan manual token
curl -X GET "http://localhost:4232/api/v1/banking/parameters/segmentation" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

#### Solutions:
- Pastikan user sudah login dengan benar
- Check token expiry
- Verify token synchronization between cookie dan localStorage

### 2. API Connectivity Issues (Priority: HIGH)
**Symptom:** Network errors atau timeouts
**Root Cause:** Port mismatch atau service tidak running

#### Debug Steps:
```bash
# Verify backend running
curl http://localhost:4232/health

# Verify API routes registered
curl http://localhost:4232/api/v1/debug-routes/check

# Check specific segmentation endpoint
curl http://localhost:4232/api/v1/banking/parameters/segmentation
```

#### Solutions:
- Ensure backend running di port 4232
- Check frontend API configuration di api-setup.ts
- Verify base URL configuration

### 3. CORS Issues (Priority: MEDIUM)
**Symptom:** CORS errors di browser console
**Root Cause:** Backend tidak mengizinkan cross-origin requests

#### Debug Steps:
```bash
# Check browser console untuk CORS errors
# Network tab -> Headers -> Access-Control-Allow-Origin
```

#### Solutions:
- Configure CORS middleware di backend
- Add frontend origin ke allowed origins

### 4. Database Connection Issues (Priority: MEDIUM)
**Symptom:** 500 Internal Server Error
**Root Cause:** Backend tidak connect ke database

#### Debug Steps:
```bash
# Check backend logs untuk database errors
# Verify database connection string
# Test database health endpoint
```

#### Solutions:
- Check database configuration
- Verify tenant database exists
- Check database permissions

### 5. Frontend State Management Issues (Priority: LOW)
**Symptom:** UI tidak update setelah CRUD operations
**Root Cause:** State management atau component lifecycle issues

#### Debug Steps:
```javascript
// Check React DevTools untuk component state
// Verify loadHeaders() dipanggil setelah CRUD operations
// Check error handling di SegmentationClient.tsx
```

#### Solutions:
- Fix state management issues
- Improve error handling dan user feedback
- Add proper loading states

## Immediate Action Items

1. **Check Authentication Status**
   - Verify user login status
   - Check token validity
   - Test API with manual auth

2. **Verify API Connectivity**
   - Test backend health endpoint
   - Check service ports
   - Verify route registration

3. **Monitor Browser Console**
   - Look for JavaScript errors
   - Check network requests
   - Identify CORS issues

4. **Test CRUD Operations Sequentially**
   - Test READ operation dulu
   - Test CREATE operation
   - Test UPDATE operation
   - Test DELETE operation

## Code Fixes Needed

### Frontend Fixes:
1. Improve error handling di SegmentationClient.tsx
2. Add better logging untuk debugging
3. Fix token synchronization issues

### Backend Fixes:
1. Add better error messages untuk 401 errors
2. Improve CORS configuration
3. Add health checks untuk segmentation endpoints

## Testing Commands

```bash
# Start both services
cd packages/new-backend && npm run dev
cd packages/frontend && npm run dev

# Test endpoints
curl -X GET "http://localhost:4232/api/v1/banking/parameters/segmentation" \
  -H "Authorization: Bearer demo_token_PLATFORM_SUPER_ADMIN"

# Test with browser
# Navigate to: http://localhost:4231/banking/collective/segmentation?mode=conventional
# Open DevTools -> Network tab
# Monitor API calls
```
