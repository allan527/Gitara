# 🔐 LOGIN CREDENTIALS - GITALA BRANCH

## 📋 All User Accounts

Your GITALA BRANCH system has **5 user accounts** configured:

---

## 👑 OWNER ACCOUNT (Full Access)

### **William - Boss**
- **Email:** `william@boss.com`
- **Password:** `William2026`
- **Role:** Boss (Owner)
- **Permissions:** 
  - ✅ Full access to all features
  - ✅ Can edit/modify ALL data
  - ✅ Can delete ANY record
  - ✅ Access to Data View page
  - ✅ Can manage all clients
  - ✅ Can record all payments
  - ✅ Can manage cashbook
  - ✅ Can manage owner capital
  - ✅ Can view all reports
  - ✅ **ONLY THIS ACCOUNT CAN EDIT/DELETE DATA**

---

## 👥 STAFF ACCOUNTS (Limited Access)

### **Cashier**
- **Email:** `cashier.com`
- **Password:** `Cash2026#`
- **Role:** Cashier
- **Permissions:**
  - ✅ View dashboard
  - ✅ View clients
  - ✅ Record payments (but cannot edit/delete)
  - ✅ View cashbook
  - ✅ View reports
  - ❌ Cannot edit client data
  - ❌ Cannot delete any records
  - ❌ Cannot access Data View page

---

### **Gasasira - Field Officer**
- **Email:** `gasasira.com`
- **Password:** `Gasasira2021`
- **Role:** Field Officer
- **Permissions:**
  - ✅ View dashboard
  - ✅ View clients
  - ✅ Record payments (but cannot edit/delete)
  - ✅ View transactions
  - ✅ View reports
  - ❌ Cannot edit client data
  - ❌ Cannot delete any records
  - ❌ Cannot access Data View page

---

### **Field Officer 2**
- **Email:** `field2.com`
- **Password:** `Field2@26`
- **Role:** Field Officer
- **Permissions:**
  - ✅ View dashboard
  - ✅ View clients
  - ✅ Record payments (but cannot edit/delete)
  - ✅ View transactions
  - ✅ View reports
  - ❌ Cannot edit client data
  - ❌ Cannot delete any records
  - ❌ Cannot access Data View page

---

### **Field Officer 3**
- **Email:** `field3.com`
- **Password:** `Field3@26`
- **Role:** Field Officer
- **Permissions:**
  - ✅ View dashboard
  - ✅ View clients
  - ✅ Record payments (but cannot edit/delete)
  - ✅ View transactions
  - ✅ View reports
  - ❌ Cannot edit client data
  - ❌ Cannot delete any records
  - ❌ Cannot access Data View page

---

## 📊 Quick Reference Table

| User | Email | Password | Role | Can Edit? | Can Delete? |
|------|-------|----------|------|-----------|-------------|
| **William** | william@boss.com | William2026 | Boss | ✅ YES | ✅ YES |
| Cashier | cashier.com | Cash2026# | Cashier | ❌ NO | ❌ NO |
| **Gasasira** | gasasira.com | Gasasira2021 | Field Officer | ❌ NO | ❌ NO |
| Field Officer 2 | field2.com | Field2@26 | Field Officer | ❌ NO | ❌ NO |
| Field Officer 3 | field3.com | Field3@26 | Field Officer | ❌ NO | ❌ NO |

---

## 🔒 Security Rules

### Owner-Only Permissions
**ONLY `william@boss.com` can:**
- ✏️ Edit client information
- ✏️ Edit payment records
- 🗑️ Delete clients
- 🗑️ Delete transactions
- 🗑️ Delete cashbook entries
- 🗑️ Delete owner capital records
- 👁️ Access the Data View page
- 🔧 Perform data repairs
- 🧹 Clean up duplicates

### Staff Permissions
**All staff accounts (`cashier.com`, `field1.com`, `field2.com`, `field3.com`) can:**
- 👁️ View all clients
- 👁️ View dashboard and KPIs
- 💰 Record new payments
- 📊 View reports
- 📖 View transaction history
- 📚 View cashbook

**Staff CANNOT:**
- ❌ Edit any existing data
- ❌ Delete any records
- ❌ Access Data View page
- ❌ Modify client details
- ❌ Change payment amounts

---

## 🚀 How to Login

### Step 1: Open the App
- Go to your GITALA BRANCH application URL

### Step 2: Enter Credentials
- **Email Field:** Enter one of the emails above
- **Password Field:** Enter the corresponding password

### Step 3: Click Login
- Click the "Login" button
- You'll be logged in immediately

### Example (Owner Login)
```
Email: william@boss.com
Password: William2026
[Click Login]
```

### Example (Staff Login)
```
Email: cashier.com
Password: Cash2026#
[Click Login]
```

---

## ⚠️ Important Notes

### 1. **Case Sensitive**
- Passwords ARE case-sensitive
- Emails are NOT case-sensitive
- `William2026` ≠ `william2026`

### 2. **Owner Account**
- Use `william@boss.com` for full system access
- This is the only account that can edit/delete data
- Keep this password secure!

### 3. **Staff Accounts**
- Great for field officers and cashiers
- They can record payments but not edit them
- Perfect for day-to-day operations

### 4. **No Registration**
- These accounts are pre-configured
- No need to sign up
- Just login with the credentials above

### 5. **Logout**
- Click the "Logout" button in the sidebar
- Your session will end
- Login again with any account

---

## 🔧 How to Add More Users

If you need to add more users, edit the file:
**`/src/app/pages/Login.tsx`**

```typescript
const VALID_USERS = [
  { email: 'william@boss.com', password: 'William2026', role: 'Boss' },
  { email: 'cashier.com', password: 'Cash2026#', role: 'Cashier' },
  { email: 'field1.com', password: 'Field1@26', role: 'Field Officer' },
  { email: 'field2.com', password: 'Field2@26', role: 'Field Officer' },
  { email: 'field3.com', password: 'Field3@26', role: 'Field Officer' },
  
  // Add new users here:
  { email: 'field4.com', password: 'Field4@26', role: 'Field Officer' },
  { email: 'manager.com', password: 'Manager2026', role: 'Manager' },
];
```

### To Give Full Access to New User
Change the permission checks in `/src/app/App.tsx`:

```typescript
// BEFORE (only william@boss.com has access)
if (currentUser !== 'william@boss.com') {
  toast.error('Access Denied: Only the owner can edit client data');
  return;
}

// AFTER (multiple owners)
const owners = ['william@boss.com', 'manager@boss.com'];
if (!owners.includes(currentUser)) {
  toast.error('Access Denied: Only owners can edit client data');
  return;
}
```

---

## 📱 Mobile Access

All accounts work on:
- 💻 Desktop browsers
- 📱 Mobile browsers (iPhone, Android)
- 📲 Tablets
- 🌐 Any device with internet access

---

## 🔐 Password Reset

To change a password:

1. **Edit the file:** `/src/app/pages/Login.tsx`
2. **Find the user:**
   ```typescript
   { email: 'cashier.com', password: 'Cash2026#', role: 'Cashier' },
   ```
3. **Change the password:**
   ```typescript
   { email: 'cashier.com', password: 'NewPassword123', role: 'Cashier' },
   ```
4. **Save the file**
5. **Refresh the app**

---

## ✅ Testing All Accounts

### Test Owner Account
1. Login as `william@boss.com` / `William2026`
2. Try to edit a client ✅ Should work
3. Try to delete a payment ✅ Should work
4. Access Data View page ✅ Should work

### Test Staff Account
1. Login as `cashier.com` / `Cash2026#`
2. Try to edit a client ❌ Should show error: "Access Denied"
3. Try to delete a payment ❌ Should show error: "Access Denied"
4. Try to access Data View ❌ Should show error: "Access Denied"
5. Record a new payment ✅ Should work

---

## 📞 Quick Access (Copy & Paste)

### Owner Login
```
william@boss.com
William2026
```

### Cashier Login
```
cashier.com
Cash2026#
```

### Gasasira (Field Officer)
```
gasasira.com
Gasasira2021
```

### Field Officer 2
```
field2.com
Field2@26
```

### Field Officer 3
```
field3.com
Field3@26
```

---

## 🎯 Recommended Usage

### Daily Operations (Staff)
- Use **`cashier.com`** or **`field1.com`** for:
  - Recording payments
  - Viewing client balances
  - Checking daily reports

### Management (Owner)
- Use **`william@boss.com`** for:
  - Adding new clients
  - Editing client details
  - Deleting incorrect records
  - Managing owner capital
  - Viewing all data
  - System maintenance

---

## 🔒 Security Best Practices

1. **Don't Share Owner Password**
   - Keep `william@boss.com` password private
   - Only use it when needed

2. **Use Staff Accounts Daily**
   - Give field officers their own accounts
   - Track who recorded each payment

3. **Regular Password Updates**
   - Change passwords periodically
   - Use strong passwords

4. **Logout When Done**
   - Always logout after use
   - Especially on shared devices

---

## ✅ Summary

**Total Accounts:** 5 users

**Owner Account (Full Access):**
- william@boss.com / William2026

**Staff Accounts (View + Record Only):**
- cashier.com / Cash2026#
- gasasira.com / Gasasira2021
- field2.com / Field2@26
- field3.com / Field3@26

**Remember:** Only `william@boss.com` can edit or delete data!

---

**Need Help?** All credentials are working and ready to use! Just copy and paste from above. 🔐

_© 2026 GITALA BRANCH - Uganda_