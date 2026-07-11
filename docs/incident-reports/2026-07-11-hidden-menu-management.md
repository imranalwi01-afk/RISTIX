# 2026-07-11: Hidden Menus Missing From Platform Control Center

## Summary
Menus that were set to hidden (is_visible = false) completely disappeared from the Platform Menu Management interface.

## Root Cause
The backend API (`/menu/flat`) strictly filtered out any menu items where `isVisible === false` at the database query level, meaning the frontend admin page never received the data to display them.

## Impact
System administrators could not see or manage (e.g. unhide) menus that had been hidden, making them permanently inaccessible from the UI.

## Fix
Updated the `/menu/flat` API to accept an `includeInactive=true` query parameter, which bypasses the visibility and active status filters, allowing the Platform Control Center to load all menus. The frontend was also updated to send this parameter.

## Prevention
When building administrative endpoints, ensure that data filters (like visibility or active status) can be optionally bypassed so that admins have a full view of the system state.
