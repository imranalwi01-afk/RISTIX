# 2026-07-12: Individual Impairment Watchlist Icons Unclickable

## Summary
The "View Details" and "Edit Assessment" icons in the Individual Impairment Watchlist table were visually disabled and could not be clicked by users.

## Root Cause
The `disabled` prop on the action buttons was incorrectly configured as `disabled={!account.account_id}`. When the API returns an `account_id` that is `0` or maps missing values to falsy numbers, the condition evaluates to `true`, mistakenly disabling the interactive elements. Furthermore, the URL param parsing in `page.client.tsx` strictly required `id > 0`, breaking the subsequent state lookup if the ID was `0`.

## Impact
Users were unable to click the "View Detail" or "Edit Assessment" icons for specific debtor accounts in the Individual Impairment watchlist, preventing them from accessing the detail pages or modifying impairment assessments.

## Fix
- Updated `AssessmentWatchlist.tsx` to use `disabled={account.account_id == null}` allowing `0` and explicitly catching missing `null`/`undefined` data.
- Updated the route change watcher in `page.client.tsx` to `id >= 0` instead of `id > 0` so Next.js accurately syncs the page state for all valid numeric IDs including `0`.

## Prevention
Always use strict equality checks (`== null` or `=== undefined`) for identifier fields that could legitimately be `0`, rather than relying on JavaScript truthiness evaluations (`!id`) which unintentionally swallow the number zero.
