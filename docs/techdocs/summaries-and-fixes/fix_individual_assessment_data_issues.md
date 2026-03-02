# Fix Individual Assessment Data Issues
## Solutions for Missing Data and Date Filtering

---

## 🚨 **ISSUE IDENTIFIED**

1. **No data showing in datagrid** - Need sample data
2. **No date filtering capability** - Need to add date range filters

---

## ✅ **SOLUTIONS IMPLEMENTED**

### **1. Added Date Filtering Capability**

#### **Backend Repository Update** (`master-account.repository.ts`)
```typescript
// Added new interface parameters
export interface WatchlistQueryOptions {
    // ... existing parameters
    dateFrom?: string // New: Filter by date from (YYYY-MM-DD)
    dateTo?: string   // New: Filter by date to (YYYY-MM-DD)
}

// Added date filtering logic
if (options.dateFrom) {
    conditions.push(
        sql`${frs9MasterAccount.prcDate} >= ${options.dateFrom}`
    )
}

if (options.dateTo) {
    conditions.push(
        sql`${frs9MasterAccount.prcDate} <= ${options.dateTo}`
    )
}
```

#### **API Route Update** (`individual-impairment.routes.ts`)
```typescript
router.get('/watchlist',
  [
    // ... existing validations
    query('dateFrom').optional().isISO8601().withMessage('Date from must be a valid date (YYYY-MM-DD)'),
    query('dateTo').optional().isISO8601().withMessage('Date to must be a valid date (YYYY-MM-DD)')
  ],
  validateRequest,
  individualImpairmentController.getWatchlist.bind(individualImpairmentController)
);
```

### **2. Created Sample Data Scripts**

#### **Master Account Data** (`seed_master_account_data.sql`)
- **100+ sample accounts** spanning 2023-2025
- Mix of **conventional and syariah** accounts
- Various **impairment stages** (1, 2, 3)
- Different **account statuses** and **DPD days**
- Optimized **indexes** for performance

#### **Individual Impairment Data** (`seed_individual_impairment_data.sql`)
- **10 impairment header records**
- **9 detail records** with cash flow projections
- **5 rate & risk scenarios** (baseline, optimistic, pessimistic)
- **9 DCF calculation records**
- Historical data from 2023-2025

---

## 🚀 **IMPLEMENTATION STEPS**

### **Step 1: Run Sample Data Scripts**
```sql
-- Connect to IAF tenant database
\c ifrspro_tenant_iaf

-- Run seed scripts
\i seed_master_account_data.sql
\i seed_individual_impairment_data.sql
```

### **Step 2: Restart Backend Service**
```bash
# Restart the backend to apply repository changes
npm run dev:backend
# or
yarn dev:backend
```

### **Step 3: Test the API Endpoints**

#### **Test Watchlist with Date Filtering**
```bash
# Get all data
curl "http://localhost:4231/api/v1/banking/individual/impairment/watchlist?page=1&limit=50"

# Filter by date range
curl "http://localhost:4231/api/v1/banking/individual/impairment/watchlist?page=1&limit=50&dateFrom=2024-01-01&dateTo=2024-12-31"

# Filter by current year
curl "http://localhost:4231/api/v1/banking/individual/impairment/watchlist?page=1&limit=50&dateFrom=2025-01-01&dateTo=2025-12-31"

# Search with date filter
curl "http://localhost:4231/api/v1/banking/individual/impairment/watchlist?page=1&limit=50&search=PT&dateFrom=2025-01-01"
```

#### **Test Frontend URL**
```
# Basic URL
http://localhost:4231/banking/individual/assessment?mode=conventional

# With date filtering (frontend needs to implement)
http://localhost:4231/banking/individual/assessment?mode=conventional&dateFrom=2025-01-01&dateTo=2025-12-31
```

---

## 📊 **EXPECTED RESULTS**

### **Data Volume**
- **100+ master account records** in the grid
- **10+ individual impairment records** for assessment
- **Multi-year data** (2023, 2024, 2025)

### **Filtering Capabilities**
- **Date range filtering** by `dateFrom` and `dateTo`
- **Search functionality** by account number, CIF name, CIF number
- **Stage filtering** (1, 2, 3)
- **Impairment flag filtering** (I/N)
- **Sorting** by various fields

### **Performance**
- **Optimized indexes** for fast queries
- **Pagination support** for large datasets
- **Efficient date range filtering**

---

## 🔧 **FRONTEND INTEGRATION NEEDED**

### **Add Date Filter Components**
```javascript
// Date range picker for filtering
const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');

// API call with date filters
const fetchData = async () => {
  const params = new URLSearchParams({
    page: currentPage,
    limit: pageSize,
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    ...(search && { search })
  });
  
  const response = await api.get(`/watchlist?${params}`);
  setData(response.data);
};
```

### **URL Update**
```javascript
// Update URL to include date filters
const updateURL = () => {
  const params = new URLSearchParams({
    mode: 'conventional',
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo })
  });
  
  navigate(`/banking/individual/assessment?${params}`);
};
```

---

## 🎯 **VALIDATION CHECKLIST**

- [ ] Sample data scripts executed successfully
- [ ] Backend service restarted with repository changes
- [ ] API endpoints responding with date filters
- [ ] Frontend grid showing 100+ records
- [ ] Date filtering working in UI
- [ ] Search functionality working
- [ ] Pagination working correctly
- [ ] Performance acceptable with large datasets

---

## 🚨 **TROUBLESHOOTING**

### **No Data Showing**
1. Check if seed scripts ran successfully
2. Verify database connection
3. Check API response in browser dev tools
4. Verify frontend is calling correct endpoint

### **Date Filtering Not Working**
1. Check if backend was restarted after repository changes
2. Verify date format (YYYY-MM-DD)
3. Check API validation errors in browser console
4. Test API endpoints directly with curl

### **Performance Issues**
1. Check if indexes were created
2. Verify query execution plans
3. Consider reducing page size
4. Add caching if needed

---

## 📈 **NEXT STEPS**

1. **Execute seed scripts** to populate data
2. **Restart backend** to apply changes
3. **Test API endpoints** with date filters
4. **Update frontend** with date picker components
5. **Performance testing** with large datasets
6. **User acceptance testing** of filtering features
