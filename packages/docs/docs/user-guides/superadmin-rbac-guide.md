---
title: SuperAdmin RBAC Guide
description: How to manage Users, Roles, and Permissions in the IFRS9 Platform
sidebar_position: 1
---

# SuperAdmin RBAC Guide

This guide covers the complete workflow for SuperAdmins to set up and manage access control in the IFRS9 Platform.

## System Overview

```mermaid
flowchart TB
    subgraph AUTH["🔐 Authentication"]
        Login["SuperAdmin Login"]
        Session["Session Created"]
        Login --> Session
    end

    subgraph ROLES["👤 Role Management"]
        CreateRole["1️⃣ Create Role"]
        RoleType["Choose Role Type"]
        RoleLevel["Choose Level"]
        RoleActive["Set Active"]

        CreateRole --> RoleType
        RoleType --> RoleLevel
        RoleLevel --> RoleActive
    end

    subgraph PERMS["🔑 Permission Assignment"]
        SelectRole["2️⃣ Select Role"]
        ViewMatrix["View Permission Matrix"]
        TogglePerms["Toggle Permissions"]
        GroupByResource["Group by Resource"]
        GroupByAction["Group by Action"]
        SavePerms["💾 Save Permissions"]

        SelectRole --> ViewMatrix
        ViewMatrix --> GroupByResource
        ViewMatrix --> GroupByAction
        GroupByResource --> TogglePerms
        GroupByAction --> TogglePerms
        TogglePerms --> SavePerms
    end

    subgraph USERS["👥 User Management"]
        CreateUser["3️⃣ Create User"]
        UserDetails["Set User Details"]
        AssignRoles["4️⃣ Assign Roles to User"]
        SetStatus["Activate / Deactivate"]

        CreateUser --> UserDetails
        UserDetails --> AssignRoles
        AssignRoles --> SetStatus
    end

    subgraph RESULT["🎯 Result"]
        UserLogin["User Logs In"]
        EvalPerms["Permissions Evaluated"]
        MenuAccess["Menu Access Determined"]
        DataAccess["Data Access Gated"]

        UserLogin --> EvalPerms
        EvalPerms --> MenuAccess
        EvalPerms --> DataAccess
    end

    Session --> ROLES
    ROLES --> PERMS
    PERMS --> USERS
    USERS --> RESULT

    style AUTH fill:#1a1a2e,stroke:#e94560,color:#fff
    style ROLES fill:#16213e,stroke:#0f3460,color:#fff
    style PERMS fill:#0f3460,stroke:#533483,color:#fff
    style USERS fill:#533483,stroke:#e94560,color:#fff
    style RESULT fill:#1a1a2e,stroke:#4ade80,color:#fff
```

---

## Step-by-Step Workflows

### 1️⃣ Creating a Role

```mermaid
flowchart LR
    A["Navigate to\nAccess Management"] --> B["Click\n+ Create Role"]
    B --> C["Fill Role Details"]
    C --> D["Choose Type"]
    D --> E["Choose Level"]
    E --> F["Save Role"]

    D -.-> D1["SYSTEM\nPlatform-wide"]
    D -.-> D2["BANKING\nBanking module"]
    D -.-> D3["CUSTOM\nTenant-specific"]

    E -.-> E1["PLATFORM\nAll tenants"]
    E -.-> E2["TENANT\nSingle tenant"]
    E -.-> E3["DEPARTMENT\nWithin tenant"]

    style A fill:#1e293b,stroke:#3b82f6,color:#fff
    style B fill:#1e293b,stroke:#3b82f6,color:#fff
    style C fill:#1e293b,stroke:#3b82f6,color:#fff
    style D fill:#1e293b,stroke:#a855f7,color:#fff
    style E fill:#1e293b,stroke:#a855f7,color:#fff
    style F fill:#1e293b,stroke:#22c55e,color:#fff
```

**Role Types:**

| Type | Description | Example |
|------|-------------|---------|
| `SYSTEM` | Platform-wide, cannot be deleted | SuperAdmin, Platform Admin |
| `BANKING` | Banking module roles | Risk Analyst, Credit Officer |
| `CUSTOM` | Tenant-specific custom roles | Regional Manager, Auditor |

**Role Levels:**

| Level | Scope | Visibility |
|-------|-------|------------|
| `PLATFORM` | All tenants | Platform admin only |
| `TENANT` | Single tenant | Tenant admin |
| `DEPARTMENT` | Within tenant | Department head |

---

### 2️⃣ Assigning Permissions to a Role

```mermaid
flowchart TB
    subgraph DIALOG["Permission Assignment Dialog"]
        direction TB
        A["Select Role\nfrom Access Management table"]
        B["Permission Matrix Opens"]

        subgraph VIEW["View Mode Toggle"]
            V1["📋 By Resource\n(group: banking.parameter, admin.roles, etc.)"]
            V2["⚡ By Action\n(group: view, create, update, delete)"]
        end

        subgraph ACTIONS["Available Actions"]
            ACT1["✅ view"]
            ACT2["➕ create"]
            ACT3["✏️ update"]
            ACT4["🗑️ delete"]
            ACT5["⚙️ manage"]
        end

        subgraph EXAMPLE["Example: Role = 'Risk Analyst'"]
            EX1["banking.parameter.*.view ✅"]
            EX2["banking.collective.*.view ✅"]
            EX3["banking.collective.*.create ✅"]
            EX4["banking.collective.*.update ✅"]
            EX5["admin.roles.* ❌"]
            EX6["admin.users.* ❌"]
        end

        C["💾 Save Permissions"]
        D["🔒 Permission Propagation\n(SuperAdmin → Tenant → User)"]

        A --> B
        B --> VIEW
        VIEW --> ACTIONS
        ACTIONS --> EXAMPLE
        EXAMPLE --> C
        C --> D
    end

    style DIALOG fill:#0f172a,stroke:#3b82f6,color:#fff
    style A fill:#1e3a5f,stroke:#60a5fa,color:#fff
    style C fill:#166534,stroke:#4ade80,color:#fff
    style D fill:#7f1d1d,stroke:#f87171,color:#fff
```

**Permission Format:** `<module>.<resource>.<scope>.<action>`

**Examples:**

| Permission | Meaning |
|------------|---------|
| `banking.parameter.product.view` | Can view product parameters |
| `banking.collective.rule_base.create` | Can create rule base configs |
| `admin.roles.manage` | Full role management access |
| `admin.users.*` | All user management actions |
| `banking.dashboard.view` | Can view banking dashboard |

---

### 3️⃣ Creating a User

```mermaid
flowchart LR
    A["Navigate to\nUser Management"] --> B["Click\n+ Create User"]
    B --> C["Enter Email"]
    C --> D["Set Username"]
    D --> E["Set Password\n(or send invite)"]
    E --> F["Select Tenant"]
    F --> G["Assign Initial Role"]
    G --> H["Activate User"]

    style A fill:#1e293b,stroke:#3b82f6,color:#fff
    style B fill:#1e293b,stroke:#3b82f6,color:#fff
    style C fill:#1e293b,stroke:#a855f7,color:#fff
    style D fill:#1e293b,stroke:#a855f7,color:#fff
    style E fill:#1e293b,stroke:#a855f7,color:#fff
    style F fill:#1e293b,stroke:#f59e0b,color:#fff
    style G fill:#1e293b,stroke:#f59e0b,color:#fff
    style H fill:#1e293b,stroke:#22c55e,color:#fff
```

---

### 4️⃣ Assigning Users to Roles

```mermaid
flowchart TB
    subgraph FLOW["User ↔ Role Assignment"]
        direction TB
        A["Open User Detail\nfrom User Management"]
        B["Click Edit Roles"]
        C["Select Roles\nto Assign"]

        subgraph ROLES["Available Roles"]
            R1["📊 Risk Analyst\n(banking.collective.*, banking.individual.*)"]
            R2["💼 Credit Officer\n(banking.individual.assessment.*)"]
            R3["📈 Report Viewer\n(banking.reports.*.view)"]
            R4["🔧 System Admin\n(admin.*)"]
        end

        D["Multi-Role Assignment\n(user can have multiple roles)"]
        E["💾 Save Assignment"]
        F["✅ Permissions Merged\nfrom all assigned roles"]

        A --> B
        B --> C
        C --> ROLES
        ROLES --> D
        D --> E
        E --> F
    end

    style FLOW fill:#0f172a,stroke:#8b5cf6,color:#fff
    style A fill:#1e3a5f,stroke:#60a5fa,color:#fff
    style E fill:#166534,stroke:#4ade80,color:#fff
    style F fill:#166534,stroke:#4ade80,color:#fff
```

---

## Complete RBAC Lifecycle

```mermaid
sequenceDiagram
    actor SA as 🦸 SuperAdmin
    participant UI as 🖥️ Admin Panel
    participant API as 🔌 Backend API
    participant DB as 🗄️ Database
    participant User as 👤 Regular User

    Note over SA,User: Phase 1: Setup Roles & Permissions

    SA->>UI: Navigate to Access Management
    UI->>API: GET /api/v1/rbac/roles
    API->>DB: SELECT roles WHERE tenant_id = ?
    DB-->>API: roles[]
    API-->>UI: roles list
    UI-->>SA: Display roles table

    SA->>UI: Click "Create Role"
    SA->>UI: Fill: name, type, level
    UI->>API: POST /api/v1/rbac/roles
    API->>DB: INSERT INTO roles
    DB-->>API: role created
    API-->>UI: role object
    UI-->>SA: ✅ Role created

    SA->>UI: Open Permission Matrix for role
    UI->>API: GET /api/v1/rbac/permissions
    API->>DB: SELECT all permissions
    DB-->>API: permissions[]
    API-->>UI: permission matrix
    UI-->>SA: Display matrix (grouped by resource/action)

    SA->>UI: Toggle permissions ON/OFF
    UI->>API: PUT /api/v1/rbac/roles/:id/permissions
    API->>DB: UPDATE role_permissions
    DB-->>API: updated
    API-->>UI: success
    UI-->>SA: ✅ Permissions saved

    Note over SA,User: Phase 2: Create & Assign Users

    SA->>UI: Navigate to User Management
    SA->>UI: Click "Create User"
    SA->>UI: Fill: email, username, tenant
    UI->>API: POST /api/v1/users
    API->>DB: INSERT INTO users
    DB-->>API: user created
    API-->>UI: user object
    UI-->>SA: ✅ User created

    SA->>UI: Open User Detail → Assign Roles
    SA->>UI: Select roles to assign
    UI->>API: PUT /api/v1/users/:id/roles
    API->>DB: INSERT INTO user_roles
    DB-->>API: assigned
    API-->>UI: success
    UI-->>SA: ✅ Roles assigned

    Note over SA,User: Phase 3: User Login & Access

    User->>UI: Login (email + password)
    UI->>API: POST /api/v1/auth/login
    API->>DB: SELECT user + roles + permissions
    DB-->>API: user data + merged permissions
    API-->>UI: session + permissions
    UI-->>User: ✅ Dashboard loaded

    User->>UI: Navigate to /banking/collective/rule-base
    UI->>UI: Check: banking.collective.rule_base.view?
    alt Permission Granted
        UI-->>User: ✅ Page content visible
    else Permission Denied
        UI-->>User: 🚫 Access Denied message
    end
```

---

## Permission Evaluation Flow

```mermaid
flowchart TB
    subgraph EVAL["Permission Evaluation"]
        A["User Requests Page\n/banking/collective/rule-base"] --> B{"User Authenticated?"}
        B -->|No| C["Redirect to /login"]
        B -->|Yes| D["Load User Roles"]

        D --> E["Merge Permissions\nfrom All Roles"]
        E --> F{"Has Required\nPermission?"}

        F -->|Yes| G["✅ Render Page"]
        F -->|No| H{"Has Parent\nPermission?"}

        H -->|Yes: admin.*| G
        H -->|No| I["🚫 Show\nAccess Denied"]

        I --> J["Show Required Permission\nand Suggest Admin Contact"]
    end

    subgraph CACHE["Permission Cache"]
        K["First Login:\nFetch all permissions"]
        L["Cache in memory\n(session duration)"]
        M["Invalidate on:\nrole change, logout"]
        K --> L --> M
    end

    style EVAL fill:#0f172a,stroke:#3b82f6,color:#fff
    style A fill:#1e3a5f,stroke:#60a5fa,color:#fff
    style G fill:#166534,stroke:#4ade80,color:#fff
    style I fill:#7f1d1d,stroke:#f87171,color:#fff
    style C fill:#78350f,stroke:#fbbf24,color:#fff
```

---

## Common Scenarios

### Scenario 1: New Bank Onboarding

```mermaid
flowchart LR
    A["1. Create Tenant\n(Bank XYZ)"] --> B["2. Create Banking Roles\n(Credit Officer, Risk Analyst, Viewer)"]
    B --> C["3. Assign Permissions\nto Each Role"]
    C --> D["4. Create Users\n(bulk import or manual)"]
    D --> E["5. Assign Users\nto Roles"]
    E --> F["6. Test Login\n& Verify Access"]
```

### Scenario 2: Add New Module Access

```mermaid
flowchart LR
    A["1. Identify New\nModule Permissions"] --> B["2. Update Existing Roles\nwith New Permissions"]
    B --> C["3. Or Create\nNew Module-Specific Role"]
    C --> D["4. Assign Role\nto Affected Users"]
    D --> E["5. Users See New\nMenu Items Immediately"]
```

### Scenario 3: User Role Change

```mermaid
flowchart LR
    A["1. Open User\nManagement"] --> B["2. Find User\n(Search/Filter)"]
    B --> C["3. Edit Roles\n(Add/Remove)"]
    C --> D["4. Save Changes"]
    D --> E["5. User Must\nRe-login"]
    E --> F["6. New Permissions\nActive"]
```

---

## Access Management Screens

| Screen | Path | Description |
|--------|------|-------------|
| Access Management | `/banking/maintenance/access-management` | Main RBAC dashboard with tabs |
| Roles Tab | `/banking/maintenance/access-management/roles` | Role CRUD + permission matrix |
| Role Detail | `/banking/maintenance/access-management/roles/[roleId]` | Single role detail + permission editor |
| Users Tab | `/banking/maintenance/access-management` (Users tab) | User list with role assignment |
| Review Tab | `/banking/maintenance/access-management` (Review tab) | Access review + audit |
| Platform RBAC | `/platform/rbac` | Platform-level RBAC (all tenants) |

---

## Best Practices

1. **Principle of Least Privilege** — Grant minimum permissions needed
2. **Role Naming** — Use clear, descriptive names: `Risk Analyst`, `Credit Officer`, `Report Viewer`
3. **Avoid Custom Per-User Roles** — Assign users to shared roles instead
4. **Regular Access Reviews** — Use the Review tab to audit permissions quarterly
5. **Hierarchy Awareness** — `PLATFORM` level roles override `TENANT` level
6. **Multi-Role Users** — Users with multiple roles get merged (union) permissions
7. **System Roles** — Never delete `SYSTEM` type roles (SuperAdmin, Platform Admin)
8. **Testing** — After changes, login as a test user to verify access is correct
