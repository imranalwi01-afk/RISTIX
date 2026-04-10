---
title: First Login and Navigation
description: How a new user signs in, validates access, and finds the correct workspace.
sidebar_position: 1
---

# First Login and Navigation

## Purpose

Use this guide to verify that a user can log in, land on the correct workspace, and access the menus that match their role.

## Who Should Use This

- newly provisioned users
- QA testers validating role-based access
- admins helping users verify environment access

## Prerequisites

- you have a valid demo or operational account
- you know the correct tenant slug for login
- your role has already been assigned in the tenant

## Login Checklist

1. Open the login page for the target environment.
2. Enter your email and password.
3. Enter the tenant value required by that environment.
4. Submit the login form.
5. Wait for the dashboard to load completely before testing menu access.

## Suggested Screenshots

![Banking dashboard after successful login](/img/user-guides/banking/dashboard.png)

Successful post-login landing page with the role-aware sidebar and dashboard widgets.

## Expected Result

After login:

- the main banking shell should load
- the sidebar should reflect the user role
- unauthorized modules should not appear
- authorized modules should open without redirecting back to dashboard

## Menu Validation

After login, validate these points:

- the sidebar group for your role is visible
- pages under that group can be opened
- approval users can open the approval page
- audit users can open the audit page
- report-only users can open report pages but should not see setup mutation actions

## If the User Cannot Access a Page

Check in this order:

1. confirm the user logged into the correct tenant
2. confirm the correct role is assigned and active
3. confirm the sidebar item is visible
4. confirm the page does not redirect back to dashboard
5. capture the exact error message or toast if access is denied

## Notes for Demo Accounts

Current demo account mappings for IAF are documented in [IAF User Role Matrix](../banking/iaf-user-role-matrix).

## Related Guides

- [Maker Guide](../roles/maker)
- [Checker and Approver Guide](../roles/checker-and-approver)
- [Admin and Superadmin Guide](../roles/admin-and-superadmin)

## QA Quick Checklist

- user can log in with the expected tenant
- user lands on the expected dashboard or workspace
- allowed menus are visible
- restricted menus are not visible
- authorized pages do not redirect back to dashboard
