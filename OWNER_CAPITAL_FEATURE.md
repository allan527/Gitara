# 💰 Owner Capital Management Feature

## Overview

William Kalamuzi can now inject capital or withdraw money from the business directly through the **Data View** page!

---

## 🎯 Access

**Who can use it?**
- ✅ **william@boss.com** only (owner account)
- ❌ cashier.com - Cannot see the button
- ❌ field.com - Cannot see the button

**Where to find it?**
1. Login as **william@boss.com**
2. Navigate to **Data View** (database icon in sidebar)
3. Click the **"Capital"** tab
4. Look for the **"Manage Capital"** button in the top-right corner

---

## 💵 Features

### Capital Injection (Add Money)
When William adds money to the business:
- ✅ Recorded as **Income** in Cashbook
- ✅ Status: **Profit**
- ✅ Increases available business funds
- ✅ Tracked separately in Owner Capital table

### Owner Withdrawal (Remove Money)
When William withdraws money:
- ✅ Recorded as **Expense** in Cashbook
- ✅ Status: **Expense**
- ✅ Decreases available business funds
- ✅ Tracked separately in Owner Capital table

---

## 📊 How It Works

### Step-by-Step Process

1. **Open the Modal**
   - Click "Manage Capital" button on Capital tab
   - Modal opens with two transaction options

2. **Select Transaction Type**
   - **Capital Injection** (green icon) - Add money
   - **Owner Withdrawal** (orange icon) - Remove money

3. **Enter Details**
   - Amount (in UGX)
   - Description (optional, auto-generated if empty)
   - Owner info displayed: William Kalamuzi, +256709907775

4. **Submit**
   - Transaction recorded in Owner Capital table
   - Cashbook entry created automatically
   - Success notification appears

---

## 📝 Data Recorded

### Owner Capital Table Entry
```javascript
{
  id: "oc1234567890",
  date: "2026-01-18",
  time: "14:30",
  type: "Capital Injection", // or "Owner Withdrawal"
  amount: 500000,
  description: "Owner capital injection",
  createdAt: "2026-01-18T14:30:00.000Z"
}
```

### Cashbook Entry (Created Automatically)
```javascript
{
  id: "c1234567891",
  date: "2026-01-18",
  time: "14:30",
  description: "Owner capital injection",
  type: "Income", // or "Expense" for withdrawal
  amount: 500000,
  status: "Profit", // or "Expense" for withdrawal
  createdAt: "2026-01-18T14:30:00.000Z"
}
```

---

## 🎨 UI/UX

### Modal Design
- **Clean, two-column layout**
- **Color-coded transaction types**
  - 🟢 Capital Injection - Green accent
  - 🟠 Owner Withdrawal - Orange accent
- **Owner info displayed**
  - Name: William Kalamuzi
  - Phone: +256709907775
  - Crown icon for owner

### Button Visibility
- Only visible to **william@boss.com**
- Other users see Capital tab but no "Manage Capital" button
- Maintains security and role-based access

---

## 📍 Where to Access This Feature

### From Data View Page
1. **Sidebar** → Data View
2. **Capital Tab** → Top-right corner
3. **Manage Capital Button** → Opens modal

### From Cashbook Page
1. **Sidebar** → Cashbook
2. **Owner Capital Button** → Top section
3. **Same modal** → Same functionality

**Both locations open the same modal and record the same data!**

---

## 🔒 Security & Access Control

### Role-Based Access
```typescript
// Button only shows for william@boss.com
{currentUser === 'william@boss.com' && (
  <Button onClick={onOwnerCapital}>
    Manage Capital
  </Button>
)}
```

### Data Integrity
- All transactions timestamped
- Dual recording (Owner Capital + Cashbook)
- Cannot be edited once submitted
- Full audit trail maintained

---

## 💾 Data Storage

### KV Store Keys
```
owner_capital:oc1234567890 → Owner capital transaction
cashbook:c1234567891       → Corresponding cashbook entry
```

### Benefits
- Automatic persistence to Supabase
- Real-time updates across app
- Searchable and sortable in tables
- Included in all reports

---

## 📈 Reporting & Tracking

### Where Capital Shows Up

1. **Owner Capital Table**
   - Dedicated view in Data View → Capital tab
   - Shows only capital transactions
   - Color-coded by type

2. **Cashbook**
   - Mixed with other income/expenses
   - Clearly labeled with description
   - Affects overall balance

3. **Dashboard**
   - Included in total income/expenses
   - Affects profit calculations
   - Visible in charts

---

## 🎯 Use Cases

### When to Use Capital Injection
- Starting a new loan fund
- Adding emergency reserves
- Expanding business operations
- Covering temporary deficits

### When to Use Owner Withdrawal
- Taking business profits
- Personal expenses
- Reinvesting elsewhere
- Reducing capital as needed

---

## ✨ Benefits

### For William (Owner)
- ✅ Easy capital management
- ✅ Clear transaction history
- ✅ Automatic bookkeeping
- ✅ Full visibility and control

### For the Business
- ✅ Accurate cash tracking
- ✅ Complete audit trail
- ✅ Better financial planning
- ✅ Transparent operations

---

## 🚀 Example Workflow

### Scenario: William Injects UGX 1,000,000

1. **Open Modal**
   - Data View → Capital → Manage Capital

2. **Fill Form**
   - Select: Capital Injection
   - Amount: 1,000,000
   - Description: "Additional business capital"

3. **Submit**
   - ✅ Owner Capital: UGX 1,000,000 (Capital Injection)
   - ✅ Cashbook: UGX 1,000,000 (Income - Profit)
   - ✅ Toast: "Capital Injection of UGX 1,000,000 recorded successfully!"

4. **View Results**
   - Capital table shows new entry
   - Cashbook shows income entry
   - Dashboard totals updated

---

## 📊 Sample Data

### Capital Injection Example
```
ID:          oc1705584000123
Date:        Jan 18, 2026
Time:        14:30
Type:        Capital Injection (green)
Amount:      UGX 1,000,000
Description: Additional business capital
Created:     Jan 18, 2026
```

### Owner Withdrawal Example
```
ID:          oc1705584100456
Date:        Jan 18, 2026
Time:        15:45
Type:        Owner Withdrawal (orange)
Amount:      UGX 500,000
Description: Personal withdrawal
Created:     Jan 18, 2026
```

---

## 🔧 Technical Details

### Component Used
- **OwnerCapitalModal.tsx** - Modal component
- **DataView.tsx** - Host page with button
- **App.tsx** - Handler function

### API Calls
```typescript
// Save to Owner Capital
await ownerCapitalApi.create(ownerCapitalTransaction);

// Save to Cashbook
await cashbookApi.create(newCashbookEntry);
```

### State Updates
```typescript
// Update local state
setOwnerCapitalTransactions(prev => [newTransaction, ...prev]);
setCashbookEntries(prev => [newEntry, ...prev]);
```

---

## ✅ Summary

**Owner Capital Management is now:**
- ✅ Fully integrated in Data View
- ✅ Restricted to william@boss.com
- ✅ Recording to both Owner Capital and Cashbook
- ✅ Visible in tables and charts
- ✅ Easy to use and track

**William can now:**
- 💰 Inject capital when needed
- 💸 Withdraw money as desired
- 📊 Track all transactions in one place
- 🔍 Search and sort capital history

---

**Perfect for managing business finances! 🎉**
