import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

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
    await kv.set(`owner-capital:${transaction.id}`, transaction);
    return c.json({ transaction });
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

Deno.serve(app.fetch);
