// GITALA BRANCH - API Service
// Calls backend Supabase functions

import { getServerUrl, getAuthHeaders } from '../utils/supabase';

// Helper to call backend API
const callBackendAPI = async (method: string, endpoint: string, data?: any) => {
  const url = getServerUrl(endpoint);
  const options: RequestInit = {
    method,
    headers: getAuthHeaders(),
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  console.log(`🌐 API Call: ${method} ${endpoint}`);
  
  try {
    const response = await fetch(url, options);
    
    // Check content type
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    let result;
    if (isJson) {
      result = await response.json();
    } else {
      // Non-JSON response (likely an error page)
      const textResponse = await response.text();
      console.error(`❌ Non-JSON response (${response.status}):`, textResponse.substring(0, 200));
      result = {
        error: `Server returned ${response.status} ${response.statusText}`,
        details: textResponse.substring(0, 500),
        isHtmlError: true
      };
    }

    if (!response.ok) {
      console.error(`❌ API Error (${response.status}):`, result);
      const errorMessage = result.error || result.details || `HTTP ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      (error as any).details = result;
      (error as any).status = response.status;
      throw error;
    }

    console.log(`✅ API Success: ${method} ${endpoint}`);
    return result;
  } catch (error) {
    // Re-throw if already processed
    if ((error as any).details) {
      throw error;
    }
    
    // Network error or other fetch error
    console.error(`❌ Network/Fetch Error:`, error);
    const networkError = new Error(`Network error: ${error instanceof Error ? error.message : String(error)}`);
    (networkError as any).details = { originalError: String(error) };
    throw networkError;
  }
};

// ============================================================
// CLIENTS API
// ============================================================

export const clientsApi = {
  getAll: async () => {
    const result = await callBackendAPI('GET', '/clients');
    return result.clients || [];
  },

  getById: async (id: string) => {
    const clients = await clientsApi.getAll();
    const client = clients.find((c: any) => c.id === id);
    if (!client) throw new Error('Client not found');
    return client;
  },

  create: async (client: any) => {
    const result = await callBackendAPI('POST', '/clients', client);
    return result.client;
  },

  update: async (id: string, updatedClient: any) => {
    const result = await callBackendAPI('PUT', `/clients/${id}`, updatedClient);
    return result.client;
  },

  delete: async (id: string) => {
    await callBackendAPI('DELETE', `/clients/${id}`);
    return { success: true };
  },
};

// ============================================================
// TRANSACTIONS API
// ============================================================

export const transactionsApi = {
  getAll: async () => {
    const result = await callBackendAPI('GET', '/transactions');
    return result.transactions || [];
  },

  create: async (transaction: any) => {
    const result = await callBackendAPI('POST', '/transactions', transaction);
    return result.transaction;
  },

  update: async (id: string, updatedTransaction: any) => {
    const result = await callBackendAPI('PUT', `/transactions/${id}`, updatedTransaction);
    return result.transaction;
  },

  delete: async (id: string) => {
    await callBackendAPI('DELETE', `/transactions/${id}`);
    return { success: true };
  },
};

// ============================================================
// CASHBOOK API
// ============================================================

export const cashbookApi = {
  getAll: async () => {
    const result = await callBackendAPI('GET', '/cashbook');
    return result.entries || [];
  },

  create: async (entry: any) => {
    const result = await callBackendAPI('POST', '/cashbook', entry);
    return result.entry;
  },

  update: async (id: string, updatedEntry: any) => {
    const result = await callBackendAPI('PUT', `/cashbook/${id}`, updatedEntry);
    return result.entry;
  },

  delete: async (id: string) => {
    await callBackendAPI('DELETE', `/cashbook/${id}`);
    return { success: true };
  },
};

// ============================================================
// OWNER CAPITAL API
// ============================================================

export const ownerCapitalApi = {
  getAll: async () => {
    const result = await callBackendAPI('GET', '/owner-capital');
    return result.transactions || [];
  },

  create: async (transaction: any) => {
    const result = await callBackendAPI('POST', '/owner-capital', transaction);
    return result.transaction;
  },

  delete: async (id: string) => {
    await callBackendAPI('DELETE', `/owner-capital/${id}`);
    return { success: true };
  },
};

// ============================================================
// SMS API
// ============================================================

export const smsApi = {
  send: async (smsData: any) => {
    console.log('📱 Sending SMS via backend:', smsData);
    
    try {
      // Call the backend SMS endpoint
      const result = await callBackendAPI('POST', '/send-sms', {
        recipients: smsData.recipients,
        message: smsData.message,
      });
      
      // Save to local storage for history
      const STORAGE_KEY = 'gitara_sms_history';
      const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const smsRecord = {
        id: `sms${Date.now()}`,
        ...smsData,
        status: 'Sent',
        sentAt: new Date().toISOString(),
        response: result,
      };
      history.push(smsRecord);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      
      return {
        success: true,
        message: `SMS sent successfully to ${smsData.recipients.length} recipient(s)`,
        smsRecord,
      };
    } catch (error) {
      console.error('❌ Error sending SMS:', error);
      
      // Save failed attempt to history
      const STORAGE_KEY = 'gitara_sms_history';
      const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const smsRecord = {
        id: `sms${Date.now()}`,
        ...smsData,
        status: 'Failed',
        sentAt: new Date().toISOString(),
        response: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
      history.push(smsRecord);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      
      throw error;
    }
  },

  getBalance: async () => {
    console.log('💰 Fetching SMS balance from backend...');
    
    try {
      // Call the backend SMS balance endpoint
      const result = await callBackendAPI('GET', '/sms-balance');
      
      return {
        success: true,
        balance: result.balance,
      };
    } catch (error) {
      console.error('❌ Error fetching SMS balance:', error);
      throw error;
    }
  },

  getHistory: async () => {
    const STORAGE_KEY = 'gitara_sms_history';
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  },

  getClientHistory: async (clientId: string) => {
    const history = await smsApi.getHistory();
    return history.filter((sms: any) => 
      sms.clientIds && sms.clientIds.includes(clientId)
    );
  },
};

// Export default for backward compatibility
export default {
  clients: clientsApi,
  transactions: transactionsApi,
  cashbook: cashbookApi,
  ownerCapital: ownerCapitalApi,
  sms: smsApi,
};