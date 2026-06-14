# JotMinds Manifest Debug Guide

## Changes Made
Successfully implemented branding changes to show "JotMinds" in browser permission prompts instead of the Figma domain.

### Files Created/Modified:

1. **`/public/manifest.json`** - NEW FILE
   - Sets app name to "JotMinds"
   - Includes tagline: "Discover How You Think - Thinking Styles Assessment Platform for Ghana's Education System"
   - Theme color: #2C2E83 (Deep Indigo)
   - Background color: #ffffff
   - Categories: education, productivity

2. **`/App.tsx`** - MODIFIED
   - Added useEffect to set document.title = 'JotMinds - Discover How You Think'
   - Runs on component mount

## How It Works

### Document Title
- The document title is set in `App.tsx` in a useEffect hook that runs once on mount
- This controls what appears in the browser tab and in many permission dialogs

### PWA Manifest
- The manifest.json file provides metadata for Progressive Web Apps
- Most modern browsers use this for:
  - Permission prompt names
  - Add to home screen functionality
  - App name in OS-level interfaces
  - Theme colors for mobile browsers

## Testing the Changes

### To verify the document title:
1. Open the app in a browser
2. Check the browser tab - it should say "JotMinds - Discover How You Think"
3. Open browser DevTools Console and run: `console.log(document.title)`

### To verify the manifest:
1. Open browser DevTools
2. Go to Application tab (Chrome/Edge) or Storage tab (Firefox)
3. Look for "Manifest" section
4. Verify name: "JotMinds"
5. Verify theme_color: "#2C2E83"

### To test permission prompts:
1. Try using features that require permissions:
   - Share functionality (Share API)
   - Download/Export reports (File System API)
   - Clipboard access (Clipboard API)
2. The permission dialog should show "JotMinds wants to..."

## Limitations in Figma Make Environment

**IMPORTANT:** The Figma Make environment uses an iframe, which has limitations:

1. **Iframe Domain Override:**
   - When embedded in an iframe, some permission prompts may still show the parent frame's domain
   - This is a browser security feature that cannot be overridden

2. **Manifest Loading:**
   - The manifest.json needs to be referenced in the HTML `<head>` tag
   - In Figma Make, this may require special handling since we don't control the index.html

3. **Workaround:**
   - The document.title change WILL work immediately
   - The manifest changes may only work when the app is:
     - Deployed to a custom domain
     - Installed as a PWA
     - Accessed outside the Figma iframe

## Next Steps for Full Implementation

If you're deploying this app outside Figma Make:

1. **Add manifest link to HTML:**
   ```html
   <link rel="manifest" href="/public/manifest.json">
   ```

2. **Add meta tags:**
   ```html
   <meta name="application-name" content="JotMinds">
   <meta name="apple-mobile-web-app-title" content="JotMinds">
   <meta name="theme-color" content="#2C2E83">
   ```

3. **Add app icons:**
   - Create `/public/icon-192.png` (192x192px)
   - Create `/public/icon-512.png` (512x512px)
   - Use your JotMinds branding/logo

## Current Debug Panel

The app has a built-in Debug Panel (bottom right) that shows:
- localStorage admin_token status
- localStorage admin_user status
- API authToken status
- Auto-refreshes every second

This is useful for debugging authentication issues but is separate from the manifest/title changes.

## Console Logging

The app has extensive console logging for auth flow:
- `[App] ===== MOUNT - Setting up auth =====`
- `[App] Checking localStorage...`
- `[App] admin_token: ...`
- `[App] Supabase session: ...`

Check browser console (F12) for detailed auth flow information.
