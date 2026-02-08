import { useState, useEffect, useCallback } from 'react';
import { Client, Transaction, CashbookEntry } from '../data/mockData';
import { getServerUrl, getAuthHeaders } from '/src/utils/supabase';

export interface OwnerCapitalTransaction {
  id: string;
  type: 'Capital Injection' | 'Owner Withdrawal';
  amount: number;
  date: string;
  time: string;
  description: string;
  enteredBy: string;
}

export const useSupabaseData = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashbookEntries, setCashbookEntries] = useState<CashbookEntry[]>([]);
  const [ownerCapitalTransactions, setOwnerCapitalTransactions] = useState<OwnerCapitalTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all data from backend
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch clients
      const clientsRes = await fetch(getServerUrl('/clients'), {
        headers: getAuthHeaders(),
      });
      
      if (!clientsRes.ok) {
        throw new Error(`Failed to fetch clients: ${clientsRes.status} ${clientsRes.statusText}`);
      }
      
      const clientsData = await clientsRes.json();
      setClients(clientsData.clients || []);

      // Fetch transactions
      const transactionsRes = await fetch(getServerUrl('/transactions'), {
        headers: getAuthHeaders(),
      });
      
      if (!transactionsRes.ok) {
        throw new Error(`Failed to fetch transactions: ${transactionsRes.status} ${transactionsRes.statusText}`);
      }
      
      const transactionsData = await transactionsRes.json();
      setTransactions(transactionsData.transactions || []);

      // Fetch cashbook entries
      const cashbookRes = await fetch(getServerUrl('/cashbook'), {
        headers: getAuthHeaders(),
      });
      
      if (!cashbookRes.ok) {
        throw new Error(`Failed to fetch cashbook: ${cashbookRes.status} ${cashbookRes.statusText}`);
      }
      
      const cashbookData = await cashbookRes.json();
      setCashbookEntries(cashbookData.entries || []);

      // Fetch owner capital transactions
      const ownerCapitalRes = await fetch(getServerUrl('/owner-capital'), {
        headers: getAuthHeaders(),
      });
      
      if (!ownerCapitalRes.ok) {
        throw new Error(`Failed to fetch owner capital: ${ownerCapitalRes.status} ${ownerCapitalRes.statusText}`);
      }
      
      const ownerCapitalData = await ownerCapitalRes.json();
      setOwnerCapitalTransactions(ownerCapitalData.transactions || []);

      console.log('✅ All data loaded from backend successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Error loading data from backend:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============================================
  // CLIENT OPERATIONS
  // ============================================

  const addClient = useCallback(async (client: Client) => {
    try {
      const res = await fetch(getServerUrl('/clients'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(client),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to add client: ${errorData.error || res.statusText}`);
      }

      const data = await res.json();
      setClients(prev => [data.client, ...prev]);
      return data.client;
    } catch (err) {
      console.error('Error adding client:', err);
      throw err;
    }
  }, []);

  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
    try {
      const res = await fetch(getServerUrl(`/clients/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to update client: ${errorData.error || res.statusText}`);
      }

      const data = await res.json();
      setClients(prev => prev.map(c => c.id === id ? data.client : c));
      return data.client;
    } catch (err) {
      console.error('Error updating client:', err);
      throw err;
    }
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    try {
      const res = await fetch(getServerUrl(`/clients/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to delete client: ${errorData.error || res.statusText}`);
      }

      setClients(prev => prev.filter(c => c.id !== id));
      setTransactions(prev => prev.filter(t => t.clientId !== id));
    } catch (err) {
      console.error('Error deleting client:', err);
      throw err;
    }
  }, []);

  // ============================================
  // TRANSACTION OPERATIONS
  // ============================================

  const addTransaction = useCallback(async (transaction: Transaction) => {
    try {
      const res = await fetch(getServerUrl('/transactions'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(transaction),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to add transaction: ${errorData.error || res.statusText}`);
      }

      const data = await res.json();
      setTransactions(prev => [data.transaction, ...prev]);
      return data.transaction;
    } catch (err) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  }, []);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    try {
      const res = await fetch(getServerUrl(`/transactions/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to update transaction: ${errorData.error || res.statusText}`);
      }

      const data = await res.json();
      setTransactions(prev => prev.map(t => t.id === id ? data.transaction : t));
      return data.transaction;
    } catch (err) {
      console.error('Error updating transaction:', err);
      throw err;
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      const res = await fetch(getServerUrl(`/transactions/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to delete transaction: ${errorData.error || res.statusText}`);
      }

      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  }, []);

  // ============================================
  // CASHBOOK OPERATIONS
  // ============================================

  const addCashbookEntry = useCallback(async (entry: CashbookEntry) => {
    try {
      const res = await fetch(getServerUrl('/cashbook'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(entry),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to add cashbook entry: ${errorData.error || res.statusText}`);
      }

      const data = await res.json();
      setCashbookEntries(prev => [data.entry, ...prev]);
      return data.entry;
    } catch (err) {
      console.error('Error adding cashbook entry:', err);
      throw err;
    }
  }, []);

  const updateCashbookEntry = useCallback(async (id: string, updates: Partial<CashbookEntry>) => {
    try {
      const res = await fetch(getServerUrl(`/cashbook/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to update cashbook entry: ${errorData.error || res.statusText}`);
      }

      const data = await res.json();
      setCashbookEntries(prev => prev.map(e => e.id === id ? data.entry : e));
      return data.entry;
    } catch (err) {
      console.error('Error updating cashbook entry:', err);
      throw err;
    }
  }, []);

  const deleteCashbookEntry = useCallback(async (id: string) => {
    try {
      const res = await fetch(getServerUrl(`/cashbook/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to delete cashbook entry: ${errorData.error || res.statusText}`);
      }

      setCashbookEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting cashbook entry:', err);
      throw err;
    }
  }, []);

  // ============================================
  // OWNER CAPITAL OPERATIONS
  // ============================================

  const addOwnerCapitalTransaction = useCallback(async (transaction: OwnerCapitalTransaction) => {
    try {
      const res = await fetch(getServerUrl('/owner-capital'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(transaction),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to add owner capital transaction: ${errorData.error || res.statusText}`);
      }

      const data = await res.json();
      setOwnerCapitalTransactions(prev => [data.transaction, ...prev]);
      return data.transaction;
    } catch (err) {
      console.error('Error adding owner capital transaction:', err);
      throw err;
    }
  }, []);

  const deleteOwnerCapitalTransaction = useCallback(async (id: string) => {
    try {
      const res = await fetch(getServerUrl(`/owner-capital/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to delete owner capital transaction: ${errorData.error || res.statusText}`);
      }

      setOwnerCapitalTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting owner capital transaction:', err);
      throw err;
    }
  }, []);

  // ============================================
  // SYNC OPERATION (For migrating local data)
  // ============================================

  const syncLocalDataToBackend = useCallback(async (localData: {
    clients: Client[];
    transactions: Transaction[];
    cashbookEntries: CashbookEntry[];
    ownerCapitalTransactions: OwnerCapitalTransaction[];
  }) => {
    try {
      const res = await fetch(getServerUrl('/sync'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(localData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to sync data: ${errorData.error || res.statusText}`);
      }

      const data = await res.json();
      console.log('✅ Data synced successfully:', data.synced);
      
      // Reload data from backend
      await loadData();
      
      return data;
    } catch (err) {
      console.error('Error syncing data:', err);
      throw err;
    }
  }, [loadData]);

  return {
    clients,
    transactions,
    cashbookEntries,
    ownerCapitalTransactions,
    loading,
    error,
    backendConfigured: true,
    addClient,
    updateClient,
    deleteClient,
    setClients,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setTransactions,
    addCashbookEntry,
    updateCashbookEntry,
    deleteCashbookEntry,
    setCashbookEntries,
    addOwnerCapitalTransaction,
    deleteOwnerCapitalTransaction,
    setOwnerCapitalTransactions,
    reloadData: loadData,
    syncLocalDataToBackend,
  };
};
