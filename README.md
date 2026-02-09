# 🏦 GITARA BRANCH - Personal Loan Management System

**A complete loan management dashboard for Uganda, handling personal loans with UGX currency formatting and 20% monthly interest.**

---

## ✨ **FEATURES**

### 📊 **Dashboard**
- Real-time KPIs (Total Loans, Active Clients, Collections, Outstanding Balance)
- Recent transactions view
- Quick stats and analytics

### 👥 **Client Management**
- Add, edit, view, and delete clients
- Track loan history per client
- View client payment history
- Client allocation tracking

### 💰 **Transaction Management**
- Record loan payments
- Automatic interest calculation (20% monthly over 30 days)
- Balance tracking
- Payment receipts with PDF download

### 📒 **Cashbook**
- Income and expense tracking
- Processing fees tracking
- Owner capital injection/withdrawal
- Profit/loss calculation

### 👤 **Owner Capital Management**
- Capital injection tracking
- Owner withdrawal tracking
- Separate from client loan system

### 🔐 **Security Features**
- Owner-only permissions (only william@boss.com can edit/delete)
- Role-based access control
- Session persistence

---

## 🎨 **DESIGN**

- **Color Scheme:** Emerald green (#047857, #10b981)
- **UI:** Clean fintech style with soft mint backgrounds
- **Responsive:** Full mobile, tablet, and desktop support
- **Components:** Rounded cards with modern shadows

---

## 💾 **DATA STORAGE**

**LocalStorage Mode (Current)**
- All data saved in browser localStorage
- Persists across page refreshes
- Works offline
- No backend required

---

## 🚀 **QUICK START**

### **1. Clone & Install**
```bash
# Clone the repository
git clone <your-repo-url>
cd gitara-branch

# Install dependencies
npm install
```

### **2. Run Development Server**
```bash
npm run dev
```

### **3. Open in Browser**
```
http://localhost:5173
```

### **4. Login**
- **Owner Account:**
  - Email: `william@boss.com`
  - Password: `william2024`
  - Can edit/delete all data

- **Staff Account:**
  - Email: `staff@gitara.com`
  - Password: `staff2024`
  - Read-only access

---

## 📱 **CURRENCY & FORMATTING**

- **Currency:** UGX (Uganda Shillings)
- **Format:** UGX 1,500,000
- **Phone Numbers:** Normalized to 0XXX format (removes +256)
- **Interest Rate:** 20% monthly over 30 days

---

## 🔧 **KEY FUNCTIONALITIES**

### **Adding a Client**
1. Click "Add Client" button
2. Fill in client details (name, phone, loan amount, interest rate, duration)
3. System auto-calculates total due
4. Creates Processing Fee and Loan Disbursement entries in Cashbook

### **Recording Payment**
1. Select client from Clients page
2. Click "Record Payment"
3. Enter payment amount and date
4. System updates client balance
5. Creates cashbook entry automatically
6. Optional: Print payment receipt

### **Managing Owner Capital**
1. Go to Cashbook page
2. Click "Owner Capital" button
3. Choose "Add Money" or "Remove Money"
4. System tracks capital separately from client loans

### **Cascading Deletes**
- Deleting a client removes all their transactions
- Deleting a payment reverses the client balance
- Deleting owner capital removes associated cashbook entry

---

## 🎯 **PERMISSIONS**

### **Owner (william@boss.com)**
- ✅ Add clients
- ✅ Edit clients
- ✅ Delete clients
- ✅ Record payments
- ✅ Edit payments
- ✅ Delete payments
- ✅ Manage cashbook
- ✅ Manage owner capital

### **Staff (other users)**
- ✅ View all data
- ✅ View reports
- ✅ View dashboard
- ❌ Cannot edit/delete anything

---

## 📂 **PROJECT STRUCTURE**

```
gitara-branch/
├── src/
│   ├── app/
│   │   ├── components/        # UI components
│   │   ├── pages/             # Page components
│   │   ├── data/              # Data models
│   │   ├── hooks/             # Custom hooks
│   │   └── App.tsx            # Main app component
│   ├── services/
│   │   └── localApi.ts        # LocalStorage API
│   └── styles/                # CSS files
├── package.json
└── README.md
```

---

## 🛠️ **TECH STACK**

- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Notifications:** Sonner (toast)
- **PDF Generation:** jsPDF
- **Build Tool:** Vite
- **Storage:** Browser LocalStorage

---

## 🔄 **DATA PERSISTENCE**

All data is stored in browser localStorage:
- ✅ Clients: `gitara_branch_clients`
- ✅ Transactions: `gitara_branch_transactions`
- ✅ Cashbook: `gitara_branch_cashbook`
- ✅ Owner Capital: `gitara_branch_owner_capital`

**Note:** Data is tied to the browser. Clearing browser data will delete all records.

---

## 📝 **DEVELOPMENT NOTES**

### **Adding New Features**
1. Update data models in `/src/app/data/mockData.ts`
2. Create UI components in `/src/app/components/`
3. Update pages in `/src/app/pages/`
4. Use `useLocalData` hook for data management

### **Styling Guidelines**
- Use Tailwind utility classes
- Follow emerald green theme (#047857, #10b981)
- Keep UI clean and minimal
- Ensure mobile responsiveness

---

## ⚠️ **IMPORTANT NOTES**

1. **Data is LOCAL** - Not synced across devices
2. **Owner Only** - Only william@boss.com can edit/delete
3. **Phone Format** - Always stored as 0XXX (removes +256)
4. **Interest Calc** - 20% monthly over 30 days
5. **No SMS** - SMS features disabled (requires backend)

---

## 📓 **LEARNING RESOURCES**

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

---

## 📄 **LICENSE**

Private project for GITARA BRANCH internal use.

---

## 💡 **FUTURE ENHANCEMENTS**

Potential features to add:
- [ ] Backend integration with Supabase
- [ ] SMS notifications
- [ ] Multi-device sync
- [ ] Export data to Excel
- [ ] Automated payment reminders
- [ ] Client credit scoring
- [ ] Loan approval workflow

---

## 📞 **SUPPORT**

For technical issues or feature requests, contact the development team.

---

**Built with ❤️ for GITARA BRANCH** 🏦