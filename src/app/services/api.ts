// GITARA BRANCH - API Service Layer
// Handles all communication with Supabase backend

import { projectId, publicAnonKey } from '../config/supabase';
import { Client, Transaction, CashbookEntry } from '../data/mockData';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-7f28f6fd`;

// Check if backend is configured
export const isBackendConfigured = (): boolean => {
  const configured = Boolean(projectId && publicAnonKey);
  console.log('🔍 Backend configured check:', { projectId, hasKey: Boolean(publicAnonKey), configured });
  return configured;
};

// Helper function for API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    // Silently throw - caller will handle logging
    throw error;
  }
};

// ============================================================
// CLIENTS API
// ============================================================

export const clientsAPI = {
  // Get all clients
  getAll: async (): Promise<Client[]> => {
    const response = await apiRequest<Client[]>('/clients');
    return response.clients || [];
  },

  // Get single client by ID
  getById: async (id: string): Promise<Client> => {
    const response = await apiRequest<Client>(`/clients/${id}`);
    return response.client;
  },

  // Add new client
  create: async (client: Client): Promise<Client> => {
    const response = await apiRequest<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
    return response.client;
  },

  // Update client
  update: async (id: string, client: Partial<Client>): Promise<Client> => {
    const response = await apiRequest<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    });
    return response.client;
  },

  // Delete client
  delete: async (id: string): Promise<void> => {
    await apiRequest<void>(`/clients/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================
// TRANSACTIONS API
// ============================================================

export const transactionsAPI = {
  // Get all transactions
  getAll: async (): Promise<Transaction[]> => {
    const response = await apiRequest<Transaction[]>('/transactions');
    return response.transactions || [];
  },

  // Get transactions for a specific client
  getByClientId: async (clientId: string): Promise<Transaction[]> => {
    const response = await apiRequest<Transaction[]>(`/transactions/client/${clientId}`);
    return response.transactions || [];
  },

  // Add new transaction
  create: async (transaction: Transaction): Promise<Transaction> => {
    const response = await apiRequest<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
    return response.transaction;
  },

  // Update transaction
  update: async (id: string, transaction: Partial<Transaction>): Promise<Transaction> => {
    const response = await apiRequest<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
    return response.transaction;
  },

  // Delete transaction
  delete: async (id: string): Promise<void> => {
    await apiRequest<void>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================
// CASHBOOK API
// ============================================================

export interface CashbookResponse {
  entries: CashbookEntry[];
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  ownerCapitalTotal: number;
}

export const cashbookAPI = {
  // Get all cashbook entries
  getAll: async (): Promise<CashbookResponse> => {
    const response = await apiRequest<CashbookResponse>('/cashbook');
    return response;
  },

  // Add new cashbook entry
  create: async (entry: CashbookEntry): Promise<CashbookEntry> => {
    const response = await apiRequest<CashbookEntry>('/cashbook', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
    return response.entry;
  },

  // Update cashbook entry
  update: async (id: string, entry: Partial<CashbookEntry>): Promise<CashbookEntry> => {
    const response = await apiRequest<CashbookEntry>(`/cashbook/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    });
    return response.entry;
  },

  // Delete cashbook entry
  delete: async (id: string): Promise<void> => {
    await apiRequest<void>(`/cashbook/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================
// OWNER CAPITAL API
// ============================================================

export interface OwnerCapitalTransaction {
  id: string;
  type: 'Injection' | 'Withdrawal';
  amount: number;
  date: string;
  time: string;
  description: string;
  ownerName: string;
  ownerPhone: string;
}

export const ownerCapitalAPI = {
  // Get all owner capital transactions
  getAll: async (): Promise<OwnerCapitalTransaction[]> => {
    const response = await apiRequest<OwnerCapitalTransaction[]>('/owner-capital');
    return response.transactions || [];
  },

  // Add owner capital transaction
  create: async (transaction: OwnerCapitalTransaction): Promise<OwnerCapitalTransaction> => {
    const response = await apiRequest<OwnerCapitalTransaction>('/owner-capital', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
    return response.transaction;
  },

  // Delete owner capital transaction
  delete: async (id: string): Promise<void> => {
    await apiRequest<void>(`/owner-capital/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================
// SMS API
// ============================================================

export interface SMSRequest {
  recipients: string[];
  message: string;
  type?: 'payment_reminder' | 'payment_receipt' | 'loan_approval' | 'custom';
  clientId?: string;
  clientName?: string;
}

export interface SMSHistoryItem {
  id: string;
  recipients: string[];
  message: string;
  type: string;
  status: string;
  sentAt: string;
  clientId?: string;
  clientName?: string;
  response?: any;
}

export const smsAPI = {
  // Send SMS
  send: async (smsData: SMSRequest): Promise<any> => {
    const response = await apiRequest<any>('/sms/send', {
      method: 'POST',
      body: JSON.stringify(smsData),
    });
    return response;
  },

  // Get SMS history
  getHistory: async (): Promise<SMSHistoryItem[]> => {
    const response = await apiRequest<SMSHistoryItem[]>('/sms/history');
    return response.history || [];
  },

  // Get SMS history for a specific client
  getClientHistory: async (clientId: string): Promise<SMSHistoryItem[]> => {
    const response = await apiRequest<SMSHistoryItem[]>(`/sms/history/client/${clientId}`);
    return response.history || [];
  },
};

// ============================================================
// HEALTH CHECK
// ============================================================

export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
  const response = await apiRequest<{ status: string; timestamp: string }>('/health');
  return response;
};

// Export all APIs
export default {
  clients: clientsAPI,
  transactions: transactionsAPI,
  cashbook: cashbookAPI,
  ownerCapital: ownerCapitalAPI,
  sms: smsAPI,
  healthCheck,
};