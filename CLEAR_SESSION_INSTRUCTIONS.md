# Clear Session and Test Token Refresh

## The Problem
Your current session was created BEFORE the token refresh fixes were applied. The refresh token is not in cookies because the old code didn't save it there.

## Solution: Clear Everything and Login Fresh

### Step 1: Clear Browser Storage
1. Open DevTools (F12)
2. Go to **Application** tab
3. Under **Storage** on the left, click **Clear site data**
4. OR manually clear:
   - **Cookies** → Delete all for your domain
   - **Local Storage** → Clear all items
   - **Session Storage** → Clear all items

### Step 2: Hard Refresh
- Press `Ctrl + Shift + R` (Windows/Linux)
- Or `Cmd + Shift + R` (Mac)

### Step 3: Login Fresh
1. Navigate to `/login`
2. Enter credentials and login
3. **Check DevTools → Application → Cookies**
   - You should see: `auth_token` ✅
   - You should see: `refresh_token` ✅ (this was missing before)
   - You should see: `auth_user` ✅

### Step 4: Verify Token Refresh Works
1. Open DevTools Console
2. Watch for these logs:
   ```
   ✅ Tokens synced to cookies for API requests
   🔐 Refresh token synced to cookie
   ```

### Step 5: Test Navigation
1. Navigate to different pages (/banking/dashboard, /banking/setup/application, etc.)
2. API calls should work without 401 errors
3. If token expires (1 hour), refresh should happen automatically
4. Check console for: `Token refresh successful`

### Step 6: Verify Refresh Token in Cookies
After login, run this in Console:
```javascript
document.cookie.split('; ').filter(c => c.includes('token'))
```

You should see both:
- `auth_token=eyJ...`
- `refresh_token=eyJ...`

## What Changed
1. ✅ JWT expiry: 15m → 1h
2. ✅ Refresh token: Now saved to cookies (was only in localStorage)
3. ✅ Token refresh: Updates cookies when new token is issued
4. ✅ API interceptor: Reads token from cookies first, then localStorage
5. ✅ Session control: Syncs tokens to cookies after refresh

## If Still Getting 401s
1. Check console logs - does it say "No refresh token available"?
   - If yes → You didn't clear storage completely, go back to Step 1
   
2. Check Network tab - is Authorization header present?
   - Click on failed request
   - Look at Request Headers
   - Should have: `Authorization: Bearer eyJ...`
   
3. Check if token is expired
   - Copy token from cookies
   - Go to https://jwt.io
   - Paste token
   - Check `exp` field - should be ~1 hour from now

## Backend Status
- ✅ Backend restarted with JWT_EXPIRES_IN=1h
- ✅ Backend returns both accessToken and refreshToken
- ✅ Refresh endpoint working at `/api/v1/auth/refresh`
