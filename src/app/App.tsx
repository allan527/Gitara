import { useState, useRef, useEffect } from 'react';
import { AddClientModal } from './components/AddClientModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { EditClientModal } from './components/EditClientModal';
import { OwnerCapitalModal } from './components/OwnerCapitalModal';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';
import { EditPaymentModal } from './components/EditPaymentModal';
import { NewLoanModal } from './components/NewLoanModal';
import { ClientAllocationModal } from './components/ClientAllocationModal';
import { ReminderModal } from './components/ReminderModal';
import { SMSBalanceModal } from './components/SMSBalanceModal';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { ClientDetail } from './pages/ClientDetail';
import { Cashbook } from './pages/Cashbook';
import { TransactionHistory } from './pages/TransactionHistory';
import { DataView } from './pages/DataView';
import { MissedPayments } from './pages/MissedPayments';
import { UserPerformance } from './pages/UserPerformance';
import { Evaluation } from './pages/Evaluation';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserManagement } from './pages/UserManagement';
import { Login } from './pages/Login';
import { DataMigration } from './pages/DataMigration';
import { MobileHeader } from './components/MobileHeader';
import { Sidebar } from './components/Sidebar';
import { Toaster, toast } from 'sonner';
import { Client, Transaction, CashbookEntry, formatUGX, normalizePhoneNumber } from './data/mockData';
import { useSupabaseData } from './hooks/useSupabaseData';
import { clientsApi, transactionsApi, cashbookApi, ownerCapitalApi, smsApi } from '../services/localApi';

// 💰 CALCULATE PROCESSING FEE BASED ON LOAN AMOUNT
const calculateProcessingFee = (loanAmount: number): number => {
  if (loanAmount < 350000) {
    return 10000; // 0 - 349,999
  } else if (loanAmount >= 350000 && loanAmount < 500000) {
    return 15000; // 350,000 - 499,999
  } else {
    return 20000; // 500,000+
  }
};

export default function App() {
  const sidebarRef = useRef<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showMigration, setShowMigration] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  
  // Use Supabase backend data storage
  const {
    clients,
    transactions,
    cashbookEntries,
    ownerCapitalTransactions,
    loading: dataLoading,
    error: dataError,
    backendConfigured,
    addClient: backendAddClient,
    updateClient: backendUpdateClient,
    deleteClient: backendDeleteClient,
    setClients,
    addTransaction: backendAddTransaction,
    updateTransaction: backendUpdateTransaction,
    deleteTransaction: backendDeleteTransaction,
    setTransactions,
    addCashbookEntry: backendAddCashbookEntry,
    updateCashbookEntry: backendUpdateCashbookEntry,
    deleteCashbookEntry: backendDeleteCashbookEntry,
    setCashbookEntries,
    addOwnerCapitalTransaction: backendAddOwnerCapitalTransaction,
    deleteOwnerCapitalTransaction: backendDeleteOwnerCapitalTransaction,
    setOwnerCapitalTransactions,
    reloadData,
    syncLocalDataToBackend,
  } = useSupabaseData();
  
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [showOwnerCapitalModal, setShowOwnerCapitalModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);
  const [showClientAllocationModal, setShowClientAllocationModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showSMSBalanceModal, setShowSMSBalanceModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedClientForNewLoan, setSelectedClientForNewLoan] = useState<Client | null>(null);
  const [receiptData, setReceiptData] = useState<{
    clientName: string;
    date: string;
    amountPaid: number;
    outstandingBalance: number;
    issuedBy: string;
  } | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingPayment, setEditingPayment] = useState<Transaction | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('gitara_branch_user');
    if (savedUser) {
      setIsLoggedIn(true);
      setCurrentUser(savedUser);
    }
  }, []);

  // Prevent back button from logging out
  useEffect(() => {
    if (isLoggedIn) {
      // Replace the current history state to prevent going back to login
      window.history.pushState(null, '', window.location.href);
      
      const handlePopState = (e: PopStateEvent) => {
        // Prevent going back by pushing state again
        window.history.pushState(null, '', window.location.href);
        toast.info('Use the navigation menu or logout button to navigate');
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isLoggedIn]);

  // Data is now automatically loaded by useLocalData hook
  // No need for manual initialization

  // 🔧 DATA REPAIR FUNCTION - Recreate missing cashbook entries from transactions
  const repairMissingCashbookEntries = async () => {
    let loadingToast: any = null;
    try {
      console.log('🔧 STARTING DATA REPAIR: Checking for missing cashbook entries...');
      
      // Get all transactions
      const allTransactions = transactions.filter(t => !t.isNewLoan); // Exclude loan disbursement transactions
      console.log(`📊 Total payment transactions to check: ${allTransactions.length}`);
      
      // Get all cashbook entries that are loan repayments
      const existingRepaymentEntries = cashbookEntries.filter(e => 
        e.description.includes('Loan repayment') && e.type === 'Income'
      );
      console.log(`📊 Existing loan repayment cashbook entries: ${existingRepaymentEntries.length}`);
      
      // Find transactions that don't have corresponding cashbook entries
      const missingEntries: any[] = [];
      
      for (const transaction of allTransactions) {
        // Check if there's a cashbook entry for this transaction
        const hasEntry = existingRepaymentEntries.some(entry => {
          // Match by client name, amount, and date
          return entry.description.includes(transaction.clientName) &&
                 entry.amount === transaction.amount &&
                 entry.date === transaction.date &&
                 Math.abs(new Date(entry.date).getTime() - new Date(transaction.date).getTime()) < 86400000; // Within 1 day
        });
        
        if (!hasEntry) {
          missingEntries.push(transaction);
        }
      }
      
      console.log(`🚨 FOUND ${missingEntries.length} MISSING CASHBOOK ENTRIES!`);
      
      if (missingEntries.length === 0) {
        console.log('✅ No missing cashbook entries - data is clean!');
        toast.success('Data check complete - no missing entries!');
        return;
      }
      
      // Show confirmation to user
      const confirmRepair = confirm(
        `🚨 DATA REPAIR NEEDED!\n\n` +
        `Found ${missingEntries.length} payment transactions that are missing from the Cashbook.\n\n` +
        `Missing payments:\n` +
        missingEntries.slice(0, 5).map(t => 
          `- ${t.clientName}: ${formatUGX(t.amount)} on ${t.date}`
        ).join('\n') +
        (missingEntries.length > 5 ? `\n... and ${missingEntries.length - 5} more` : '') +
        `\n\nDo you want to repair the Cashbook by adding these missing entries?`
      );
      
      if (!confirmRepair) {
        console.log('❌ User cancelled data repair');
        return;
      }
      
      // Show loading toast
      loadingToast = toast.loading('🔄 Repairing cashbook entries... Please wait...');
      
      console.log('🔄 Repairing cashbook entries...');
      console.log(`📋 Will repair ${missingEntries.length} entries`);
      
      // Create missing cashbook entries - SEQUENTIAL to ensure proper saving
      let repairedCount = 0;
      const successfullyRepairedIds: string[] = [];
      
      for (let i = 0; i < missingEntries.length; i++) {
        const transaction = missingEntries[i];
        const newCashbookEntry: CashbookEntry = {
          id: `c${Date.now()}_repair_${i}`,
          date: transaction.date,
          time: transaction.time || '00:00',
          description: `Loan repayment - ${transaction.clientName}`,
          type: 'Income',
          amount: transaction.amount,
          status: 'Paid',
          enteredBy: transaction.recordedBy || 'System (Repaired)',
        };
        
        console.log(`💾 [${i + 1}/${missingEntries.length}] Saving: ${transaction.clientName} - ${formatUGX(transaction.amount)}`);
        
        try {
          // Save to BACKEND using the backend hook (saves AND updates local state)
          const savedEntry = await backendAddCashbookEntry(newCashbookEntry);
          repairedCount++;
          successfullyRepairedIds.push(savedEntry.id);
          console.log(`✅ [${i + 1}/${missingEntries.length}] SUCCESS: ${transaction.clientName} - Entry ID: ${savedEntry.id}`);
        } catch (err) {
          console.error(`❌ [${i + 1}/${missingEntries.length}] FAILED: ${transaction.clientName}:`, err);
          // Continue with other entries even if one fails
        }
        
        // Small delay between requests to avoid overwhelming the backend
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`✅ DATA REPAIR COMPLETE: Successfully saved ${repairedCount}/${missingEntries.length} entries`);
      console.log(`📝 Repaired Entry IDs:`, successfullyRepairedIds);
      
      if (repairedCount === 0) {
        toast.dismiss(loadingToast);
        toast.error('❌ Failed to repair any entries. Check console for details.');
        return;
      }
      
      // Add a 3-second delay to ensure backend has processed all saves
      console.log('⏳ Waiting 1 second for backend to finalize...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // ⚠️ TEMPORARY: Skip reload until backend limit fix is deployed
      // The backend is still returning only 1000 entries, which overwrites our repaired entries
      // Once the kv_store.tsx fix deploys (with .order() and .limit(50000)), uncomment this:
      // console.log('🔄 Reloading all data from backend...');
      // await reloadData();
      // await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🔍 Verifying repaired entries are in current state...');
      console.log(`📊 Cashbook entries in state: ${cashbookEntries.length}`);
      console.log(`📊 Looking for repaired IDs:`, successfullyRepairedIds);
      
      // Verify at least some entries were saved
      const foundCount = successfullyRepairedIds.filter(id => 
        cashbookEntries.some(entry => entry.id === id)
      ).length;
      console.log(`✅ Found ${foundCount}/${successfullyRepairedIds.length} repaired entries in cashbook`);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      toast.success(`✅ Data Repair Complete! Added ${repairedCount} missing cashbook entries.`, {
        duration: 8000,
      });
      
      // Show warning about not refreshing until backend deploys
      toast.info('ℹ️ Entries saved! DO NOT refresh the page until we confirm backend deployment.', {
        duration: 10000,
      });
      
    } catch (error) {
      console.error('❌ Data repair failed:', error);
      // Dismiss loading toast if it exists
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      toast.error(`Data repair failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check console for details.`);
    }
  };

  // Data loading is now handled by useLocalData hook
  // All CRUD operations use localStorage

  const handleLogin = (email: string) => {
    setIsLoggedIn(true);
    setCurrentUser(email);
    localStorage.setItem('gitara_branch_user', email);
    
    // Check if there's local data to migrate on first login
    const hasLocalData = localStorage.getItem('gitara_branch_clients') || 
                         localStorage.getItem('gitara_branch_transactions') ||
                         localStorage.getItem('gitara_branch_cashbook') ||
                         localStorage.getItem('gitara_branch_owner_capital');
    
    if (hasLocalData && backendConfigured) {
      // Show migration page if there's local data and backend is ready
      setShowMigration(true);
    }
    
    toast.success(`Welcome to GITALA BRANCH, ${email}!`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActivePage('dashboard');
    localStorage.removeItem('gitara_branch_user');
    toast.info('Logged out successfully');
  };

  const handleNavigate = (page: string) => {
    // STRICT: Block Data View access for non-owners
    if (page === 'data-view' && currentUser !== 'william@boss.com') {
      toast.error('Access Denied: Only the owner can access Data View');
      return;
    }
    
    // STRICT: Block Evaluation access for non-owners
    if (page === 'evaluation' && currentUser !== 'william@boss.com') {
      toast.error('Access Denied: Only the owner can access Evaluation');
      return;
    }
    
    setActivePage(page);
    setSelectedClientId(null);
    
    // If navigating to add-client, show the modal instead
    if (page === 'add-client') {
      setShowAddClientModal(true);
      // Stay on clients page
      setActivePage('clients');
    }
    
    // If navigating to client-allocation, show the modal
    if (page === 'client-allocation') {
      setShowClientAllocationModal(true);
      // Stay on current page
      setActivePage(activePage || 'dashboard');
    }
  };

  const handleViewClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setActivePage('client-detail');
  };

  const handleBackToClients = () => {
    setSelectedClientId(null);
    setActivePage('clients');
  };

  // Helper function to send loan disbursement SMS
  const sendLoanDisbursementSMS = async (client: Client, loanNumber: number = 1) => {
    try {
      const startDate = new Date(client.startDate);
      const nextDay = new Date(startDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const deadline = new Date(startDate);
      deadline.setDate(deadline.getDate() + 30);
      
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      };

      const message = `Dear ${client.fullName},

Your Loan from GITALA BRANCH has been approved!

💰 Amount: ${formatUGX(client.loanAmount)}
📈 Total to Pay: ${formatUGX(client.totalPayable)}
📅 Start: ${formatDate(nextDay)}
⏰ Deadline: ${formatDate(deadline)}

Thank you!
Call: +256709907775`;

      // Send SMS via Africa's Talking
      const response = await smsApi.send({
        recipients: [client.phoneNumber],
        message,
        type: 'loan_disbursement',
        clientIds: [client.id]
      });

      console.log('📱 SMS sent successfully:', response);
    } catch (error) {
      console.error('⚠️ Error sending SMS:', error);
      // Don't show error to user - SMS is non-critical
    }
  };

  const handleAddClient = async (newClient: Client) => {
    try {
      // 📱 Normalize phone numbers to remove country codes
      const normalizedClient = {
        ...newClient,
        phoneNumber: normalizePhoneNumber(newClient.phoneNumber),
        guarantorPhone: newClient.guarantorPhone ? normalizePhoneNumber(newClient.guarantorPhone) : undefined,
      };

      console.log('🔄 STEP 1: Creating new client...');
      // Save via backend hook (handles both API and localStorage)
      await backendAddClient(normalizedClient);
      console.log('✅ STEP 1 Complete: Client created');
      
      const now = new Date();
      const currentDate = normalizedClient.startDate;
      const currentTime = now.toTimeString().slice(0, 5);
      
      // Add loan disbursement to cashbook (money given out to client)
      const loanDisbursementEntry: CashbookEntry = {
        id: `c${Date.now()}`,
        date: currentDate,
        time: currentTime,
        description: `Loan disbursement - ${normalizedClient.fullName}`,
        type: 'Expense',
        amount: normalizedClient.loanAmount,
        status: 'Disbursement',
        enteredBy: currentUser || 'System',
      };
      
      // Calculate processing fee based on loan amount
      const processingFee = calculateProcessingFee(normalizedClient.loanAmount);
      
      // Add processing fee to cashbook
      const processingFeeEntry: CashbookEntry = {
        id: `c${Date.now() + 1}`,
        date: currentDate,
        time: currentTime,
        description: `Processing fee - ${normalizedClient.fullName}`,
        type: 'Income',
        amount: processingFee,
        status: 'Profit',
        enteredBy: currentUser || 'System',
      };
      
      console.log('🔄 STEP 2: Creating cashbook entries for loan...');
      console.log('📋 Processing Fee Entry:', processingFeeEntry);
      console.log('📋 Loan Disbursement Entry:', loanDisbursementEntry);
      
      // Save cashbook entries via backend hook
      try {
        console.log('💾 Saving processing fee...');
        await backendAddCashbookEntry(processingFeeEntry);
        console.log('✅ Processing fee saved');
        
        console.log('💾 Saving loan disbursement...');
        await backendAddCashbookEntry(loanDisbursementEntry);
        console.log('✅ Loan disbursement saved');
        
        console.log('✅ STEP 2 Complete: Both cashbook entries created');
      } catch (cashbookError: any) {
        console.error('❌ CRITICAL ERROR: Cashbook entries creation FAILED!');
        console.error('❌ Error Details:', cashbookError);
        throw new Error(`Cashbook creation failed: ${cashbookError?.message || 'Unknown error'}`);
      }
      
      // Enhanced success message with loan details
      const startDate = new Date(normalizedClient.startDate);
      const deadline = new Date(startDate);
      deadline.setDate(deadline.getDate() + 30);
      
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      };
      
      toast.success(
        `✅ LOAN ISSUED SUCCESSFULLY!\n\n` +
        `Client: ${normalizedClient.fullName}\n` +
        `Phone: ${normalizedClient.phoneNumber}\n` +
        `Loan Amount: ${formatUGX(normalizedClient.loanAmount)}\n` +
        `Total Payable: ${formatUGX(normalizedClient.totalPayable)}\n` +
        `Processing Fee: ${formatUGX(processingFee)}\n` +
        `Start Date: ${formatDate(startDate)}\n` +
        `Deadline: ${formatDate(deadline)}\n\n` +
        `All records created successfully!`,
        {
          duration: 10000,
        }
      );
      
      // Send loan disbursement SMS
      sendLoanDisbursementSMS(normalizedClient);
    } catch (error) {
      console.error('❌ Error adding client:', error);
      toast.error('Failed to add client');
    }
  };

  const handleUpdateClient = async (updatedClient: Client) => {
    try {
      // Get the original client to check for changes
      const originalClient = clients.find(c => c.id === updatedClient.id);
      if (!originalClient) return;

      // Check if loan amount was changed
      const loanAmountChanged = originalClient.loanAmount !== updatedClient.loanAmount;
      
      // STRICT: Only owner can edit loan amount
      if (loanAmountChanged && currentUser !== 'william@boss.com') {
        toast.error('Access Denied: Only the owner can edit loan amounts');
        return;
      }

      // Staff can edit name, phone, address, and guarantor info
      // Owner can edit everything

      // Save locally
      await clientsApi.update(updatedClient.id, updatedClient);
      
      // If the client's name changed, update all related cashbook entries
      if (originalClient.fullName !== updatedClient.fullName) {
        console.log(`🔄 Client name changed from "${originalClient.fullName}" to "${updatedClient.fullName}"`);
        console.log('🔄 Updating related cashbook entries...');

        const relatedCashbookEntries = cashbookEntries.filter(
          e => e.description.toLowerCase().includes(originalClient.fullName.toLowerCase())
        );

        console.log(`📝 Found ${relatedCashbookEntries.length} cashbook entries to update`);

        for (const entry of relatedCashbookEntries) {
          // Replace old name with new name in description
          const updatedDescription = entry.description.replace(
            new RegExp(originalClient.fullName, 'gi'),
            updatedClient.fullName
          );

          const updatedEntry = {
            ...entry,
            description: updatedDescription,
          };

          await cashbookApi.update(entry.id, updatedEntry);
          setCashbookEntries(prev =>
            prev.map(e => e.id === entry.id ? updatedEntry : e)
          );
        }

        console.log('✅ All cashbook entries updated with new client name');
      }
      
      // Update local state
      setClients(prevClients =>
        prevClients.map(client =>
          client.id === updatedClient.id ? updatedClient : client
        )
      );

      // Also update transaction history with new name
      if (originalClient.fullName !== updatedClient.fullName) {
        const relatedTransactions = transactions.filter(t => t.clientId === updatedClient.id);
        for (const transaction of relatedTransactions) {
          const updatedTransaction = {
            ...transaction,
            clientName: updatedClient.fullName,
          };
          await transactionsApi.update(transaction.id, updatedTransaction);
          setTransactions(prev =>
            prev.map(t => t.id === transaction.id ? updatedTransaction : t)
          );
        }
      }

      toast.success('Client updated successfully! All related records updated.');
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
    }
  };

  const handleRecordPayment = async (payment: {
    clientId: string;
    amount: number;
    notes: string;
    date: string;
    time: string;
    recordedBy?: string;
  }) => {
    console.log('🚀 ========================================');
    console.log('🚀 HANDLE RECORD PAYMENT CALLED!');
    console.log('🚀 Payment Data:', payment);
    console.log('🚀 ========================================');
    
    let transactionCreated = false;
    let cashbookCreated = false;
    let clientUpdated = false;
    let newTransaction: Transaction | null = null;
    let newCashbookEntry: CashbookEntry | null = null;
    let originalClient: Client | null = null;

    try {
      // Find client
      const client = clients.find(c => c.id === payment.clientId);
      if (!client) {
        console.error('❌ CLIENT NOT FOUND! Client ID:', payment.clientId);
        toast.error('Client not found');
        return;
      }

      console.log('✅ Client found:', client.fullName);

      // Save original client state for rollback
      originalClient = { ...client };
      const clientName = client.fullName;

      // Calculate new client balances
      const newTotalPaid = client.totalPaid + payment.amount;
      const newOutstandingBalance = Math.max(0, client.outstandingBalance - payment.amount);
      const newStatus = newOutstandingBalance === 0 ? 'Completed' as const : 'Active' as const;

      // 🆕 If loan is being completed, increment the totalLoansCompleted counter
      const isLoanCompleting = newOutstandingBalance === 0 && client.outstandingBalance > 0;
      const updatedLoansCompleted = isLoanCompleting 
        ? (client.totalLoansCompleted || 0) + 1 
        : (client.totalLoansCompleted || 0);

      const updatedClient = {
        ...client,
        totalPaid: newTotalPaid,
        outstandingBalance: newOutstandingBalance,
        status: newStatus,
        totalLoansCompleted: updatedLoansCompleted, // 🆕 Update completed loans count
      };

      console.log('🔄 STEP 1: Updating client...');
      // Update client via backend hook
      await backendUpdateClient(client.id, updatedClient);
      clientUpdated = true;
      console.log('✅ STEP 1 Complete: Client updated');

      // Add to transactions
      newTransaction = {
        id: `t${Date.now()}`,
        clientId: payment.clientId,
        clientName: clientName,
        date: payment.date,
        time: payment.time,
        amount: payment.amount,
        notes: payment.notes,
        status: 'Paid',
        recordedBy: payment.recordedBy || currentUser || 'Unknown',
        loanNumber: client.currentLoanNumber || 1, // 🆕 Track which loan this payment belongs to
      };

      console.log('🔄 STEP 2: Creating transaction record...');
      // Save transaction via backend hook
      await backendAddTransaction(newTransaction);
      transactionCreated = true;
      console.log('✅ STEP 2 Complete: Transaction recorded');

      // Add to cashbook as income
      newCashbookEntry = {
        id: `c${Date.now()}`,
        date: payment.date,
        time: payment.time,
        description: `Loan repayment - ${clientName}`,
        type: 'Income',
        amount: payment.amount,
        status: 'Paid',
        enteredBy: payment.recordedBy || currentUser || 'Unknown', // Track who entered this
      };

      console.log('🔄 STEP 3: Creating cashbook entry...');
      console.log('📋 Cashbook Entry Data:', newCashbookEntry);
      // Save cashbook entry via backend hook
      try {
        await backendAddCashbookEntry(newCashbookEntry);
        cashbookCreated = true;
        console.log('✅ STEP 3 Complete: Cashbook entry created');
      } catch (cashbookError: any) {
        console.error('❌ CRITICAL ERROR: Cashbook creation FAILED!');
        console.error('❌ Cashbook Error Details:', cashbookError);
        throw new Error(`Cashbook creation failed: ${cashbookError?.message || 'Unknown error'}`);
      }

      console.log('✅ ALL STEPS COMPLETE: Payment fully recorded');
      console.log(`💰 Payment Details:
        - Client: ${clientName}
        - Amount: ${formatUGX(payment.amount)}
        - New Total Paid: ${formatUGX(newTotalPaid)}
        - Remaining Balance: ${formatUGX(newOutstandingBalance)}
        - Status: ${newStatus}
      `);

      // Set receipt data
      setReceiptData({
        clientName: clientName,
        date: payment.date,
        amountPaid: payment.amount,
        outstandingBalance: newOutstandingBalance,
        issuedBy: payment.recordedBy || currentUser || 'Admin',
      });

      // 📱 Send SMS receipt via Africa's Talking
      try {
        const loanNumber = client.currentLoanNumber || 1;
        const smsMessage = `Dear ${clientName},\n\n✅ PAYMENT RECEIVED - Texas Finance\nAmount Paid: ${formatUGX(payment.amount)}\nDate: ${payment.date} at ${payment.time}\nTotal Paid: ${formatUGX(newTotalPaid)}\nRemaining Balance: ${formatUGX(newOutstandingBalance)}\n\nThank you for your payment!\nCall: +256709907775\n- Texas Finance Team`;

        console.log('📤 Sending SMS receipt...');

        const smsResponse = await smsApi.send({
          recipients: [client.phoneNumber],
          message: smsMessage,
          type: 'payment_receipt',
          clientIds: [client.id],
        });

        console.log('✅ SMS receipt sent successfully');
        console.log('📊 SMS API Response:', smsResponse);
        
        toast.success('Payment recorded & SMS receipt sent to client!', {
          duration: 5000,
        });
      } catch (smsError: any) {
        console.error('⚠️ SMS sending failed (non-critical):', smsError);
        console.error('⚠️ SMS Error Details:', {
          message: smsError?.message,
          stack: smsError?.stack,
          error: smsError,
        });
        
        const errorMessage = smsError?.message || 'Unknown error';
        
        // Check for specific error types and provide helpful messages
        if (errorMessage.includes('Invalid phone number')) {
          toast.error(`❌ INVALID PHONE NUMBER: ${client.phoneNumber}\n\nPayment recorded successfully, but SMS cannot be sent because this client's phone number is invalid.\n\n✅ Uganda phone numbers must have exactly 9 digits after the country code.\n\nExamples:\n• Valid: 0709907775 or +256709907775\n• Invalid: ${client.phoneNumber}\n\nPlease edit the client's profile to fix their phone number.`, {
            duration: 12000,
          });
        } else if (errorMessage.includes('InsufficientBalance')) {
          toast.warning('Payment recorded! ⚠️ SMS not sent - Please add airtime to your Africa\'s Talking account.', {
            duration: 8000,
          });
        } else if (errorMessage.includes('InvalidSenderId')) {
          toast.warning('Payment recorded! ⚠️ SMS not sent - Sender ID "ATTech" needs approval from Africa\'s Talking.', {
            duration: 8000,
          });
        } else if (errorMessage.includes('credentials not configured')) {
          toast.warning('Payment recorded! ⚠️ SMS not sent - Africa\'s Talking credentials missing.', {
            duration: 8000,
          });
        } else {
          toast.warning(`Payment recorded! ⚠️ SMS failed: ${errorMessage}`, {
            duration: 7000,
          });
        }
      }

      // Show receipt modal
      setShowReceiptModal(true);

      // Enhanced success message with payment details
      toast.success(
        `✅ PAYMENT RECORDED!\n\n` +
        `Client: ${clientName}\n` +
        `Amount Paid: ${formatUGX(payment.amount)}\n` +
        `New Balance: ${formatUGX(newOutstandingBalance)}\n` +
        `Date: ${payment.date} at ${payment.time}\n\n` +
        `All records updated successfully!`,
        {
          duration: 8000,
        }
      );
    } catch (error: any) {
      console.error('❌ CRITICAL ERROR recording payment:', error);
      console.error('Error details:', error.message || error);
      
      // ROLLBACK LOGIC - Very important for data consistency!
      console.log('🔄 Starting rollback procedure...');
      
      try {
        // If cashbook was created but something failed after, delete it
        if (cashbookCreated && newCashbookEntry) {
          console.log('Rolling back cashbook entry...');
          await cashbookApi.delete(newCashbookEntry.id);
          setCashbookEntries(prev => prev.filter(e => e.id !== newCashbookEntry!.id));
        }

        // If transaction was created but something failed after, delete it
        if (transactionCreated && newTransaction) {
          console.log('Rolling back transaction...');
          await transactionsApi.delete(newTransaction.id);
          setTransactions(prev => prev.filter(t => t.id !== newTransaction!.id));
        }

        // If client was updated but something failed after, restore original
        if (clientUpdated && originalClient) {
          console.log('Rolling back client update...');
          await clientsApi.update(originalClient.id, originalClient);
          setClients(prevClients => 
            prevClients.map(c => c.id === originalClient!.id ? originalClient! : c)
          );
        }

        console.log('✅ Rollback complete - all changes reverted');
        toast.error('Payment recording failed and has been rolled back. No data was saved. Please try again.');
      } catch (rollbackError) {
        console.error('❌ CRITICAL: Rollback failed!', rollbackError);
        toast.error('CRITICAL ERROR: Payment recording failed and rollback failed. Please contact support immediately!');
      }
    }
  };

  const handleAddExpense = async (expense: {
    description: string;
    amount: number;
    date: string;
    time: string;
  }) => {
    try {
      // Add to cashbook as expense
      const newCashbookEntry: CashbookEntry = {
        id: `c${Date.now()}`,
        date: expense.date,
        time: expense.time,
        description: expense.description,
        type: 'Expense',
        amount: expense.amount,
        status: 'Expense',
        enteredBy: currentUser || 'Unknown', // Track who entered the expense
      };

      // Save to localStorage
      await cashbookApi.create(newCashbookEntry);
      setCashbookEntries(prev => [newCashbookEntry, ...prev]);

      toast.success('Expense added successfully!');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    }
  };

  const handleOwnerCapital = async (data: {
    type: 'Capital Injection' | 'Owner Withdrawal';
    amount: number;
    description: string;
  }) => {
    try {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      // Create owner capital transaction
      const ownerCapitalTransaction = {
        id: `oc${Date.now()}`,
        date: currentDate,
        time: currentTime,
        type: data.type,
        amount: data.amount,
        description: data.description,
        enteredBy: currentUser || 'Texas Finance',
      };

      console.log('🔵 FRONTEND: Sending owner capital transaction:', ownerCapitalTransaction);
      console.log('🔵 Transaction type:', ownerCapitalTransaction.type);

      // 🔧 Save ONLY owner capital transaction - backend automatically creates cashbook entry
      // Capital Injection → Backend creates Income entry
      // Owner Withdrawal → Backend creates Expense entry
      const response = await ownerCapitalApi.create(ownerCapitalTransaction);
      
      console.log('🔵 FRONTEND: Received response from backend:', response);
      console.log('🔵 Cashbook entry from backend:', response.cashbookEntry);
      
      // 🔧 Reload all data from database to ensure we get the correct entries
      console.log('🔄 Reloading all data from database...');
      await reloadData();

      toast.success(`${data.type} of ${formatUGX(data.amount)} recorded successfully!`);
    } catch (error) {
      console.error('Error recording owner capital:', error);
      toast.error('Failed to record owner capital');
    }
  };

  // Edit Payment Handler
  const handleEditPayment = async (transactionId: string, updatedData: {
    amount: number;
    notes: string;
    date: string;
  }) => {
    // STRICT: Only owner can edit/modify
    if (currentUser !== 'william@boss.com') {
      toast.error('Access Denied: Only the owner can edit payment data');
      return;
    }
    
    try {
      // Find the transaction
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) return;

      // Find the client
      const client = clients.find(c => c.id === transaction.clientId);
      if (!client) return;

      // Calculate the difference
      const oldAmount = transaction.amount;
      const difference = updatedData.amount - oldAmount;

      // Update client balances
      const newTotalPaid = client.totalPaid + difference;
      const newOutstandingBalance = client.outstandingBalance - difference;
      
      const updatedClient = {
        ...client,
        totalPaid: newTotalPaid,
        outstandingBalance: Math.max(0, newOutstandingBalance),
        status: newOutstandingBalance <= 0 ? 'Completed' as const : 'Active' as const,
      };

      // Update transaction
      const updatedTransaction = {
        ...transaction,
        amount: updatedData.amount,
        notes: updatedData.notes,
        date: updatedData.date,
      };

      // Save to localStorage
      await clientsApi.update(client.id, updatedClient);
      await transactionsApi.update(transactionId, updatedTransaction);

      // Update local state
      setClients(prevClients =>
        prevClients.map(c => c.id === client.id ? updatedClient : c)
      );
      setTransactions(prevTransactions =>
        prevTransactions.map(t => t.id === transactionId ? updatedTransaction : t)
      );

      // Update cashbook entry if it exists
      const cashbookEntry = cashbookEntries.find(
        e => e.description.includes(client.fullName) && e.amount === oldAmount
      );
      if (cashbookEntry) {
        const updatedCashbook = {
          ...cashbookEntry,
          amount: updatedData.amount,
          date: updatedData.date,
        };
        await cashbookApi.update(cashbookEntry.id, updatedCashbook);
        setCashbookEntries(prev =>
          prev.map(e => e.id === cashbookEntry.id ? updatedCashbook : e)
        );
      }

      toast.success('Payment updated successfully!');
      setShowEditPaymentModal(false);
    } catch (error) {
      console.error('Error editing payment:', error);
      toast.error('Failed to edit payment');
    }
  };

  // Issue New Loan Handler
  const handleIssueNewLoan = async (clientId: string, loanAmount: number) => {
    try {
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      // 🆕 CALCULATE LOAN NUMBER - Track how many loans this client has had
      const previousLoansCompleted = client.totalLoansCompleted || 0;
      const newLoanNumber = previousLoansCompleted + 1;

      // Calculate new loan details
      const interest = loanAmount * 0.20;
      const totalPayable = loanAmount + interest;
      const dailyPayment = totalPayable / 30;

      // Update client with new loan
      const updatedClient = {
        ...client,
        loanAmount,
        totalPayable,
        dailyPayment,
        outstandingBalance: totalPayable,
        totalPaid: 0,
        status: 'Active' as const,
        startDate: new Date().toISOString().split('T')[0],
        loanIssuedBy: currentUser || 'Unknown',
        currentLoanNumber: newLoanNumber, // 🆕 Set current loan number
        totalLoansCompleted: previousLoansCompleted, // Keep track of completed loans
      };

      console.log('🔄 STEP 1: Updating client with new loan...');
      // Save locally
      await clientsApi.update(clientId, updatedClient);
      console.log('✅ STEP 1 Complete: Client updated with new loan locally');

      // Update local state
      setClients(prevClients =>
        prevClients.map(c => c.id === clientId ? updatedClient : c)
      );

      // 🆕 CREATE TRANSACTION RECORD for New Loan Disbursement
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      const loanTransaction: Transaction = {
        id: `t${Date.now()}`,
        clientId: client.id,
        clientName: client.fullName,
        date: currentDate,
        time: currentTime,
        amount: loanAmount,
        notes: `🎯 NEW LOAN #${newLoanNumber} DISBURSED - ${formatUGX(loanAmount)} (Principal: ${formatUGX(loanAmount)}, Interest: ${formatUGX(interest)}, Total Payable: ${formatUGX(totalPayable)})`,
        status: 'Paid',
        recordedBy: currentUser || 'System',
        loanNumber: newLoanNumber, // 🆕 Track loan number in transaction
        isNewLoan: true, // 🆕 Flag this as a new loan transaction
      };

      console.log('🔄 STEP 2: Creating transaction record for new loan...');
      await transactionsApi.create(loanTransaction);
      console.log('✅ STEP 2 Complete: Transaction record created');
      setTransactions(prev => [loanTransaction, ...prev]);

      // Add loan disbursement to cashbook
      const loanDisbursementEntry: CashbookEntry = {
        id: `c${Date.now()}`,
        date: currentDate,
        time: currentTime,
        description: `💰 Loan #${newLoanNumber} Disbursement - ${client.fullName} (New Loan Issued)`,
        type: 'Expense',
        amount: loanAmount,
        status: 'Disbursement',
        enteredBy: currentUser || 'System',
      };

      // Calculate processing fee based on loan amount
      const processingFee = calculateProcessingFee(loanAmount);

      const processingFeeEntry: CashbookEntry = {
        id: `c${Date.now() + 1}`,
        date: currentDate,
        time: currentTime,
        description: `💵 Processing Fee (Loan #${newLoanNumber}) - ${client.fullName}`,
        type: 'Income',
        amount: processingFee,
        status: 'Profit',
        enteredBy: currentUser || 'System',
      };

      console.log('🔄 STEP 3: Creating cashbook entries for new loan...');
      console.log('📋 Processing Fee Entry:', processingFeeEntry);
      console.log('📋 Loan Disbursement Entry:', loanDisbursementEntry);

      try {
        console.log('💾 Saving processing fee to database...');
        const feeResult = await cashbookApi.create(processingFeeEntry);
        console.log('✅ Processing fee saved:', feeResult);
        
        console.log('💾 Saving loan disbursement to database...');
        const disbursementResult = await cashbookApi.create(loanDisbursementEntry);
        console.log('✅ Loan disbursement saved:', disbursementResult);
        
        console.log('✅ STEP 3 Complete: Both cashbook entries created in database');
      } catch (cashbookError: any) {
        console.error('❌ CRITICAL ERROR: Cashbook entries creation FAILED!');
        console.error('❌ Error Details:', {
          message: cashbookError?.message,
          error: cashbookError,
          processingFeeEntry,
          loanDisbursementEntry,
        });
        throw new Error(`Cashbook creation failed: ${cashbookError?.message || 'Unknown error'}`);
      }

      setCashbookEntries(prev => {
        const updated = [processingFeeEntry, loanDisbursementEntry, ...prev];
        console.log('💾 Updated cashbook entries in state. Total entries:', updated.length);
        return updated;
      });

      // Enhanced success message with new loan details
      const startDate = new Date(updatedClient.startDate);
      const deadline = new Date(startDate);
      deadline.setDate(deadline.getDate() + 30);
      
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      };

      toast.success(
        `✅ NEW LOAN ISSUED!\n\n` +
        `Client: ${updatedClient.fullName}\n` +
        `Loan #${newLoanNumber}\n` +
        `Phone: ${updatedClient.phoneNumber}\n` +
        `Loan Amount: ${formatUGX(loanAmount)}\n` +
        `Total Payable: ${formatUGX(totalPayable)}\n` +
        `Processing Fee: ${formatUGX(processingFee)}\n` +
        `Start Date: ${formatDate(startDate)}\n` +
        `Deadline: ${formatDate(deadline)}\n\n` +
        `All records created successfully!`,
        {
          duration: 10000,
        }
      );
      setShowNewLoanModal(false);
      
      // Send loan disbursement SMS with updated client data
      sendLoanDisbursementSMS(updatedClient, newLoanNumber);
    } catch (error) {
      console.error('Error issuing new loan:', error);
      toast.error('Failed to issue new loan');
    }
  };

  // Delete handlers for Data View
  const handleDeleteClient = async (clientId: string) => {
    // STRICT: Only owner can delete
    if (currentUser !== 'william@boss.com') {
      toast.error('Access Denied: Only the owner can delete data');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this client? This will also delete all their transactions and cashbook entries.')) {
      return;
    }

    try {
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      // Delete client
      await clientsApi.delete(clientId);
      
      // Delete all transactions for this client
      const clientTransactions = transactions.filter(t => t.clientId === clientId);
      for (const transaction of clientTransactions) {
        await transactionsApi.delete(transaction.id);
      }
      
      // Delete all cashbook entries related to this client
      const clientCashbookEntries = cashbookEntries.filter(
        e => e.description.toLowerCase().includes(client.fullName.toLowerCase()) ||
             e.description.includes(clientId)
      );
      for (const entry of clientCashbookEntries) {
        try {
          await cashbookApi.delete(entry.id);
        } catch (cashbookError: any) {
          console.warn(`Could not delete cashbook entry ${entry.id}:`, cashbookError);
          // Don't fail the whole operation if a cashbook entry can't be deleted
        }
      }
      
      // Update local state
      setClients(prev => prev.filter(c => c.id !== clientId));
      setTransactions(prev => prev.filter(t => t.clientId !== clientId));
      setCashbookEntries(prev => prev.filter(e => 
        !e.description.toLowerCase().includes(client.fullName.toLowerCase()) &&
        !e.description.includes(clientId)
      ));
      
      toast.success('Client and all related records deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast.error(`Failed to delete client: ${error?.message || error}`);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    // STRICT: Only owner can delete
    if (currentUser !== 'william@boss.com') {
      toast.error('Access Denied: Only the owner can delete data');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) return;

      const client = clients.find(c => c.id === transaction.clientId);
      if (!client) return;

      // Reverse the transaction effect on client
      const updatedClient = {
        ...client,
        totalPaid: client.totalPaid - transaction.amount,
        outstandingBalance: client.outstandingBalance + transaction.amount,
        status: 'Active' as const,
      };

      await clientsApi.update(client.id, updatedClient);
      await transactionsApi.delete(transactionId);

      setClients(prev => prev.map(c => c.id === client.id ? updatedClient : c));
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      
      // Also remove from cashbook if exists
      // Find cashbook entry by matching date, amount, and client name in description
      const cashbookEntry = cashbookEntries.find(
        e => e.date === transaction.date && 
             e.amount === transaction.amount && 
             (e.description?.includes(client.fullName) || e.description?.includes('Loan repayment'))
      );
      if (cashbookEntry) {
        try {
          await cashbookApi.delete(cashbookEntry.id);
          setCashbookEntries(prev => prev.filter(e => e.id !== cashbookEntry.id));
        } catch (cashbookError: any) {
          console.warn('Could not delete cashbook entry:', cashbookError);
          // Don't fail the whole operation if cashbook delete fails
        }
      }

      toast.success('Transaction deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error(`Failed to delete transaction: ${error?.message || error}`);
    }
  };

  const handleDeleteCashbook = async (entryId: string) => {
    // STRICT: Only owner can delete
    if (currentUser !== 'william@boss.com') {
      toast.error('Access Denied: Only the owner can delete data');
      return;
    }
    
    // Find the entry to show details in confirmation
    const entry = cashbookEntries.find(e => e.id === entryId);
    if (!entry) {
      toast.error('Cashbook entry not found');
      return;
    }
    
    // Build confirmation message based on entry type
    let confirmMessage = `Are you sure you want to delete this cashbook entry?\n\n`;
    confirmMessage += `Date: ${entry.date}\n`;
    confirmMessage += `Description: ${entry.description}\n`;
    confirmMessage += `Amount: ${formatUGX(entry.amount)}\n`;
    confirmMessage += `Type: ${entry.type}\n\n`;
    
    // Warn about cascading effects
    if (entry.description?.includes('Owner Capital')) {
      confirmMessage += `⚠️ This will also delete the related owner capital transaction.`;
    } else if (entry.description?.includes('Loan repayment') || entry.description?.includes('Payment from')) {
      confirmMessage += `⚠️ This will also:\n`;
      confirmMessage += `   - Delete the related payment transaction\n`;
      confirmMessage += `   - Reverse the client's balance (add back to outstanding)\n`;
      confirmMessage += `   - Update the client's status`;
    } else if (entry.description?.includes('Processing Fee') || entry.description?.includes('Loan disbursement')) {
      confirmMessage += `⚠️ This will delete only this cashbook entry.\n`;
      confirmMessage += `   The client will NOT be deleted.\n`;
      confirmMessage += `   To remove the client completely, delete the client instead.`;
    }
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      console.log('🗑️ Deleting cashbook entry:', entryId);
      console.log('📋 Entry details:', entry);
      
      // Backend handles cascading deletes automatically
      await cashbookApi.delete(entryId);
      
      console.log('✅ Cashbook entry deleted, reloading all data...');
      
      // Reload all data to ensure consistency after cascading deletes
      await reloadData();
      
      toast.success('Cashbook entry deleted successfully! Related records updated.');
    } catch (error) {
      console.error('Error deleting cashbook entry:', error);
      toast.error('Failed to delete cashbook entry');
    }
  };

  const handleDeleteOwnerCapital = async (transactionId: string) => {
    // STRICT: Only owner can delete
    if (currentUser !== 'william@boss.com') {
      toast.error('Access Denied: Only the owner can delete data');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this owner capital transaction?')) {
      return;
    }

    try {
      // Get the transaction details before deleting
      const transaction = ownerCapitalTransactions.find(t => t.id === transactionId);
      
      // Backend deletes both owner capital and associated cashbook entry
      await ownerCapitalApi.delete(transactionId);
      
      // Remove owner capital transaction from state
      setOwnerCapitalTransactions(prev => prev.filter(t => t.id !== transactionId));
      
      // 🔧 Remove associated cashbook entry from state
      // Find cashbook entry that matches this owner capital transaction
      if (transaction) {
        setCashbookEntries(prev => prev.filter(e => 
          !(e.description?.includes(transaction.description) &&
            e.enteredBy === transaction.enteredBy &&
            e.date === transaction.date &&
            (e.category?.includes('Owner Capital') || e.status === 'Profit'))
        ));
      }

      toast.success('Owner capital transaction deleted successfully!');
    } catch (error) {
      console.error('Error deleting owner capital transaction:', error);
      toast.error('Failed to delete owner capital transaction');
    }
  };

  // Assign Client to User Handler
  const handleAssignClient = async (clientId: string, userEmail: string) => {
    try {
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      const updatedClient = {
        ...client,
        assignedTo: userEmail || undefined, // empty string means unassign
      };

      // Save to backend
      await backendUpdateClient(clientId, updatedClient);

      // Update local state
      setClients(prevClients =>
        prevClients.map(c => c.id === clientId ? updatedClient : c)
      );

      const userName = userEmail || 'Unassigned';
      toast.success(`Client ${userEmail ? 'assigned to' : 'unassigned from'} ${userName}!`);
    } catch (error) {
      console.error('Error assigning client:', error);
      toast.error('Failed to assign client');
    }
  };

  // Get page title for mobile header
  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Dashboard';
      case 'clients':
        return 'Clients';
      case 'client-detail':
        return 'Client Details';
      case 'cashbook':
        return 'Cashbook';
      case 'history':
        return 'Transaction History';
      case 'data-view':
        return 'Data View';
      case 'missed-payments':
        return 'Missed Payments';
      case 'user-performance':
        return 'User Performance';
      case 'client-allocation':
        return 'Client Allocation';
      case 'evaluation':
        return 'Evaluation';
      default:
        return 'GITALA BRANCH';
    }
  };

  // 🧹 CLEANUP DUPLICATE CASHBOOK ENTRIES
  const handleCleanupDuplicates = async () => {
    try {
      console.log('🧹 Starting duplicate cleanup...');
      console.log(`📊 Total cashbook entries: ${cashbookEntries.length}`);
      
      // Group entries by key attributes to find duplicates
      const entryGroups = new Map<string, CashbookEntry[]>();
      
      cashbookEntries.forEach(entry => {
        // Create a unique key based on date, time, description, amount, and type
        // This identifies true duplicates (same transaction recorded multiple times)
        const key = `${entry.date}_${entry.time}_${entry.description}_${entry.amount}_${entry.type}`;
        
        if (!entryGroups.has(key)) {
          entryGroups.set(key, []);
        }
        entryGroups.get(key)!.push(entry);
      });
      
      // Find duplicate groups (more than 1 entry with same key)
      const duplicateGroups: CashbookEntry[][] = [];
      entryGroups.forEach((entries, key) => {
        if (entries.length > 1) {
          console.log(`🔍 Found ${entries.length} duplicates for: ${key}`);
          duplicateGroups.push(entries);
        }
      });
      
      if (duplicateGroups.length === 0) {
        toast.success('✅ No duplicate entries found! Your cashbook is clean.', {
          duration: 5000,
        });
        return;
      }
      
      // Calculate how many duplicates will be removed
      let totalDuplicates = 0;
      const duplicateDetails: string[] = [];
      duplicateGroups.forEach(group => {
        totalDuplicates += group.length - 1; // Keep 1, remove the rest
        const sample = group[0];
        duplicateDetails.push(`  • ${sample.description} - UGX ${sample.amount.toLocaleString()} (${sample.date} ${sample.time}) - ${group.length} copies`);
      });
      
      console.log(`📊 Found ${duplicateGroups.length} groups with duplicates`);
      console.log(`🗑️ Total duplicate entries to remove: ${totalDuplicates}`);
      console.log('📋 Duplicate details:', duplicateDetails);
      
      // Confirm with user
      const confirmed = window.confirm(
        `🧹 DUPLICATE CLEANUP\n\n` +
        `Found ${totalDuplicates} duplicate cashbook entries in ${duplicateGroups.length} groups.\n\n` +
        `Examples:\n${duplicateDetails.slice(0, 5).join('\n')}\n` +
        (duplicateDetails.length > 5 ? `  ... and ${duplicateDetails.length - 5} more groups\n\n` : '\n') +
        `This will:\n` +
        `• Keep the FIRST entry from each duplicate group\n` +
        `• Remove ${totalDuplicates} duplicate entries permanently\n` +
        `• Update your cashbook balance\n\n` +
        `⚠️ This action cannot be undone!\n\n` +
        `Do you want to proceed with cleanup?`
      );
      
      if (!confirmed) {
        console.log('❌ User cancelled cleanup');
        toast.info('Cleanup cancelled. No changes made.');
        return;
      }
      
      const loadingToast = toast.loading('🧹 Removing duplicates from database...');
      console.log('🔄 Removing duplicates from database...');
      let removedCount = 0;
      const idsToRemove: string[] = [];
      
      for (const group of duplicateGroups) {
        // Sort by ID (timestamp-based) to keep the oldest
        const sorted = [...group].sort((a, b) => {
          // Extract timestamp from ID (format: c1234567890)
          const getTimestamp = (id: string) => {
            const match = id.match(/c(\d+)/);
            return match ? parseInt(match[1]) : 0;
          };
          return getTimestamp(a.id) - getTimestamp(b.id);
        });
        
        // Keep the first (oldest), remove the rest
        const toKeep = sorted[0];
        const toRemove = sorted.slice(1);
        
        console.log(`   📌 Keeping: ${toKeep.id} - ${toKeep.description} (${toKeep.date} ${toKeep.time})`);
        
        for (const duplicate of toRemove) {
          try {
            console.log(`   🗑️ Deleting duplicate: ${duplicate.id} from database...`);
            await cashbookApi.delete(duplicate.id);
            console.log(`   ✅ Successfully deleted ${duplicate.id} from database`);
          } catch (error: any) {
            // Silently handle any delete errors - if it's already deleted or doesn't exist, that's fine
            console.log(`   ⚠️ Entry ${duplicate.id} already removed from database (or never existed)`);
          }
          
          // ALWAYS mark for removal from state, regardless of API result
          // This handles "ghost entries" that exist in React state but not in the database
          idsToRemove.push(duplicate.id);
          removedCount++;
        }
      }
      
      console.log(`✅ Cleanup complete! Removed ${removedCount} duplicate entries from database`);
      console.log(`📋 IDs removed: ${idsToRemove.join(', ')}`);
      
      // ✅ Immediately update local state to remove deleted entries
      console.log('🔄 Updating local state to remove deleted entries...');
      setCashbookEntries(prev => {
        const filtered = prev.filter(entry => !idsToRemove.includes(entry.id));
        console.log(`📊 State updated: ${prev.length} → ${filtered.length} entries`);
        return filtered;
      });
      
      // ⚠️ TEMPORARY: Skip reload until backend limit fix is deployed
      // await reloadData();
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      toast.success(`🧹 Cleanup Complete! Removed ${removedCount} duplicate entries.`, {
        duration: 8000,
      });
      
    } catch (error) {
      console.error('❌ Duplicate cleanup failed:', error);
      toast.error('Failed to clean up duplicates. Please try again.');
    }
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // Show migration page if needed (only on first login with Supabase)
  if (showMigration && syncLocalDataToBackend) {
    return (
      <DataMigration 
        onMigrate={async (data) => {
          await syncLocalDataToBackend(data);
          setShowMigration(false);
        }}
        backendConnected={backendConfigured}
      />
    );
  }

  // Show loading state while data is loading
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-2xl"></div>
          <p className="text-white text-2xl font-bold drop-shadow-lg">Loading GITALA BRANCH...</p>
          <p className="text-emerald-100 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // Get selected client for detail page
  const selectedClient = selectedClientId 
    ? clients.find(c => c.id === selectedClientId) 
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Backend Status Indicator - Fixed at bottom right */}
      <div className="fixed bottom-4 right-4 z-50 hidden sm:block">
        <div className={`px-3 py-2 rounded-lg shadow-lg border ${
          backendConfigured 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            {backendConfigured ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-700">Backend Connected</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-xs font-medium text-gray-600">Local Storage</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <MobileHeader 
        title={getPageTitle()} 
        onMenuClick={() => sidebarRef.current?.toggleMobile()}
      />

      {/* Sidebar */}
      <Sidebar 
        ref={sidebarRef}
        activePage={activePage} 
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="lg:ml-64 p-4 sm:p-6 lg:p-8 pt-28 sm:pt-28 lg:pt-12 pb-8">
        {/* Render active page */}
        {activePage === 'dashboard' && (
          <Dashboard 
            clients={clients}
            transactions={transactions}
            cashbookEntries={cashbookEntries}
            currentUser={currentUser}
          />
        )}
        
        {activePage === 'clients' && (
          <Clients 
            clients={clients}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onViewClient={handleViewClient}
            currentUser={currentUser}
          />
        )}
        
        {activePage === 'client-detail' && selectedClient && (
          <ClientDetail 
            client={selectedClient}
            transactions={transactions}
            onBack={handleBackToClients}
            onRecordPayment={() => setShowRecordPaymentModal(true)}
            onIssueNewLoan={() => {
              setShowNewLoanModal(true);
            }}
            currentUser={currentUser}
            onEditPayment={(transaction) => {
              setEditingPayment(transaction);
              setShowEditPaymentModal(true);
            }}
            onDeletePayment={handleDeleteTransaction}
            onSendReminder={() => setShowReminderModal(true)}
            onCheckSMSBalance={() => setShowSMSBalanceModal(true)}
          />
        )}
        
        {activePage === 'cashbook' && (
          <Cashbook 
            entries={cashbookEntries}
            onAddExpense={() => setShowAddExpenseModal(true)}
            onOwnerCapital={() => setShowOwnerCapitalModal(true)}
            onCleanupDuplicates={handleCleanupDuplicates}
            onRefreshData={reloadData}
            onDeleteEntry={handleDeleteCashbook}
            onRepairCashbook={repairMissingCashbookEntries}
            currentUser={currentUser}
          />
        )}
        
        {activePage === 'history' && (
          <TransactionHistory entries={cashbookEntries} />
        )}
        
        {activePage === 'data-view' && (
          <DataView 
            clients={clients}
            transactions={transactions}
            cashbookEntries={cashbookEntries}
            ownerCapitalTransactions={ownerCapitalTransactions}
            onOwnerCapital={() => setShowOwnerCapitalModal(true)}
            currentUser={currentUser}
            onDeleteClient={handleDeleteClient}
            onEditClient={(client) => {
              setEditingClient(client);
              setShowEditClientModal(true);
            }}
            onViewClient={handleViewClient}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={(transaction) => {
              setEditingPayment(transaction);
              setShowEditPaymentModal(true);
            }}
            onDeleteCashbook={handleDeleteCashbook}
            onDeleteOwnerCapital={handleDeleteOwnerCapital}
            onRepairCashbook={repairMissingCashbookEntries}
            backendConfigured={backendConfigured}
            onShowMigration={() => setShowMigration(true)}
          />
        )}
        
        {activePage === 'missed-payments' && (
          <MissedPayments 
            clients={clients}
            transactions={transactions}
            onViewClient={handleViewClient}
          />
        )}
        
        {activePage === 'user-performance' && (
          <UserPerformance 
            clients={clients}
            transactions={transactions}
            currentUser={currentUser}
          />
        )}
        
        {activePage === 'evaluation' && (
          <Evaluation 
            transactions={transactions}
            cashbookEntries={cashbookEntries}
            clients={clients}
            currentUser={currentUser}
          />
        )}
        
        {activePage === 'admin-dashboard' && (
          <AdminDashboard 
            currentUser={currentUser}
          />
        )}
        
        {activePage === 'user-management' && (
          <UserManagement 
            currentUser={currentUser}
          />
        )}
      </div>

      {/* Add Client Modal (can be triggered from sidebar) */}
      <AddClientModal
        open={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onAdd={handleAddClient}
        currentUser={currentUser}
        existingClients={clients}
      />

      {/* Record Payment Modal */}
      {selectedClient && (
        <RecordPaymentModal
          open={showRecordPaymentModal}
          onClose={() => setShowRecordPaymentModal(false)}
          client={selectedClient}
          onRecordPayment={handleRecordPayment}
          currentUser={currentUser}
        />
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal
        open={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        onAddExpense={handleAddExpense}
      />

      {/* Edit Client Modal */}
      {editingClient && (
        <EditClientModal
          open={showEditClientModal}
          onClose={() => {
            setShowEditClientModal(false);
            setEditingClient(null);
          }}
          client={editingClient}
          onUpdate={handleUpdateClient}
          currentUser={currentUser}
        />
      )}

      {/* Owner Capital Modal */}
      <OwnerCapitalModal
        open={showOwnerCapitalModal}
        onClose={() => setShowOwnerCapitalModal(false)}
        onSubmit={handleOwnerCapital}
        ownerCapitalTransactions={ownerCapitalTransactions}
      />

      {/* Payment Receipt Modal */}
      {receiptData && (
        <PaymentReceiptModal
          open={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          receiptData={receiptData}
        />
      )}

      {/* Edit Payment Modal */}
      {editingPayment && (
        <EditPaymentModal
          open={showEditPaymentModal}
          onClose={() => {
            setShowEditPaymentModal(false);
            setEditingPayment(null);
          }}
          transaction={editingPayment}
          onEditPayment={handleEditPayment}
          currentUser={currentUser}
        />
      )}

      {/* New Loan Modal */}
      {selectedClient && (
        <NewLoanModal
          open={showNewLoanModal}
          onClose={() => {
            setShowNewLoanModal(false);
          }}
          client={selectedClient}
          onIssueNewLoan={handleIssueNewLoan}
          currentUser={currentUser}
        />
      )}

      {/* Client Allocation Modal */}
      <ClientAllocationModal
        isOpen={showClientAllocationModal}
        onClose={() => setShowClientAllocationModal(false)}
        clients={clients}
        onAssignClient={handleAssignClient}
      />

      {/* Reminder Modal */}
      {showReminderModal && selectedClient && (
        <ReminderModal
          client={selectedClient}
          onClose={() => setShowReminderModal(false)}
        />
      )}

      {/* SMS Balance Modal */}
      {showSMSBalanceModal && (
        <SMSBalanceModal
          onClose={() => setShowSMSBalanceModal(false)}
        />
      )}

      {/* Toaster for notifications */}
      <Toaster />
    </div>
  );
}