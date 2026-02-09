import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

// Dynamic import for Africa's Talking to avoid initialization issues
let AfricasTalking: any;

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Health check
app.get('/make-server-7f28f6fd/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// CLIENTS ENDPOINTS
// ============================================

// Get all clients
app.get('/make-server-7f28f6fd/clients', async (c) => {
  try {
    const clients = await kv.getByPrefix('client:');
    return c.json({ clients: clients || [] });
  } catch (error) {
    console.log('Error fetching clients:', error);
    return c.json({ error: 'Failed to fetch clients', details: String(error) }, 500);
  }
});

// Add new client
app.post('/make-server-7f28f6fd/clients', async (c) => {
  try {
    const client = await c.req.json();
    await kv.set(`client:${client.id}`, client);
    return c.json({ client });
  } catch (error) {
    console.log('Error adding client:', error);
    return c.json({ error: 'Failed to add client', details: String(error) }, 500);
  }
});

// Update client
app.put('/make-server-7f28f6fd/clients/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`client:${id}`);
    if (!existing) {
      return c.json({ error: 'Client not found' }, 404);
    }
    
    const updated = { ...existing, ...updates };
    await kv.set(`client:${id}`, updated);
    return c.json({ client: updated });
  } catch (error) {
    console.log('Error updating client:', error);
    return c.json({ error: 'Failed to update client', details: String(error) }, 500);
  }
});

// Delete client
app.delete('/make-server-7f28f6fd/clients/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`client:${id}`);
    
    // Also delete related transactions
    const transactions = await kv.getByPrefix('transaction:');
    const clientTransactions = transactions.filter((t: any) => t.clientId === id);
    for (const transaction of clientTransactions) {
      await kv.del(`transaction:${transaction.id}`);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting client:', error);
    return c.json({ error: 'Failed to delete client', details: String(error) }, 500);
  }
});

// ============================================
// TRANSACTIONS ENDPOINTS
// ============================================

// Get all transactions
app.get('/make-server-7f28f6fd/transactions', async (c) => {
  try {
    const transactions = await kv.getByPrefix('transaction:');
    return c.json({ transactions: transactions || [] });
  } catch (error) {
    console.log('Error fetching transactions:', error);
    return c.json({ error: 'Failed to fetch transactions', details: String(error) }, 500);
  }
});

// Add new transaction
app.post('/make-server-7f28f6fd/transactions', async (c) => {
  try {
    const transaction = await c.req.json();
    await kv.set(`transaction:${transaction.id}`, transaction);
    return c.json({ transaction });
  } catch (error) {
    console.log('Error adding transaction:', error);
    return c.json({ error: 'Failed to add transaction', details: String(error) }, 500);
  }
});

// Update transaction
app.put('/make-server-7f28f6fd/transactions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`transaction:${id}`);
    if (!existing) {
      return c.json({ error: 'Transaction not found' }, 404);
    }
    
    const updated = { ...existing, ...updates };
    await kv.set(`transaction:${id}`, updated);
    return c.json({ transaction: updated });
  } catch (error) {
    console.log('Error updating transaction:', error);
    return c.json({ error: 'Failed to update transaction', details: String(error) }, 500);
  }
});

// Delete transaction
app.delete('/make-server-7f28f6fd/transactions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`transaction:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting transaction:', error);
    return c.json({ error: 'Failed to delete transaction', details: String(error) }, 500);
  }
});

// ============================================
// CASHBOOK ENDPOINTS
// ============================================

// Get all cashbook entries
app.get('/make-server-7f28f6fd/cashbook', async (c) => {
  try {
    const entries = await kv.getByPrefix('cashbook:');
    return c.json({ entries: entries || [] });
  } catch (error) {
    console.log('Error fetching cashbook entries:', error);
    return c.json({ error: 'Failed to fetch cashbook entries', details: String(error) }, 500);
  }
});

// Add new cashbook entry
app.post('/make-server-7f28f6fd/cashbook', async (c) => {
  try {
    const entry = await c.req.json();
    await kv.set(`cashbook:${entry.id}`, entry);
    return c.json({ entry });
  } catch (error) {
    console.log('Error adding cashbook entry:', error);
    return c.json({ error: 'Failed to add cashbook entry', details: String(error) }, 500);
  }
});

// Update cashbook entry
app.put('/make-server-7f28f6fd/cashbook/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`cashbook:${id}`);
    if (!existing) {
      return c.json({ error: 'Cashbook entry not found' }, 404);
    }
    
    const updated = { ...existing, ...updates };
    await kv.set(`cashbook:${id}`, updated);
    return c.json({ entry: updated });
  } catch (error) {
    console.log('Error updating cashbook entry:', error);
    return c.json({ error: 'Failed to update cashbook entry', details: String(error) }, 500);
  }
});

// Delete cashbook entry
app.delete('/make-server-7f28f6fd/cashbook/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`cashbook:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting cashbook entry:', error);
    return c.json({ error: 'Failed to delete cashbook entry', details: String(error) }, 500);
  }
});

// ============================================
// OWNER CAPITAL ENDPOINTS
// ============================================

// Get all owner capital transactions
app.get('/make-server-7f28f6fd/owner-capital', async (c) => {
  try {
    const transactions = await kv.getByPrefix('owner-capital:');
    return c.json({ transactions: transactions || [] });
  } catch (error) {
    console.log('Error fetching owner capital transactions:', error);
    return c.json({ error: 'Failed to fetch owner capital transactions', details: String(error) }, 500);
  }
});

// Add new owner capital transaction
app.post('/make-server-7f28f6fd/owner-capital', async (c) => {
  try {
    const transaction = await c.req.json();
    
    console.log('📝 Adding owner capital transaction:', transaction);
    console.log('   Type:', transaction.type);
    console.log('   Amount:', transaction.amount);
    
    // Save the owner capital transaction
    await kv.set(`owner-capital:${transaction.id}`, transaction);
    
    // Create corresponding cashbook entry
    // Capital Injection = Income
    // Owner Withdrawal = Expense
    const cashbookEntry = {
      id: `c${Date.now()}`,
      date: transaction.date,
      time: transaction.time,
      description: transaction.description || transaction.type,
      type: transaction.type === 'Capital Injection' ? 'Income' : 'Expense',
      amount: transaction.amount,
      status: transaction.type === 'Capital Injection' ? 'Capital' : 'Withdrawal',
      enteredBy: transaction.enteredBy || 'System',
    };
    
    console.log('📝 Creating cashbook entry:', cashbookEntry);
    
    // Save cashbook entry
    await kv.set(`cashbook:${cashbookEntry.id}`, cashbookEntry);
    
    console.log('✅ Owner capital transaction and cashbook entry created successfully');
    
    return c.json({ 
      transaction,
      cashbookEntry 
    });
  } catch (error) {
    console.log('Error adding owner capital transaction:', error);
    return c.json({ error: 'Failed to add owner capital transaction', details: String(error) }, 500);
  }
});

// Delete owner capital transaction
app.delete('/make-server-7f28f6fd/owner-capital/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`owner-capital:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting owner capital transaction:', error);
    return c.json({ error: 'Failed to delete owner capital transaction', details: String(error) }, 500);
  }
});

// ============================================
// SYNC ENDPOINT (For initial data migration)
// ============================================

// Sync local data to backend
app.post('/make-server-7f28f6fd/sync', async (c) => {
  try {
    const { clients, transactions, cashbookEntries, ownerCapitalTransactions } = await c.req.json();
    
    // Store all data
    if (clients) {
      for (const client of clients) {
        await kv.set(`client:${client.id}`, client);
      }
    }
    
    if (transactions) {
      for (const transaction of transactions) {
        await kv.set(`transaction:${transaction.id}`, transaction);
      }
    }
    
    if (cashbookEntries) {
      for (const entry of cashbookEntries) {
        await kv.set(`cashbook:${entry.id}`, entry);
      }
    }
    
    if (ownerCapitalTransactions) {
      for (const transaction of ownerCapitalTransactions) {
        await kv.set(`owner-capital:${transaction.id}`, transaction);
      }
    }
    
    return c.json({ 
      success: true, 
      synced: {
        clients: clients?.length || 0,
        transactions: transactions?.length || 0,
        cashbookEntries: cashbookEntries?.length || 0,
        ownerCapitalTransactions: ownerCapitalTransactions?.length || 0,
      }
    });
  } catch (error) {
    console.log('Error syncing data:', error);
    return c.json({ error: 'Failed to sync data', details: String(error) }, 500);
  }
});

// ============================================
// SMS ENDPOINT
// ============================================

// Send SMS via Africa's Talking
app.post('/make-server-7f28f6fd/send-sms', async (c) => {
  try {
    const { recipients, message } = await c.req.json();
    
    console.log('📱 Incoming SMS request');
    console.log('   Recipients (raw):', recipients);
    console.log('   Message:', message);
    
    // Get API key from environment
    const apiKey = Deno.env.get('AFRICAS_TALKING_API_KEY');
    
    if (!apiKey) {
      console.log('❌ AFRICAS_TALKING_API_KEY not set in environment variables');
      return c.json({ 
        error: 'SMS service not configured', 
        details: 'AFRICAS_TALKING_API_KEY environment variable is not set' 
      }, 500);
    }
    
    console.log('✅ API Key found');
    
    // Format phone numbers for Africa's Talking (they need +256 format)
    const formattedRecipients = recipients.map((phone: string) => {
      // Remove any spaces or special characters
      let cleaned = phone.replace(/[\s\-\(\)]/g, '');
      
      // If starts with 0, replace with +256
      if (cleaned.startsWith('0')) {
        cleaned = '+256' + cleaned.substring(1);
      }
      // If starts with 256 but no +, add it
      else if (cleaned.startsWith('256')) {
        cleaned = '+' + cleaned;
      }
      // If doesn't start with +, assume it's missing
      else if (!cleaned.startsWith('+')) {
        cleaned = '+256' + cleaned;
      }
      
      return cleaned;
    });
    
    console.log('   Recipients (formatted):', formattedRecipients);
    
    // Use the credentials provided
    const username = 'William_main_user';
    
    console.log(`🔧 Using username: ${username}`);
    console.log(`🔧 API Key (first 10 chars): ${apiKey.substring(0, 10)}...`);
    
    // Initialize Africa's Talking
    if (!AfricasTalking) {
      AfricasTalking = await import('npm:africastalking');
      AfricasTalking = AfricasTalking.default;
    }
    
    const africastalking = AfricasTalking({
      apiKey: apiKey,
      username: username,
    });
    
    const sms = africastalking.SMS;
    
    console.log('📤 Sending SMS to Africa\'s Talking API...');
    
    // Send SMS with Sender ID "ATTech"
    const result = await sms.send({
      to: formattedRecipients,
      message: message,
      from: 'ATTech', // Your registered Sender ID
    });
    
    console.log('✅ SMS API Response:', JSON.stringify(result, null, 2));
    
    return c.json({ 
      success: true, 
      result: result.SMSMessageData,
      recipients: formattedRecipients
    });
  } catch (error) {
    console.log('❌ Error sending SMS (full error object):', error);
    
    // Extract detailed error information (avoid circular references)
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Safely extract error data without circular references
    let safeErrorData: any = {};
    try {
      if ((error as any)?.response?.data) {
        safeErrorData.responseData = (error as any).response.data;
      }
      if ((error as any)?.status) {
        safeErrorData.status = (error as any).status;
      }
      if ((error as any)?.statusText) {
        safeErrorData.statusText = (error as any).statusText;
      }
    } catch (e) {
      console.log('Could not extract additional error data');
    }
    
    console.log('❌ Error message:', errorMessage);
    console.log('❌ Error stack:', errorStack);
    
    return c.json({ 
      error: 'Failed to send SMS', 
      details: errorMessage,
      stack: errorStack,
      errorData: safeErrorData
    }, 500);
  }
});

// Get SMS balance from Africa's Talking
app.get('/make-server-7f28f6fd/sms-balance', async (c) => {
  try {
    console.log('💰 Incoming SMS balance request');
    
    // Get API key from environment
    const apiKey = Deno.env.get('AFRICAS_TALKING_API_KEY');
    
    if (!apiKey) {
      console.log('❌ AFRICAS_TALKING_API_KEY not set in environment variables');
      return c.json({ 
        error: 'SMS service not configured', 
        details: 'AFRICAS_TALKING_API_KEY environment variable is not set' 
      }, 500);
    }
    
    console.log('✅ API Key found');
    
    // Use the credentials provided
    const username = 'William_main_user';
    
    console.log(`🔧 Using username: ${username}`);
    
    // Initialize Africa's Talking
    if (!AfricasTalking) {
      AfricasTalking = await import('npm:africastalking');
      AfricasTalking = AfricasTalking.default;
    }
    
    const africastalking = AfricasTalking({
      apiKey: apiKey,
      username: username,
    });
    
    const sms = africastalking.SMS;
    
    console.log('📤 Fetching SMS balance from Africa\'s Talking API...');
    
    // Fetch user data to get balance
    const result = await africastalking.APPLICATION.fetchApplicationData();
    
    console.log('✅ Application Data Response:', JSON.stringify(result, null, 2));
    
    // Extract balance from UserData
    const balance = result?.UserData?.balance || 'N/A';
    
    return c.json({ 
      success: true, 
      balance: balance
    });
  } catch (error) {
    console.log('❌ Error fetching SMS balance (full error object):', error);
    
    // Extract detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.log('❌ Error message:', errorMessage);
    console.log('❌ Error stack:', errorStack);
    
    return c.json({ 
      error: 'Failed to fetch SMS balance', 
      details: errorMessage,
      stack: errorStack
    }, 500);
  }
});

Deno.serve(app.fetch);