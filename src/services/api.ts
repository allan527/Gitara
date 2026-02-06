import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-68baa523`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

// ============================================================
// CLIENTS API
// ============================================================

export const clientsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/clients`, { headers });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, { headers });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  create: async (client: any) => {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers,
      body: JSON.stringify(client),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  update: async (id: string, client: any) => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(client),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE',
      headers,
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result;
  },
};

// ============================================================
// TRANSACTIONS API
// ============================================================

export const transactionsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/transactions`, { headers });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  getByClientId: async (clientId: string) => {
    const response = await fetch(`${API_BASE_URL}/transactions/client/${clientId}`, { headers });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  create: async (transaction: any) => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(transaction),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  update: async (id: string, transaction: any) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(transaction),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers,
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result;
  },
};

// ============================================================
// CASHBOOK API
// ============================================================

export const cashbookApi = {
  getAll: async () => {
    console.log('🔍 CASHBOOK API: Fetching all entries from server...');
    const response = await fetch(`${API_BASE_URL}/cashbook`, { headers });
    console.log('📥 CASHBOOK API: Response status:', response.status);
    const result = await response.json();
    console.log('📊 CASHBOOK API: Received', result.data?.length || 0, 'entries from database');
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  create: async (entry: any) => {
    console.log('💾 CASHBOOK API: Creating entry...');
    console.log('📋 Entry Data:', JSON.stringify(entry, null, 2));
    console.log('🔗 API URL:', `${API_BASE_URL}/cashbook`);
    
    const response = await fetch(`${API_BASE_URL}/cashbook`, {
      method: 'POST',
      headers,
      body: JSON.stringify(entry),
    });
    
    console.log('📥 CASHBOOK API: Create response status:', response.status);
    const result = await response.json();
    console.log('📊 CASHBOOK API: Create response data:', result);
    
    if (!result.success) {
      console.error('❌ CASHBOOK API: Create FAILED!', result.error);
      throw new Error(result.error);
    }
    
    console.log('✅ CASHBOOK API: Entry created successfully');
    return result.data;
  },

  update: async (id: string, entry: any) => {
    console.log('🔄 CASHBOOK API: Updating entry...');
    console.log('📋 Entry Data:', JSON.stringify(entry, null, 2));
    console.log('🔗 API URL:', `${API_BASE_URL}/cashbook/${id}`);
    
    const response = await fetch(`${API_BASE_URL}/cashbook/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(entry),
    });
    
    console.log('📥 CASHBOOK API: Update response status:', response.status);
    const result = await response.json();
    console.log('📊 CASHBOOK API: Update response data:', result);
    
    if (!result.success) {
      console.error('❌ CASHBOOK API: Update FAILED!', result.error);
      throw new Error(result.error);
    }
    
    console.log('✅ CASHBOOK API: Entry updated successfully');
    return result.data;
  },

  delete: async (id: string) => {
    console.log('🗑️ CASHBOOK API: Deleting entry...');
    console.log('🔗 API URL:', `${API_BASE_URL}/cashbook/${id}`);
    
    const response = await fetch(`${API_BASE_URL}/cashbook/${id}`, {
      method: 'DELETE',
      headers,
    });
    
    console.log('📥 CASHBOOK API: Delete response status:', response.status);
    const result = await response.json();
    console.log('📊 CASHBOOK API: Delete response data:', result);
    
    if (!result.success) {
      // Don't log error here - let the caller handle it
      throw new Error(result.error);
    }
    
    console.log('✅ CASHBOOK API: Entry deleted successfully');
    return result;
  },
};

// ============================================================
// OWNER CAPITAL API
// ============================================================

export const ownerCapitalApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/owner-capital`, { headers });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  create: async (transaction: any) => {
    const response = await fetch(`${API_BASE_URL}/owner-capital`, {
      method: 'POST',
      headers,
      body: JSON.stringify(transaction),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    // Return full result to access both data and cashbookEntry
    return result;
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/owner-capital/${id}`, {
      method: 'DELETE',
      headers,
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result;
  },
};

// ============================================================
// SMS API (Africa's Talking)
// ============================================================

export const smsApi = {
  send: async (data: {
    recipients: string[];
    message: string;
    type?: string;
    clientIds?: string[];
  }) => {
    try {
      console.log('📤 SMS API: Sending request to server...', {
        recipients: data.recipients,
        messageLength: data.message.length,
        type: data.type,
      });

      const response = await fetch(`${API_BASE_URL}/sms/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      console.log('📥 SMS API: Response status:', response.status);

      const result = await response.json();
      
      console.log('📊 SMS API: Response data:', result);

      if (!result.success) {
        const errorMsg = result.error || 'Unknown SMS sending error';
        console.error('❌ SMS API Error:', errorMsg);
        throw new Error(errorMsg);
      }

      return result;
    } catch (error: any) {
      console.error('❌ SMS API Exception:', error);
      throw new Error(`SMS sending failed: ${error.message || error}`);
    }
  },

  getHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/sms/history`, { headers });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },
};