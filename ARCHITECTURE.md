# 🏗️ William Loans - System Architecture

## 📊 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│                     (React Frontend - Vite)                      │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ API Calls (fetch)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API SERVICE LAYER                           │
│                    (/src/services/api.ts)                        │
│                                                                   │
│  • clientsApi         • transactionsApi                          │
│  • cashbookApi        • ownerCapitalApi                          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTPS Requests
                               │ + Bearer Token
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE EDGE FUNCTION                      │
│         https://tmelmmhephgyzccezfgd.supabase.co                │
│               /functions/v1/make-server-68baa523                 │
│                                                                   │
│                    ┌──────────────────┐                          │
│                    │   Hono Server    │                          │
│                    │  (index.tsx)     │                          │
│                    └──────────────────┘                          │
│                           │                                       │
│                           │ KV Operations                         │
│                           ▼                                       │
│                    ┌──────────────────┐                          │
│                    │   kv_store.tsx   │                          │
│                    │  Helper Layer    │                          │
│                    └──────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ SQL Queries
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE POSTGRESQL                           │
│                                                                   │
│              Table: kv_store_68baa523                            │
│                                                                   │
│  Columns:                                                        │
│  • key (text, primary key)                                       │
│  • value (jsonb)                                                 │
│  • created_at (timestamp)                                        │
│  • updated_at (timestamp)                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Examples

### Example 1: Adding a New Client

```
┌──────────────┐
│ USER ACTION  │  User clicks "Add Client" button
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ FRONTEND                                                  │
│ AddClientModal.tsx                                        │
│  → User fills form (name, phone, address, loan amount)   │
│  → Clicks "Submit"                                        │
└──────┬───────────────────────────────────────────────────┘
       │
       │ Calls handleAddClient(newClient)
       ▼
┌──────────────────────────────────────────────────────────┐
│ App.tsx                                                   │
│  1. Creates client object with ID: c1737789012345        │
│  2. Calls: clientsApi.create(newClient)                  │
│  3. Creates processing fee cashbook entry                │
│  4. Calls: cashbookApi.create(processingFee)            │
│  5. Creates loan disbursement cashbook entry             │
│  6. Calls: cashbookApi.create(disbursement)             │
│  7. Updates local state                                  │
│  8. Shows success toast                                  │
└──────┬───────────────────────────────────────────────────┘
       │
       │ POST /make-server-68baa523/clients
       │ Body: { id: "c1737...", fullName: "John Doe", ... }
       │ Headers: { Authorization: "Bearer <anon_key>" }
       ▼
┌──────────────────────────────────────────────────────────┐
│ BACKEND (Edge Function)                                  │
│ /supabase/functions/server/index.tsx                     │
│                                                           │
│ app.post("/make-server-68baa523/clients", async (c) => { │
│   const client = await c.req.json();                     │
│   await kv.set(`client:${client.id}`, client);          │
│   return c.json({ success: true, data: client });       │
│ })                                                        │
└──────┬───────────────────────────────────────────────────┘
       │
       │ kv.set('client:c1737789012345', {...})
       ▼
┌──────────────────────────────────────────────────────────┐
│ kv_store.tsx Helper                                      │
│                                                           │
│ export async function set(key: string, value: any) {     │
│   const supabase = createClient();                       │
│   await supabase.from('kv_store_68baa523')              │
│     .upsert({                                            │
│       key: key,                                          │
│       value: value,                                      │
│       updated_at: new Date()                            │
│     });                                                  │
│ }                                                         │
└──────┬───────────────────────────────────────────────────┘
       │
       │ SQL: INSERT INTO kv_store_68baa523 ...
       ▼
┌──────────────────────────────────────────────────────────┐
│ POSTGRESQL DATABASE                                      │
│                                                           │
│ kv_store_68baa523 table:                                │
│                                                           │
│ key: "client:c1737789012345"                            │
│ value: {                                                 │
│   "id": "c1737789012345",                               │
│   "fullName": "John Doe",                               │
│   "phoneNumber": "0700123456",                          │
│   "address": "Kampala, Uganda",                         │
│   "loanAmount": 500000,                                 │
│   "totalRepayment": 600000,                             │
│   "dailyPayment": 20000,                                │
│   "totalPaid": 0,                                       │
│   "outstandingBalance": 600000,                         │
│   "status": "Active",                                   │
│   "startDate": "2026-01-15"                             │
│ }                                                        │
│ created_at: 2026-01-15 10:30:45                         │
│ updated_at: 2026-01-15 10:30:45                         │
└─────────────────────────────────────────────────────────┘
```

**Same process repeats for:**
- Processing fee cashbook entry → `cashbook:c1737789012346`
- Loan disbursement cashbook entry → `cashbook:c1737789012347`

---

### Example 2: Recording a Payment

```
USER → RecordPaymentModal → App.tsx
  ↓
  handleRecordPayment() {
    1. clientsApi.update(clientId, updatedClient)
       → Backend: kv.set('client:ID', updatedClient)
       → Database: UPDATE kv_store_68baa523
    
    2. transactionsApi.create(newTransaction)
       → Backend: kv.set('transaction:ID', transaction)
       → Database: INSERT INTO kv_store_68baa523
    
    3. cashbookApi.create(newCashbookEntry)
       → Backend: kv.set('cashbook:ID', entry)
       → Database: INSERT INTO kv_store_68baa523
  }
  ↓
  Success toast ✅
```

**Result in Database:**
- Updated client with new totalPaid & outstandingBalance
- New transaction record
- New cashbook income entry

---

### Example 3: Loading Dashboard Data

```
USER → Login → App.tsx
  ↓
  useEffect(() => {
    if (isLoggedIn) loadAllData();
  })
  ↓
  loadAllData() {
    Promise.all([
      clientsApi.getAll(),        // GET /clients
      transactionsApi.getAll(),   // GET /transactions
      cashbookApi.getAll(),       // GET /cashbook
      ownerCapitalApi.getAll()    // GET /owner-capital
    ])
  }
  ↓
  Backend: kv.getByPrefix('client:')
           kv.getByPrefix('transaction:')
           kv.getByPrefix('cashbook:')
           kv.getByPrefix('owner-capital:')
  ↓
  Database: SELECT * FROM kv_store_68baa523
            WHERE key LIKE 'client:%'
  ↓
  Returns all matching records
  ↓
  setState(data)
  ↓
  Dashboard renders with live data
```

---

## 🔑 Authentication Flow

```
┌────────────────────────┐
│  User enters email     │
│  william@boss.com      │
│  Password: admin@123   │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ Login.tsx                              │
│  • Validates against local user list  │
│  • No database authentication          │
│  • Simple credential check             │
└───────────┬────────────────────────────┘
            │
            │ onLogin(email)
            ▼
┌────────────────────────────────────────┐
│ App.tsx                                │
│  • setIsLoggedIn(true)                │
│  • setCurrentUser(email)              │
│  • loadAllData() - Fetch from DB      │
└────────────────────────────────────────┘
```

**Note**: Authentication is currently local (no Supabase Auth). Data access uses the public anon key.

---

## 📦 Data Prefixes & Organization

All data in `kv_store_68baa523` table uses prefixes:

| Prefix | Purpose | Count Method |
|--------|---------|--------------|
| `client:` | Client records | All active/completed loans |
| `transaction:` | Payment history | Individual payments |
| `cashbook:` | Income/Expenses | Daily cash flow tracking |
| `owner-capital:` | Owner transactions | Capital injections/withdrawals |

**Query Example:**
```sql
-- Get all clients
SELECT * FROM kv_store_68baa523 WHERE key LIKE 'client:%';

-- Get all transactions for a specific client
SELECT * FROM kv_store_68baa523 
WHERE key LIKE 'transaction:%' 
AND value->>'clientId' = 'c1737789012345';
```

---

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────────┐
│ FRONTEND (Public)                                       │
│  • Uses SUPABASE_ANON_KEY                              │
│  • Safe for browser exposure                            │
│  • Limited to allowed operations                        │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS + Bearer Token
                          ▼
┌─────────────────────────────────────────────────────────┐
│ EDGE FUNCTION (Server-side)                            │
│  • Uses SUPABASE_SERVICE_ROLE_KEY                      │
│  • Full database access                                 │
│  • Never exposed to frontend                            │
│  • CORS configured                                      │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Authenticated SQL
                          ▼
┌─────────────────────────────────────────────────────────┐
│ DATABASE (PostgreSQL)                                   │
│  • Row Level Security (optional)                        │
│  • Only accessible via service role                     │
│  • Encrypted at rest                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
william-loans/
│
├── src/
│   ├── app/
│   │   ├── App.tsx ........................ Main app component
│   │   ├── components/
│   │   │   ├── AddClientModal.tsx ......... Add client form
│   │   │   ├── RecordPaymentModal.tsx ..... Payment recording
│   │   │   ├── AddExpenseModal.tsx ........ Expense form
│   │   │   ├── OwnerCapitalModal.tsx ...... Owner transactions
│   │   │   └── ...
│   │   └── pages/
│   │       ├── Dashboard.tsx .............. KPIs & charts
│   │       ├── Clients.tsx ................ Client list
│   │       ├── ClientDetail.tsx ........... Individual client
│   │       ├── Cashbook.tsx ............... Income/expense log
│   │       └── TransactionHistory.tsx ..... Payment archive
│   │
│   └── services/
│       └── api.ts ......................... API service layer
│
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx .................. Edge function (Hono)
│           └── kv_store.tsx ............... Database helpers
│
├── utils/
│   └── supabase/
│       └── info.tsx ....................... Auto-generated config
│
├── .env .................................. Environment variables
├── DEPLOYMENT_GUIDE.md ................... How to deploy
├── INTEGRATION_CHECKLIST.md .............. What's connected
├── ARCHITECTURE.md ....................... This file
├── deploy.sh ............................. Deployment script
└── test-connection.html .................. Connection tester
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│ DEVELOPMENT                                             │
│  • Local Vite dev server                               │
│  • Code in /src                                         │
│  • Hot reload enabled                                   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ npm run build
                          ▼
┌─────────────────────────────────────────────────────────┐
│ BUILD                                                   │
│  • Vite builds React app                               │
│  • Optimized bundle created                            │
│  • Static files in /dist                               │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Deploy to hosting
                          ▼
┌─────────────────────────────────────────────────────────┐
│ PRODUCTION FRONTEND                                     │
│  • Static site hosting (Netlify/Vercel/etc)           │
│  • HTTPS enabled                                        │
│  • Global CDN                                           │
└─────────────────────────────────────────────────────────┘
                          │
                          │ API calls to edge function
                          ▼
┌─────────────────────────────────────────────────────────┐
│ SUPABASE EDGE FUNCTIONS                                │
│  • Deployed: supabase functions deploy server          │
│  • Global edge network                                  │
│  • Auto-scaling                                         │
│  • Built-in monitoring                                  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Database connection
                          ▼
┌─────────────────────────────────────────────────────────┐
│ SUPABASE POSTGRESQL                                     │
│  • Managed database                                     │
│  • Automatic backups                                    │
│  • Connection pooling                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | UI components |
| **Build Tool** | Vite | Fast dev server & bundling |
| **Styling** | Tailwind CSS v4 | Utility-first CSS |
| **Charts** | Recharts | Data visualization |
| **Icons** | Lucide React | Icon library |
| **Notifications** | Sonner | Toast messages |
| **Backend Runtime** | Deno | Edge function runtime |
| **Web Framework** | Hono | Fast HTTP server |
| **Database** | PostgreSQL | Data persistence |
| **Backend Service** | Supabase | BaaS platform |

---

## 🎯 Key Features by Layer

### Frontend Features
- ✅ Responsive design (desktop + mobile)
- ✅ Real-time KPI calculations
- ✅ Interactive charts
- ✅ PDF generation for receipts
- ✅ Role-based UI (Boss, Cashier, Field Officer)
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling

### Backend Features
- ✅ RESTful API design
- ✅ CORS enabled
- ✅ Request logging
- ✅ Error handling
- ✅ JSON responses
- ✅ Consistent API structure

### Database Features
- ✅ Key-value storage
- ✅ JSONB for flexible schemas
- ✅ Prefix-based organization
- ✅ Timestamp tracking
- ✅ ACID compliance

---

**Your William Loans system is a modern, scalable, three-tier application! 🚀**
