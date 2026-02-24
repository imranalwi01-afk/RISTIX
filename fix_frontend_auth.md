# Fix Frontend Authentication for Segmentation CRUD

## Root Cause Identified
Frontend tidak mengirim auth token yang valid ke backend, sedangkan backend memerlukan autentikasi.

## Immediate Solutions

### Solution 1: Implement Demo Token for Development
Tambahkan demo token handling di frontend untuk development.

### Solution 2: Fix Token Management
Perbaiki token synchronization antara cookie dan localStorage.

## Implementation Steps

### Step 1: Update API Setup untuk Demo Token
Edit `packages/frontend/src/services/api-setup.ts`:

```typescript
// Tambahkan di request interceptor
if (process.env.NODE_ENV === 'development' && !token) {
    // Use demo token for development
    const demoToken = 'demo_token_PLATFORM_SUPER_ADMIN';
    config.headers.Authorization = `Bearer ${demoToken}`;
    console.log('🎭 Using demo token for development');
}
```

### Step 2: Update Auth Token Utils
Edit `packages/frontend/src/utils/auth-token.ts`:

```typescript
export const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    try {
        // Development demo token fallback
        if (process.env.NODE_ENV === 'development') {
            const demoToken = 'demo_token_PLATFORM_SUPER_ADMIN';
            const useDemo = localStorage.getItem('use_demo_token');
            if (useDemo === 'true') return demoToken;
        }

        // Existing logic...
        const cookieToken = Cookies.get('auth_token');
        if (cookieToken) return cookieToken;
        // ... rest of existing logic
    } catch (error) {
        console.warn('⚠️ Error retrieving auth token:', error);
        return null;
    }
};
```

### Step 3: Add Development Mode Toggle
Tambahkan toggle untuk demo mode di browser console:

```javascript
// Enable demo mode
localStorage.setItem('use_demo_token', 'true');
location.reload();

// Disable demo mode  
localStorage.removeItem('use_demo_token');
location.reload();
```

## Testing Commands

```bash
# Enable demo mode di browser console
localStorage.setItem('use_demo_token', 'true');
location.reload();

# Test CRUD operations
# 1. Navigate to: http://localhost:4231/banking/collective/segmentation?mode=conventional
# 2. Open DevTools -> Network tab
# 3. Try Create, Read, Update, Delete operations
# 4. Monitor API calls dan responses
```

## Alternative: Bypass Auth for Development
Jika demo token tidak works, bypass auth middleware sementara:

Edit `packages/new-backend/src/middleware/auth.ts`:

```typescript
// Temporary development bypass
if (process.env.NODE_ENV === 'development' && c.req.path.includes('/segmentation')) {
    console.log('🔓 Development mode: Bypassing auth for segmentation');
    c.set('userId', '550e8400-e29b-41d4-a716-446655440001');
    c.set('tenantId', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be');
    await next();
    return;
}
```

## Verification Steps

1. **Enable Demo Mode**
   ```javascript
   localStorage.setItem('use_demo_token', 'true');
   location.reload();
   ```

2. **Test READ Operation**
   - Load halaman segmentation
   - Check Network tab untuk GET request
   - Verify 200 response dengan data

3. **Test CREATE Operation**  
   - Click "Add" button
   - Fill form dan submit
   - Verify 202/201 response

4. **Test UPDATE Operation**
   - Click "Edit" pada existing record
   - Modify data dan submit
   - Verify 200 response

5. **Test DELETE Operation**
   - Click "Delete" pada record
   - Confirm deletion
   - Verify 200 response

## Expected Results

- ✅ GET requests return 200 dengan data segmentation
- ✅ POST requests return 201/202 dengan approval workflow
- ✅ PUT requests return 200 dengan updated data  
- ✅ DELETE requests return 200 dengan success message
- ✅ UI updates properly setelah CRUD operations
- ✅ Error handling works dengan user feedback

## Long-term Solution

1. Implement proper authentication flow
2. Fix token synchronization issues
3. Add proper error handling
4. Improve user feedback untuk auth errors
