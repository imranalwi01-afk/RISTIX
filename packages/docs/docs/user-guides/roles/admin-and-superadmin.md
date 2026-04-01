---
title: Admin and Superadmin Guide
description: Responsibilities and limits for tenant admin and tenant superadmin roles.
sidebar_position: 3
---

# Admin and Superadmin Guide

## Purpose

This guide explains the difference between tenant admin and tenant superadmin in the IFRS 9 platform.

## Typical Roles

- `IAF_TENANT_ADMIN`
- `IAF_TENANT_SUPERADMIN`

## Tenant Admin Responsibilities

- manage operational administration inside the tenant
- review level 1 admin approval requests
- access audit, access management, and maintenance features as permitted

## Tenant Superadmin Responsibilities

- perform final admin approval
- handle technical or tenant-wide override scenarios where policy allows
- oversee sensitive role, permission, and user lifecycle changes

## What Superadmin Is Not

`IAF_TENANT_SUPERADMIN` is not the normal business approver for all banking setup changes unless the approval matrix explicitly allows it.

## Admin Approval Path

Typical entities:

- user create, update, delete
- user status updates
- role changes
- role permission updates
- role assignment changes

Typical routing:

- level 1: `IAF_TENANT_ADMIN`
- level 2: `IAF_TENANT_SUPERADMIN`

## Good Operational Practice

- use tenant admin for daily admin review
- use tenant superadmin only for final admin approval or exceptional governance cases
- keep business approval and technical override responsibilities separate whenever possible

## Related Guides

- [Approval Inbox Guide](../banking/approval/approval-inbox)
- [Audit and Request Trace Guide](../banking/audit/audit-and-request-trace)
- [IAF User Role Matrix](../banking/iaf-user-role-matrix)
