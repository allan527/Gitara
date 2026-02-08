// GITARA BRANCH - Local Storage API
// Persistent storage using browser localStorage
// Data is saved and persists across page refreshes

const STORAGE_KEYS = {
  CLIENTS: 'gitara_clients',
  TRANSACTIONS: 'gitara_transactions',
  CASHBOOK: 'gitara_cashbook',
  OWNER_CAPITAL: 'gitara_owner_capital',
  SMS_HISTORY: 'gitara_sms_history',
};

// Helper functions for localStorage
const saveToStorage = <T>(key: string, data: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`💾 Saved ${data.length} items to ${key}`);
  } catch (error) {
    console.error(`❌ Error saving to ${key}:`, error);
  }
};

const loadFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    const parsed = JSON.parse(data);
    console.log(`📂 Loaded ${parsed.length} items from ${key}`);
    return parsed;
  } catch (error) {
    console.error(`❌ Error loading from ${key}:`, error);
    return [];
  }
};

// Simulate network delay for realistic feel
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 100));

// ============================================================
// CLIENTS API
// ============================================================

export const clientsApi = {
  getAll: async () => {
    await simulateNetworkDelay();
    return loadFromStorage(STORAGE_KEYS.CLIENTS);
  },

  getById: async (id: string) => {
    await simulateNetworkDelay();
    const clients = loadFromStorage(STORAGE_KEYS.CLIENTS);
    const client = clients.find((c: any) => c.id === id);
    if (!client) throw new Error('Client not found');
    return client;
  },

  create: async (client: any) => {
    await simulateNetworkDelay();
    const clients = loadFromStorage(STORAGE_KEYS.CLIENTS);
    clients.push(client);
    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    return client;
  },

  update: async (id: string, updatedClient: any) => {
    await simulateNetworkDelay();
    const clients = loadFromStorage(STORAGE_KEYS.CLIENTS);
    const index = clients.findIndex((c: any) => c.id === id);
    if (index === -1) throw new Error('Client not found');
    clients[index] = updatedClient;
    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    return updatedClient;
  },

  delete: async (id: string) => {
    await simulateNetworkDelay();
    const clients = loadFromStorage(STORAGE_KEYS.CLIENTS);
    const filtered = clients.filter((c: any) => c.id !== id);
    saveToStorage(STORAGE_KEYS.CLIENTS, filtered);
    return { success: true };
  },
};

// ============================================================
// TRANSACTIONS API
// ============================================================

export const transactionsApi = {
  getAll: async () => {
    await simulateNetworkDelay();
    return loadFromStorage(STORAGE_KEYS.TRANSACTIONS);
  },

  getByClientId: async (clientId: string) => {
    await simulateNetworkDelay();
    const transactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS);
    return transactions.filter((t: any) => t.clientId === clientId);
  },

  create: async (transaction: any) => {
    await simulateNetworkDelay();
    const transactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS);
    transactions.push(transaction);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    return transaction;
  },

  update: async (id: string, updatedTransaction: any) => {
    await simulateNetworkDelay();
    const transactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS);
    const index = transactions.findIndex((t: any) => t.id === id);
    if (index === -1) throw new Error('Transaction not found');
    transactions[index] = updatedTransaction;
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    return updatedTransaction;
  },

  delete: async (id: string) => {
    await simulateNetworkDelay();
    const transactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS);
    const filtered = transactions.filter((t: any) => t.id !== id);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, filtered);
    return { success: true };
  },
};

// ============================================================
// CASHBOOK API
// ============================================================

export const cashbookApi = {
  getAll: async () => {
    await simulateNetworkDelay();
    const entries = loadFromStorage(STORAGE_KEYS.CASHBOOK);
    console.log(`🔍 CASHBOOK API: Loaded ${entries.length} entries from localStorage`);
    return entries;
  },

  create: async (entry: any) => {
    await simulateNetworkDelay();
    const entries = loadFromStorage(STORAGE_KEYS.CASHBOOK);
    entries.push(entry);
    saveToStorage(STORAGE_KEYS.CASHBOOK, entries);
    console.log(`✅ CASHBOOK API: Created entry, now ${entries.length} total`);
    return entry;
  },

  update: async (id: string, updatedEntry: any) => {
    await simulateNetworkDelay();
    const entries = loadFromStorage(STORAGE_KEYS.CASHBOOK);
    const index = entries.findIndex((e: any) => e.id === id);
    if (index === -1) throw new Error('Cashbook entry not found');
    entries[index] = updatedEntry;
    saveToStorage(STORAGE_KEYS.CASHBOOK, entries);
    return updatedEntry;
  },

  delete: async (id: string) => {
    await simulateNetworkDelay();
    const entries = loadFromStorage(STORAGE_KEYS.CASHBOOK);
    const filtered = entries.filter((e: any) => e.id !== id);
    saveToStorage(STORAGE_KEYS.CASHBOOK, filtered);
    return { success: true };
  },
};

// ============================================================
// OWNER CAPITAL API
// ============================================================

export const ownerCapitalApi = {
  getAll: async () => {
    await simulateNetworkDelay();
    return loadFromStorage(STORAGE_KEYS.OWNER_CAPITAL);
  },

  create: async (transaction: any) => {
    await simulateNetworkDelay();
    const transactions = loadFromStorage(STORAGE_KEYS.OWNER_CAPITAL);
    transactions.push(transaction);
    saveToStorage(STORAGE_KEYS.OWNER_CAPITAL, transactions);
    
    // Also create corresponding cashbook entry
    const cashbookEntry = {
      id: `c${Date.now()}`,
      date: transaction.date,
      time: transaction.time,
      description: `${transaction.type} - ${transaction.description}`,
      type: transaction.type === 'Injection' ? 'Income' : 'Expense',
      amount: transaction.amount,
      status: transaction.type === 'Injection' ? 'Capital Injection' : 'Capital Withdrawal',
      enteredBy: 'Owner',
    };
    
    await cashbookApi.create(cashbookEntry);
    
    return {
      transaction,
      cashbookEntry,
    };
  },

  delete: async (id: string) => {
    await simulateNetworkDelay();
    const transactions = loadFromStorage(STORAGE_KEYS.OWNER_CAPITAL);
    const filtered = transactions.filter((t: any) => t.id !== id);
    saveToStorage(STORAGE_KEYS.OWNER_CAPITAL, filtered);
    return { success: true };
  },
};

// ============================================================
// SMS API
// ============================================================

export const smsApi = {
  send: async (smsData: any) => {
    await simulateNetworkDelay();
    console.log('📱 SMS API (Local Mode): SMS not actually sent (backend not configured)');
    console.log('📱 SMS Data:', smsData);
    
    // Save to history
    const history = loadFromStorage(STORAGE_KEYS.SMS_HISTORY);
    const smsRecord = {
      id: `sms${Date.now()}`,
      ...smsData,
      status: 'Local Mode - Not Sent',
      sentAt: new Date().toISOString(),
      response: { message: 'Backend not configured - SMS saved to history only' },
    };
    history.push(smsRecord);
    saveToStorage(STORAGE_KEYS.SMS_HISTORY, history);
    
    return {
      success: false,
      message: 'SMS not sent - Backend not configured. SMS feature requires backend setup.',
      smsRecord,
    };
  },

  getHistory: async () => {
    await simulateNetworkDelay();
    return loadFromStorage(STORAGE_KEYS.SMS_HISTORY);
  },

  getClientHistory: async (clientId: string) => {
    await simulateNetworkDelay();
    const history = loadFromStorage(STORAGE_KEYS.SMS_HISTORY);
    return history.filter((sms: any) => sms.clientId === clientId);
  },
};

// ============================================================
// INITIALIZATION
// ============================================================

export const initializeLocalData = (
  mockClients: any[] = [],
  mockTransactions: any[] = [],
  mockCashbook: any[] = []
) => {
  console.log('🔄 Initializing local data...');
  
  // Only initialize if storage is empty
  const existingClients = loadFromStorage(STORAGE_KEYS.CLIENTS);
  
  if (existingClients.length === 0 && mockClients.length > 0) {
    console.log('📥 Initializing with mock data (first time)...');
    saveToStorage(STORAGE_KEYS.CLIENTS, mockClients);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, mockTransactions);
    saveToStorage(STORAGE_KEYS.CASHBOOK, mockCashbook);
    console.log('✅ Mock data initialized');
  } else {
    console.log(`✅ Using existing data (${existingClients.length} clients)`);
  }
};

// ============================================================
// CLEAR ALL DATA (for testing)
// ============================================================

export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('🗑️ All local data cleared');
};

export default {
  clients: clientsApi,
  transactions: transactionsApi,
  cashbook: cashbookApi,
  ownerCapital: ownerCapitalApi,
  sms: smsApi,
  initializeLocalData,
  clearAllData,
};