# IAF R Analytics Service
## Indonesia Airawata Finance - IFRS 9 Risk Analytics

### Company Information
- **Company**: Indonesia Airawata Finance (IAF)
- **Banking Type**: Conventional Banking
- **Server**: 10.18.11.35
- **Port**: 4236
- **Database**: RDS PostgreSQL (pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com)

### Quick Start

1. **Start IAF R Analytics Service:**
   ```bash
   ./start-iaf-service.sh start
   ```

2. **Check Service Status:**
   ```bash
   ./start-iaf-service.sh status
   ```

3. **View Service Logs:**
   ```bash
   ./start-iaf-service.sh logs
   ```

4. **Stop Service:**
   ```bash
   ./start-iaf-service.sh stop
   ```

### Access Information
- **Internal Access**: http://10.18.11.35:4236
- **Service Status**: Use `./start-iaf-service.sh status`
- **Log File**: `logs/r_iaf.log`
- **PID File**: `pids/r_iaf.pid`

### Configuration Files
- **Environment**: `.env.iaf`
- **R Startup**: `shiny-app/start_iaf.R`
- **Global Functions**: `shiny-app/enhanced-global.R`
- **Main App**: `shiny-app/app.R`

### Database Configuration
```r
# RDS Database
DB_HOST = "pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com"
DB_USER = "admin_iaf"
DB_SSL = true

# IAF Databases
- ifrspro_platform_admin
- ifrspro_shared_services
- ifrspro_tenant_iaf
- FRS9PRO
```

### IAF Specific Features
- Conventional Banking Products
- IFRS 9 ECL Calculations
- Risk Analytics Dashboard
- Portfolio Management
- Statistical Modeling

### Deployment
1. Copy `ifrs9-iaf` folder to IAF server (10.18.11.35)
2. Use `.env.iaf` configuration files
3. Run `./start-iaf-service.sh start`
4. Access via http://10.18.11.35:4236

### Support
For technical support, contact the IFRS Pro development team.

---
**Indonesia Airawata Finance - IFRS 9 Platform**