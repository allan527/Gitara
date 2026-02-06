// Custom React Hook for Backend Data Management
// Handles both local storage (when backend unavailable) and API calls

import { useState, useEffect, useCallback } from 'react';
import { Client, Transaction, CashbookEntry } from '../data/mockData';
import { clientsAPI, transactionsAPI, cashbookAPI, ownerCapitalAPI, isBackendConfigured } from '../services/api';
import { OwnerCapitalTransaction } from '../services/api';

const STORAGE_KEYS = {
  CLIENTS: 'gitara_clients',
  TRANSACTIONS: 'gitara_transactions',
  CASHBOOK: 'gitara_cashbook',
  OWNER_CAPITAL: 'gitara_owner_capital',
};

export function useBackendData() {
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashbookEntries, setCashbookEntries] = useState<CashbookEntry[]>([]);
  const [ownerCapitalTransactions, setOwnerCapitalTransactions] = useState<OwnerCapitalTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const backendConfigured = isBackendConfigured();

  // ============================================================
  // LOCAL STORAGE HELPERS
  // ============================================================

  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }
  };

  const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (err) {
      console.error('Error loading from localStorage:', err);
      return defaultValue;
    }
  };

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (backendConfigured) {
        // Silently try to load from backend, fallback to localStorage if unavailable
        try {
          const [clientsData, transactionsData, cashbookData, ownerCapitalData] = await Promise.all([
            clientsAPI.getAll(),
            transactionsAPI.getAll(),
            cashbookAPI.getAll(),
            ownerCapitalAPI.getAll(),
          ]);

          setClients(clientsData);
          setTransactions(transactionsData);
          setCashbookEntries(cashbookData.entries || []);
          setOwnerCapitalTransactions(ownerCapitalData);

          console.log('✅ Data loaded from backend');
        } catch {
          // Backend not available - silently use localStorage
          const clientsData = loadFromLocalStorage(STORAGE_KEYS.CLIENTS, []);
          const transactionsData = loadFromLocalStorage(STORAGE_KEYS.TRANSACTIONS, []);
          const cashbookData = loadFromLocalStorage(STORAGE_KEYS.CASHBOOK, []);
          const ownerCapitalData = loadFromLocalStorage(STORAGE_KEYS.OWNER_CAPITAL, []);

          setClients(clientsData);
          setTransactions(transactionsData);
          setCashbookEntries(cashbookData);
          setOwnerCapitalTransactions(ownerCapitalData);

          console.log('💾 Using localStorage (backend not deployed yet)');
        }
      } else {
        console.log('💾 Loading data from localStorage...');
        
        // Load from localStorage
        const clientsData = loadFromLocalStorage<Client[]>(STORAGE_KEYS.CLIENTS, []);
        const transactionsData = loadFromLocalStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
        const cashbookData = loadFromLocalStorage<CashbookEntry[]>(STORAGE_KEYS.CASHBOOK, []);
        const ownerCapitalData = loadFromLocalStorage<OwnerCapitalTransaction[]>(STORAGE_KEYS.OWNER_CAPITAL, []);

        setClients(clientsData);
        setTransactions(transactionsData);
        setCashbookEntries(cashbookData);
        setOwnerCapitalTransactions(ownerCapitalData);

        console.log('✅ Data loaded from localStorage:', {
          clients: clientsData.length,
          transactions: transactionsData.length,
          cashbook: cashbookData.length,
          ownerCapital: ownerCapitalData.length,
        });
      }
    } catch (err: any) {
      console.error('❌ Error loading data:', err);
      setError(err.message || 'Failed to load data');
      
      // Fallback to localStorage on error
      if (backendConfigured) {
        console.log('⚠️ Falling back to localStorage...');
        setClients(loadFromLocalStorage<Client[]>(STORAGE_KEYS.CLIENTS, []));
        setTransactions(loadFromLocalStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []));
        setCashbookEntries(loadFromLocalStorage<CashbookEntry[]>(STORAGE_KEYS.CASHBOOK, []));
        setOwnerCapitalTransactions(loadFromLocalStorage<OwnerCapitalTransaction[]>(STORAGE_KEYS.OWNER_CAPITAL, []));
      }
    } finally {
      setLoading(false);
    }
  }, [backendConfigured]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save to localStorage when data changes (backup)
  useEffect(() => {
    if (!loading) {
      saveToLocalStorage(STORAGE_KEYS.CLIENTS, clients);
      saveToLocalStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
      saveToLocalStorage(STORAGE_KEYS.CASHBOOK, cashbookEntries);
      saveToLocalStorage(STORAGE_KEYS.OWNER_CAPITAL, ownerCapitalTransactions);
    }
  }, [clients, transactions, cashbookEntries, ownerCapitalTransactions, loading]);

  // ============================================================
  // CLIENT OPERATIONS
  // ============================================================

  const addClient = async (client: Client) => {
    try {
      if (backendConfigured) {
        const newClient = await clientsAPI.create(client);
        setClients(prev => [...prev, newClient]);
      } else {
        setClients(prev => [...prev, client]);
      }
    } catch (err: any) {
      console.error('Error adding client:', err);
      throw err;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      if (backendConfigured) {
        const updatedClient = await clientsAPI.update(id, updates);
        setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
      } else {
        setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      }
    } catch (err: any) {
      console.error('Error updating client:', err);
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      if (backendConfigured) {
        await clientsAPI.delete(id);
      }
      setClients(prev => prev.filter(c => c.id !== id));
      setTransactions(prev => prev.filter(t => t.clientId !== id));
    } catch (err: any) {
      console.error('Error deleting client:', err);
      throw err;
    }
  };

  // ============================================================
  // TRANSACTION OPERATIONS
  // ============================================================

  const addTransaction = async (transaction: Transaction) => {
    try {
      if (backendConfigured) {
        const newTransaction = await transactionsAPI.create(transaction);
        setTransactions(prev => [...prev, newTransaction]);
      } else {
        setTransactions(prev => [...prev, transaction]);
      }
    } catch (err: any) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      if (backendConfigured) {
        const updatedTransaction = await transactionsAPI.update(id, updates);
        setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
      } else {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      }
    } catch (err: any) {
      console.error('Error updating transaction:', err);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      if (backendConfigured) {
        await transactionsAPI.delete(id);
      }
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  };

  // ============================================================
  // CASHBOOK OPERATIONS
  // ============================================================

  const addCashbookEntry = async (entry: CashbookEntry) => {
    try {
      if (backendConfigured) {
        const newEntry = await cashbookAPI.create(entry);
        setCashbookEntries(prev => [...prev, newEntry]);
      } else {
        setCashbookEntries(prev => [...prev, entry]);
      }
    } catch (err: any) {
      console.error('Error adding cashbook entry:', err);
      throw err;
    }
  };

  const updateCashbookEntry = async (id: string, updates: Partial<CashbookEntry>) => {
    try {
      if (backendConfigured) {
        const updatedEntry = await cashbookAPI.update(id, updates);
        setCashbookEntries(prev => prev.map(e => e.id === id ? updatedEntry : e));
      } else {
        setCashbookEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
      }
    } catch (err: any) {
      console.error('Error updating cashbook entry:', err);
      throw err;
    }
  };

  const deleteCashbookEntry = async (id: string) => {
    try {
      if (backendConfigured) {
        await cashbookAPI.delete(id);
      }
      setCashbookEntries(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      console.error('Error deleting cashbook entry:', err);
      throw err;
    }
  };

  // ============================================================
  // OWNER CAPITAL OPERATIONS
  // ============================================================

  const addOwnerCapitalTransaction = async (transaction: OwnerCapitalTransaction) => {
    try {
      if (backendConfigured) {
        const newTransaction = await ownerCapitalAPI.create(transaction);
        setOwnerCapitalTransactions(prev => [...prev, newTransaction]);
      } else {
        setOwnerCapitalTransactions(prev => [...prev, transaction]);
      }
    } catch (err: any) {
      console.error('Error adding owner capital transaction:', err);
      throw err;
    }
  };

  const deleteOwnerCapitalTransaction = async (id: string) => {
    try {
      if (backendConfigured) {
        await ownerCapitalAPI.delete(id);
      }
      setOwnerCapitalTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      console.error('Error deleting owner capital transaction:', err);
      throw err;
    }
  };

  return {
    // Data
    clients,
    transactions,
    cashbookEntries,
    ownerCapitalTransactions,
    loading,
    error,
    backendConfigured,
    
    // Client operations
    addClient,
    updateClient,
    deleteClient,
    setClients,
    
    // Transaction operations
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setTransactions,
    
    // Cashbook operations
    addCashbookEntry,
    updateCashbookEntry,
    deleteCashbookEntry,
    setCashbookEntries,
    
    // Owner capital operations
    addOwnerCapitalTransaction,
    deleteOwnerCapitalTransaction,
    setOwnerCapitalTransactions,
    
    // Utility
    reloadData: loadData,
  };
}