# Database Architecture Configuration

## Overview

The IFRS9 platform uses a multi-database architecture to separate concerns:

1. **Platform Admin DB** (`ifrspro_platform_admin`) - Platform-wide administration
2. **Shared Services DB** (`ifrspro_shared_services`) - Shared services across tenants
3. **Tenant DB** (`ifrspro_tenant_iaf`) - Tenant-specific data for IAF
4. **Legacy DB** (`FRS9PRO`) - Legacy FRS9 system data

## Environment Variables

All docker-compose files now support the following environment variables:

### Database Configuration (Generic)

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
```

### Platform Database

```bash
PLATFORM_DB_HOST=localhost
PLATFORM_DB_PORT=5432
PLATFORM_DB_USER=postgres
PLATFORM_DB_PASSWORD=postgres
PLATFORM_DB_NAME=ifrspro_platform_admin
PLATFORM_DB_SSL=false
```

### Shared Services Database

```bash
SHARED_DB_HOST=localhost
SHARED_DB_PORT=5432
SHARED_DB_USER=postgres
SHARED_DB_PASSWORD=postgres
SHARED_DB_NAME=ifrspro_shared_services
SHARED_DB_SSL=false
```

### Tenant Database

```bash
TENANT_DB_HOST=localhost
TENANT_DB_PORT=5432
TENANT_DB_USER=postgres
TENANT_DB_PASSWORD=postgres
TENANT_DB_NAME=ifrspro_tenant_iaf
TENANT_DB_SSL=false
```

### Legacy Database

```bash
LEGACY_DB_HOST=192.168.0.106
LEGACY_DB_PORT=5432
LEGACY_DB_USER=postgres
LEGACY_DB_PASSWORD=postgres
LEGACY_DB_NAME=FRS9PRO
LEGACY_DB_SSL=false
```

### Tenant Configuration

```bash
TENANT_ID=iaf
TENANT_NAME=Indonesia Airawata Finance
TENANT_SLUG=iaf
COMPANY_NAME=Indonesia Airawata Finance
BANKING_TYPE=conventional
SINGLE_TENANT_MODE=true
```

## Backward Compatibility

For backward compatibility, the following URLs are automatically constructed:

- `DATABASE_URL` - Points to Platform DB
- `LEGACY_DATABASE_URL` - Points to Legacy DB

## Environment-Specific Configuration

### Local Development (`ops/local/.env`)

- All databases point to `localhost` or Docker container names
- Legacy DB points to external server (192.168.0.106:5432)

### Dev Server (`ops/dev/.env`)

- Update database hosts to point to your dev server
- Example: `PLATFORM_DB_HOST=dev-db.ifrspro.id`

### Production (`ops/prod/.env`)

- Update database hosts to point to your production RDS/database servers
- Example: `PLATFORM_DB_HOST=pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com`
- Enable SSL: `PLATFORM_DB_SSL=true`

## Next Steps

1. **Update `.env` files** in each ops directory (`ops/local/.env`, `ops/dev/.env`, `ops/prod/.env`)
2. **Backend Code**: Ensure your backend code reads these environment variables
3. **Frontend Code**: Add any necessary tenant/database configuration to frontend if needed
4. **Database Initialization**: Create init scripts for each database if they don't exist

## Testing

Test the configuration:

```bash
# Local
make dev
make logs-backend

# Dev Server
make dev-server
docker-compose -f ops/dev/docker-compose.yml logs -f new-backend

# Production
make prod
docker-compose -f ops/prod/docker-compose.yml logs -f new-backend
```
