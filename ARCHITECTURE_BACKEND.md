# 🏗️ GITARA BRANCH - Backend Architecture

## 📐 System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      GITARA BRANCH                          │
│              Personal Loan Management System                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌──────────────┐                            ┌──────────────┐
│   FRONTEND   │                            │   BACKEND    │
│   (React)    │◄──────────────────────────►│  (Supabase)  │
└──────────────┘         REST API           └──────────────┘
        │                                           │
        │                                           │
        ▼                                           ▼
┌──────────────┐                            ┌──────────────┐
│   Browser    │                            │  KV Database │
│   Storage    │                            │  (Supabase)  │
│  (Backup)    │                            │              │
└──────────────┘                            └──────────────┘
```

---

## 🔄 Data Flow

### Read Operations (GET)

```
User Action (View Data)
        │
        ▼
┌─────────────────┐
│  React Component│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ useSupabaseData │  (Hook)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Fetch API     │  GET /clients
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Supabase Server │  (Edge Function)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   KV Store      │  client:abc123 → {data}
└────────┬────────┘
         │
         ▼
Response: { clients: [...] }
         │
         ▼
┌─────────────────┐
│  State Update   │  setClients(data)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   UI Renders    │  Display clients list
└─────────────────┘
```

### Write Operations (POST/PUT/DELETE)

```
User Action (Add/Edit/Delete)
        │
        ▼
┌─────────────────┐
│  React Component│  handleAddClient()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ useSupabaseData │  addClient(data)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Fetch API     │  POST /clients
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Supabase Server │  Validate & Process
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   KV Store      │  SET client:abc123
└────────┬────────┘
         │
         ▼
Response: { client: {...} }
         │
         ▼
┌─────────────────┐
│  State Update   │  setClients(prev => [...])
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   UI Renders    │  Show new client
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Toast Message  │  "Client added successfully!"
└─────────────────┘
```

---

## 🗂️ Component Structure

### Frontend Components

```
/src/app/
├── App.tsx                         # Main app component
│   ├── useSupabaseData()          # Backend hook
│   ├── Login                      # Authentication
│   ├── DataMigration              # Data migration UI
│   └── Main App                   # Main interface
│       ├── Sidebar                # Navigation
│       ├── MobileHeader           # Mobile nav
│       └── Pages
│           ├── Dashboard          # KPIs & charts
│           ├── Clients            # Client management
│           ├── ClientDetail       # Client details
│           ├── Cashbook           # Income/Expense
│           ├── TransactionHistory # Reports
│           └── DataView           # Raw data tables
│
├── components/
│   ├── AddClientModal.tsx         # Add client form
│   ├── RecordPaymentModal.tsx     # Payment form
│   ├── EditClientModal.tsx        # Edit client form
│   ├── NewLoanModal.tsx           # New loan form
│   ├── OwnerCapitalModal.tsx      # Capital form
│   ├── BackendStatus.tsx          # Status indicator
│   └── ui/                        # Shadcn components
│
├── hooks/
│   ├── useSupabaseData.ts         # Backend data hook ✨
│   └── useLocalData.ts            # Local storage (backup)
│
└── utils/
    └── supabase.ts                # Supabase client ✨
```

### Backend Structure

```
/supabase/functions/server/
├── index.tsx                      # Main API server ✨
│   ├── Health Check              # GET /health
│   ├── Clients API               # CRUD endpoints
│   ├── Transactions API          # CRUD endpoints
│   ├── Cashbook API              # CRUD endpoints
│   ├── Owner Capital API         # CRUD endpoints
│   └── Sync API                  # Migration endpoint
│
└── kv_store.tsx                  # KV Store utilities
    ├── get()                     # Get single value
    ├── set()                     # Set value
    ├── del()                     # Delete value
    ├── mget()                    # Get multiple
    ├── mset()                    # Set multiple
    ├── mdel()                    # Delete multiple
    └── getByPrefix()             # Query by prefix
```

---

## 🔌 API Endpoints

### Base URL
```
https://clhitbfyzhjsjkzhuqlp.supabase.co/functions/v1/make-server-7f28f6fd
```

### Endpoints Map

```
┌─────────────────────────────────────────────────────────────┐
│                      API ENDPOINTS                          │
└─────────────────────────────────────────────────────────────┘

📁 CLIENTS
├── GET    /clients              → Get all clients
├── POST   /clients              → Add new client
├── PUT    /clients/:id          → Update client
└── DELETE /clients/:id          → Delete client + transactions

📝 TRANSACTIONS
├── GET    /transactions         → Get all transactions
├── POST   /transactions         → Add new transaction
├── PUT    /transactions/:id     → Update transaction
└── DELETE /transactions/:id     → Delete transaction

💰 CASHBOOK
├── GET    /cashbook             → Get all entries
├── POST   /cashbook             → Add new entry
├── PUT    /cashbook/:id         → Update entry
└── DELETE /cashbook/:id         → Delete entry

💵 OWNER CAPITAL
├── GET    /owner-capital        → Get all transactions
├── POST   /owner-capital        → Add transaction
└── DELETE /owner-capital/:id    → Delete transaction

🔄 DATA SYNC
└── POST   /sync                 → Migrate local data

🏥 HEALTH
└── GET    /health               → Server status check
```

---

## 💾 Data Storage

### KV Store Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    KEY-VALUE PAIRS                          │
└─────────────────────────────────────────────────────────────┘

Prefix: client:
├── client:abc123 → { id, fullName, phoneNumber, ... }
├── client:def456 → { id, fullName, phoneNumber, ... }
└── ...

Prefix: transaction:
├── transaction:xyz789 → { id, clientId, amount, date, ... }
├── transaction:uvw012 → { id, clientId, amount, date, ... }
└── ...

Prefix: cashbook:
├── cashbook:mno345 → { id, type, amount, description, ... }
├── cashbook:pqr678 → { id, type, amount, description, ... }
└── ...

Prefix: owner-capital:
├── owner-capital:stu901 → { id, type, amount, date, ... }
├── owner-capital:vwx234 → { id, type, amount, date, ... }
└── ...
```

### Data Models

```typescript
// Client Model
interface Client {
  id: string;
  fullName: string;
  phoneNumber: string;              // Normalized to 0XXX format
  address: string;
  loanAmount: number;               // UGX
  outstandingBalance: number;       // UGX
  totalPaid: number;                // UGX
  status: 'Active' | 'Completed' | 'Defaulted';
  startDate: string;
  dailyPayment: number;             // UGX
  totalPayable: number;             // UGX (includes 20% interest)
  guarantorName?: string;
  guarantorId?: string;
  guarantorPhone?: string;
  guarantorLocation?: string;
  createdBy?: string;
  loanIssuedBy?: string;
  assignedTo?: string;
  currentLoanNumber?: number;
  totalLoansCompleted?: number;
}

// Transaction Model
interface Transaction {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  amount: number;                   // UGX
  notes: string;
  status: 'Paid' | 'Unpaid';
  recordedBy?: string;
  loanNumber?: number;
  isNewLoan?: boolean;
}

// Cashbook Entry Model
interface CashbookEntry {
  id: string;
  date: string;
  time: string;
  description: string;
  type: 'Income' | 'Expense';
  amount: number;                   // UGX
  status: 'Paid' | 'Expense' | 'Profit' | 'Disbursement';
  enteredBy?: string;
}

// Owner Capital Model
interface OwnerCapitalTransaction {
  id: string;
  type: 'Capital Injection' | 'Owner Withdrawal';
  amount: number;                   // UGX
  date: string;
  time: string;
  description: string;
  enteredBy: string;
}
```

---

## 🔐 Security Architecture

### Authentication Flow

```
User Login
    │
    ▼
┌─────────────┐
│  Email Input│  william@boss.com
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Validate  │  Simple check (no password)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Store User  │  localStorage.setItem('gitara_branch_user', email)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Set State  │  setIsLoggedIn(true), setCurrentUser(email)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Load App    │  Render main interface
└─────────────┘
```

### API Security

```
Frontend Request
    │
    ▼
┌─────────────────────┐
│  Add Auth Headers   │  Authorization: Bearer {publicAnonKey}
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   HTTPS/TLS         │  Encrypted transmission
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Supabase Server    │  Validate request
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Process Request    │  Execute operation
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Return Response    │  JSON data
└─────────────────────┘
```

### Permission Model

```
┌────────────────────────────────────────┐
│           USER ROLES                   │
└────────────────────────────────────────┘

william@boss.com (Owner)
├── ✅ View all data
├── ✅ Add clients
├── ✅ Edit clients
├── ✅ Delete clients
├── ✅ Record payments
├── ✅ Edit payments
├── ✅ Delete payments
├── ✅ Manage cashbook
├── ✅ Manage owner capital
├── ✅ Access Data View
└── ✅ All features enabled

Other Users (Staff)
├── ✅ View all data
├── ✅ Add clients (with createdBy)
├── ❌ Edit clients (read-only)
├── ❌ Delete clients (hidden)
├── ✅ Record payments (with recordedBy)
├── ❌ Edit payments (hidden)
├── ❌ Delete payments (hidden)
├── ✅ View cashbook (read-only)
├── ❌ Manage owner capital (hidden)
├── ✅ Access most pages
└── ❌ Limited features
```

---

## 🔄 State Management

### Frontend State Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   STATE MANAGEMENT                          │
└─────────────────────────────────────────────────────────────┘

useSupabaseData Hook
    │
    ├── clients (State)
    ├── transactions (State)
    ├── cashbookEntries (State)
    ├── ownerCapitalTransactions (State)
    ├── loading (State)
    ├── error (State)
    │
    ├── addClient() (Function)
    ├── updateClient() (Function)
    ├── deleteClient() (Function)
    │
    ├── addTransaction() (Function)
    ├── updateTransaction() (Function)
    ├── deleteTransaction() (Function)
    │
    └── ... (more operations)

↓ Passed to Components via Props

App.tsx
    │
    ├── Dashboard (clients, transactions, cashbookEntries)
    ├── Clients (clients, onAddClient, onEditClient, onDeleteClient)
    ├── ClientDetail (client, transactions, onRecordPayment)
    ├── Cashbook (cashbookEntries, onAddEntry, onDeleteEntry)
    ├── TransactionHistory (cashbookEntries)
    └── DataView (all data + CRUD functions)
```

---

## 📊 Performance Optimization

### Caching Strategy

```
Initial Load
    │
    ▼
Fetch all data from backend
    │
    ▼
Store in React state (in-memory cache)
    │
    ▼
Subsequent operations use local state
    │
    ▼
Updates sync to backend immediately
    │
    ▼
Local state updated optimistically
```

### Data Loading

```
Page Load → Loading State → Fetch Data → Update State → Render UI
    │             │              │             │            │
    0ms          0ms           100ms         200ms       300ms
              (Spinner)    (API Call)    (State Set)  (Display)
```

---

## 🌐 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT STACK                         │
└─────────────────────────────────────────────────────────────┘

Frontend (React)
├── Build: Vite
├── Deploy: Figma Make / Vercel / Netlify
└── CDN: Edge locations worldwide

Backend (Supabase)
├── Region: East US
├── Edge Functions: Deno runtime
├── Database: PostgreSQL (KV Store)
└── Infrastructure: AWS (managed by Supabase)

Domain
├── Frontend: custom-domain.com
├── API: clhitbfyzhjsjkzhuqlp.supabase.co
└── SSL/TLS: Automatic (Supabase)
```

---

## 🔮 Future Architecture (Optional Enhancements)

```
Current:  Frontend → API → KV Store

Future:   Frontend → API → PostgreSQL Tables
              │              ├── clients
              │              ├── transactions
              │              ├── cashbook
              │              └── owner_capital
              │
              ├→ Supabase Auth (Real authentication)
              ├→ Supabase Realtime (Live updates)
              ├→ Supabase Storage (File uploads)
              └→ Edge Functions (Complex business logic)
```

---

## 📝 Summary

### Key Architectural Decisions

1. **KV Store over SQL** - Simpler, faster for this use case
2. **REST over GraphQL** - Easier to understand and maintain
3. **React State over Redux** - Less complexity for this scale
4. **Optimistic Updates** - Better UX, instant feedback
5. **Edge Functions** - Fast global response times
6. **Monolithic Frontend** - Simpler deployment and debugging

### Benefits

- ✅ Simple and maintainable
- ✅ Fast and responsive
- ✅ Scalable architecture
- ✅ Production-ready
- ✅ Easy to enhance
- ✅ Well-documented

---

**Architecture Overview Complete!** 🎉

This architecture provides a solid foundation for your loan management system with room for future growth and enhancements.
