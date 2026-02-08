// Local Data Management Hook - No Backend
// Stores all data in localStorage for persistence

import { useState, useEffect, useCallback } from 'react';
import { Client, Transaction, CashbookEntry } from '../data/mockData';

const STORAGE_KEYS = {
  CLIENTS: 'gitara_branch_clients',
  TRANSACTIONS: 'gitara_branch_transactions',
  CASHBOOK: 'gitara_branch_cashbook',
  OWNER_CAPITAL: 'gitara_branch_owner_capital',
};

export interface OwnerCapitalTransaction {
  id: string;
  type: 'Capital Injection' | 'Owner Withdrawal';
  amount: number;
  date: string;
  time: string;
  description: string;
  enteredBy: string;
}

export const useLocalData = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashbookEntries, setCashbookEntries] = useState<CashbookEntry[]>([]);
  const [ownerCapitalTransactions, setOwnerCapitalTransactions] = useState<OwnerCapitalTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const savedCashbook = localStorage.getItem(STORAGE_KEYS.CASHBOOK);
      const savedOwnerCapital = localStorage.getItem(STORAGE_KEYS.OWNER_CAPITAL);

      if (savedClients) setClients(JSON.parse(savedClients));
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      if (savedCashbook) setCashbookEntries(JSON.parse(savedCashbook));
      if (savedOwnerCapital) setOwnerCapitalTransactions(JSON.parse(savedOwnerCapital));
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASHBOOK, JSON.stringify(cashbookEntries));
  }, [cashbookEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OWNER_CAPITAL, JSON.stringify(ownerCapitalTransactions));
  }, [ownerCapitalTransactions]);

  // Client operations
  const addClient = useCallback(async (client: Client) => {
    setClients(prev => [client, ...prev]);
    return client;
  }, []);

  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    return { ...updates, id } as Client;
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    // Also delete related transactions
    setTransactions(prev => prev.filter(t => t.clientId !== id));
  }, []);

  // Transaction operations
  const addTransaction = useCallback(async (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    return transaction;
  }, []);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    return { ...updates, id } as Transaction;
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  // Cashbook operations
  const addCashbookEntry = useCallback(async (entry: CashbookEntry) => {
    setCashbookEntries(prev => [entry, ...prev]);
    return entry;
  }, []);

  const updateCashbookEntry = useCallback(async (id: string, updates: Partial<CashbookEntry>) => {
    setCashbookEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    return { ...updates, id } as CashbookEntry;
  }, []);

  const deleteCashbookEntry = useCallback(async (id: string) => {
    setCashbookEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  // Owner Capital operations
  const addOwnerCapitalTransaction = useCallback(async (transaction: OwnerCapitalTransaction) => {
    setOwnerCapitalTransactions(prev => [transaction, ...prev]);
    return transaction;
  }, []);

  const deleteOwnerCapitalTransaction = useCallback(async (id: string) => {
    setOwnerCapitalTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const reloadData = useCallback(async () => {
    // No-op for local storage
  }, []);

  return {
    clients,
    transactions,
    cashbookEntries,
    ownerCapitalTransactions,
    loading,
    error: null,
    backendConfigured: false,
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
    reloadData,
  };
};
