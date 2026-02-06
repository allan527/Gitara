import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// Texas Finance Backend Server
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Key prefixes
const CLIENTS_PREFIX = "clients:";
const TRANSACTIONS_PREFIX = "transactions:";
const CASHBOOK_PREFIX = "cashbook:";
const OWNER_CAPITAL_PREFIX = "owner_capital:";
const SMS_HISTORY_PREFIX = "sms_history:";

// 🔧 DIRECT SUPABASE QUERY - Bypasses kv_store.tsx limit
// This function fetches ALL records with pagination (no 1000 limit)
const getAllByPrefixUnlimited = async (prefix: string): Promise<any[]> => {
  console.log(`🔍 Fetching ALL records with prefix "${prefix}" using unlimited pagination...`);
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  
  let allData: any[] = [];
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    console.log(`   📦 Fetching batch starting at ${from}...`);
    
    const { data, error, count } = await supabase
      .from("kv_store_7f28f6fd")
      .select("key, value", { count: 'exact' })
      .like("key", prefix + "%")
      .range(from, from + batchSize - 1);
    
    if (error) {
      console.error(`   ❌ Error fetching batch:`, error);
      throw new Error(error.message);
    }
    
    if (data && data.length > 0) {
      console.log(`   ✅ Fetched ${data.length} records in this batch`);
      allData = allData.concat(data.map((d) => d.value));
      from += batchSize;
      
      // If we got less than batchSize, we've reached the end
      if (data.length < batchSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }
  
  console.log(`✅ TOTAL RECORDS FETCHED: ${allData.length}`);
  return allData;
};

// Helper function to get all items by prefix
const getAllByPrefix = async (prefix: string) => {
  const items = await kv.getByPrefix(prefix);
  return items || [];
};

// Health check endpoint
app.get("/make-server-7f28f6fd/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================================
// CLIENTS ENDPOINTS
// ============================================================

// Get all clients
app.get("/make-server-7f28f6fd/clients", async (c) => {
  try {
    console.log("📋 FETCHING ALL CLIENTS...");
    const clients = await getAllByPrefixUnlimited(CLIENTS_PREFIX);
    console.log(`✅ Found ${clients.length} clients in database`);
    
    if (clients.length > 0) {
      console.log("📊 Sample client data:", JSON.stringify(clients[0], null, 2));
    } else {
      console.log("⚠️ WARNING: No clients found in database!");
    }
    
    // Sort by created_at descending
    clients.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return c.json({ success: true, data: clients });
  } catch (error) {
    console.log("❌ Error fetching clients:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single client by ID
app.get("/make-server-7f28f6fd/clients/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const client = await kv.get(`${CLIENTS_PREFIX}${id}`);
    
    if (!client) {
      return c.json({ success: false, error: "Client not found" }, 404);
    }

    return c.json({ success: true, data: client });
  } catch (error) {
    console.log("Error fetching client:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add new client
app.post("/make-server-7f28f6fd/clients", async (c) => {
  try {
    const client = await c.req.json();
    
    // Add timestamps
    const clientWithTimestamps = {
      ...client,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`${CLIENTS_PREFIX}${client.id}`, clientWithTimestamps);
    
    return c.json({ success: true, data: clientWithTimestamps });
  } catch (error) {
    console.log("Error adding client:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update client
app.put("/make-server-7f28f6fd/clients/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    // Get existing client
    const existingClient = await kv.get(`${CLIENTS_PREFIX}${id}`);
    
    if (!existingClient) {
      return c.json({ success: false, error: "Client not found" }, 404);
    }
    
    // Merge updates with existing data and update timestamp
    const updatedClient = {
      ...existingClient,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`${CLIENTS_PREFIX}${id}`, updatedClient);
    
    return c.json({ success: true, data: updatedClient });
  } catch (error) {
    console.log("Error updating client:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete client
app.delete("/make-server-7f28f6fd/clients/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Delete client
    await kv.del(`${CLIENTS_PREFIX}${id}`);
    
    // Delete all transactions for this client
    const allTransactions = await getAllByPrefix(TRANSACTIONS_PREFIX);
    const clientTransactions = allTransactions.filter((t: any) => t.clientId === id);
    
    if (clientTransactions.length > 0) {
      const keysToDelete = clientTransactions.map((t: any) => `${TRANSACTIONS_PREFIX}${t.id}`);
      await kv.mdel(keysToDelete);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting client:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================================
// TRANSACTIONS ENDPOINTS
// ============================================================

// Get all transactions
app.get("/make-server-7f28f6fd/transactions", async (c) => {
  try {
    const transactions = await getAllByPrefix(TRANSACTIONS_PREFIX);
    
    // Sort by date and time descending (with null safety)
    transactions.sort((a: any, b: any) => {
      const dateA = a.date || '0000-00-00';
      const dateB = b.date || '0000-00-00';
      const dateCompare = dateB.localeCompare(dateA);
      if (dateCompare !== 0) return dateCompare;
      
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeB.localeCompare(timeA);
    });

    return c.json({ success: true, data: transactions });
  } catch (error) {
    console.log("Error fetching transactions:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get transactions for a specific client
app.get("/make-server-7f28f6fd/transactions/client/:clientId", async (c) => {
  try {
    const clientId = c.req.param("clientId");
    
    const allTransactions = await getAllByPrefix(TRANSACTIONS_PREFIX);
    const clientTransactions = allTransactions.filter((t: any) => t.clientId === clientId);
    
    // Sort by date and time descending (with null safety)
    clientTransactions.sort((a: any, b: any) => {
      const dateA = a.date || '0000-00-00';
      const dateB = b.date || '0000-00-00';
      const dateCompare = dateB.localeCompare(dateA);
      if (dateCompare !== 0) return dateCompare;
      
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeB.localeCompare(timeA);
    });

    return c.json({ success: true, data: clientTransactions });
  } catch (error) {
    console.log("Error fetching client transactions:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add new transaction
app.post("/make-server-7f28f6fd/transactions", async (c) => {
  try {
    const transaction = await c.req.json();
    
    // Add timestamps
    const transactionWithTimestamps = {
      ...transaction,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`${TRANSACTIONS_PREFIX}${transaction.id}`, transactionWithTimestamps);
    
    return c.json({ success: true, data: transactionWithTimestamps });
  } catch (error) {
    console.log("Error adding transaction:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update transaction
app.put("/make-server-7f28f6fd/transactions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    // Get existing transaction
    const existingTransaction = await kv.get(`${TRANSACTIONS_PREFIX}${id}`);
    
    if (!existingTransaction) {
      return c.json({ success: false, error: "Transaction not found" }, 404);
    }
    
    // Merge updates with existing data and update timestamp
    const updatedTransaction = {
      ...existingTransaction,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`${TRANSACTIONS_PREFIX}${id}`, updatedTransaction);
    
    return c.json({ success: true, data: updatedTransaction });
  } catch (error) {
    console.log("Error updating transaction:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete transaction
app.delete("/make-server-7f28f6fd/transactions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`${TRANSACTIONS_PREFIX}${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting transaction:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================================
// CASHBOOK ENTRIES ENDPOINTS
// ============================================================

// Get all cashbook entries
app.get("/make-server-7f28f6fd/cashbook", async (c) => {
  try {
    console.log('📥 GET /cashbook - Fetching ALL cashbook entries with unlimited pagination...');
    
    // 🔧 USE UNLIMITED PAGINATION to bypass 1000 record limit
    const entries = await getAllByPrefixUnlimited(CASHBOOK_PREFIX);
    
    console.log(`📊 Found ${entries.length} cashbook entries in database (UNLIMITED QUERY)`);
    
    if (entries.length > 0) {
      console.log('📋 First 3 cashbook entries:');
      entries.slice(0, 3).forEach((entry: any, index: number) => {
        console.log(`   ${index + 1}. ID: ${entry.id}, Date: ${entry.date}, Amount: ${entry.amount}, Description: ${entry.description}`);
      });
    } else {
      console.log('⚠️ WARNING: No cashbook entries found in database!');
    }
    
    // Sort by date and time descending (with null safety)
    entries.sort((a: any, b: any) => {
      const dateA = a.date || '0000-00-00';
      const dateB = b.date || '0000-00-00';
      const dateCompare = dateB.localeCompare(dateA);
      if (dateCompare !== 0) return dateCompare;
      
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeB.localeCompare(timeA);
    });

    console.log(`✅ Returning ${entries.length} cashbook entries to client`);
    return c.json({ success: true, data: entries });
  } catch (error) {
    console.error('❌ Error fetching cashbook entries:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add new cashbook entry
app.post("/make-server-7f28f6fd/cashbook", async (c) => {
  try {
    const entry = await c.req.json();
    
    console.log('📥 CASHBOOK POST REQUEST RECEIVED:');
    console.log('   Entry ID:', entry.id);
    console.log('   Entry Data:', JSON.stringify(entry, null, 2));
    
    // Add timestamps and enteredBy
    const entryWithTimestamps = {
      ...entry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      enteredBy: entry.enteredBy || 'System', // Track who entered the data
    };
    
    const dbKey = `${CASHBOOK_PREFIX}${entry.id}`;
    console.log('💾 Saving to database with key:', dbKey);
    console.log('📦 Full entry to save:', JSON.stringify(entryWithTimestamps, null, 2));
    
    try {
      await kv.set(dbKey, entryWithTimestamps);
      console.log('✅ kv.set() completed without error');
    } catch (kvError: any) {
      console.error('❌ CRITICAL: kv.set() FAILED!');
      console.error('   Key:', dbKey);
      console.error('   Error:', kvError);
      console.error('   Error Message:', kvError?.message);
      console.error('   Error Stack:', kvError?.stack);
      throw new Error(`Database save failed: ${kvError?.message || kvError}`);
    }
    
    console.log('✅ CASHBOOK ENTRY SAVED TO DATABASE');
    console.log('   Key:', dbKey);
    console.log('   Data:', JSON.stringify(entryWithTimestamps, null, 2));
    
    // Verify it was saved by reading it back
    console.log('🔍 Verifying save by reading back from database...');
    try {
      const verification = await kv.get(dbKey);
      if (verification) {
        console.log('✅ VERIFICATION SUCCESS: Entry confirmed in database');
        console.log('   Verified data:', JSON.stringify(verification, null, 2));
      } else {
        console.error('❌ VERIFICATION FAILED: Entry not found in database after save!');
        console.error('   Attempted to read key:', dbKey);
        throw new Error('Database verification failed - entry not found after save');
      }
    } catch (verifyError: any) {
      console.error('❌ VERIFICATION ERROR:', verifyError);
      throw new Error(`Database verification failed: ${verifyError?.message || verifyError}`);
    }
    
    return c.json({ success: true, data: entryWithTimestamps });
  } catch (error: any) {
    console.error('❌ ERROR ADDING CASHBOOK ENTRY:', error);
    console.error('   Error type:', typeof error);
    console.error('   Error message:', error?.message);
    console.error('   Error details:', String(error));
    console.error('   Error stack:', error?.stack);
    return c.json({ success: false, error: String(error?.message || error) }, 500);
  }
});

// Update cashbook entry
app.put("/make-server-7f28f6fd/cashbook/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    // Get existing entry
    const existingEntry = await kv.get(`${CASHBOOK_PREFIX}${id}`);
    
    if (!existingEntry) {
      return c.json({ success: false, error: "Cashbook entry not found" }, 404);
    }
    
    // Merge updates with existing data and update timestamp
    const updatedEntry = {
      ...existingEntry,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`${CASHBOOK_PREFIX}${id}`, updatedEntry);
    
    return c.json({ success: true, data: updatedEntry });
  } catch (error) {
    console.log("Error updating cashbook entry:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete cashbook entry
app.delete("/make-server-7f28f6fd/cashbook/:id", async (c) => {
  try {
    const id = c.req.param("id");
    console.log(`🗑️ DELETE CASHBOOK: Deleting entry with ID: ${id}`);
    console.log(`🔑 Key to delete: ${CASHBOOK_PREFIX}${id}`);
    
    // Check if entry exists before deleting
    const existingEntry = await kv.get(`${CASHBOOK_PREFIX}${id}`) as any;
    if (!existingEntry) {
      console.log(`⚠️ DELETE CASHBOOK: Entry ${id} NOT FOUND in database`);
      return c.json({ success: false, error: "Cashbook entry not found" }, 404);
    }
    
    console.log(`✅ DELETE CASHBOOK: Entry found:`, existingEntry);
    console.log(`📋 Description: ${existingEntry.description}`);
    console.log(`📋 Category: ${existingEntry.category || 'N/A'}`);
    
    // 🆕 CASCADING DELETE LOGIC
    // Identify the type of cashbook entry and cascade delete to related records
    
    // 1. Check if this is an Owner Capital entry
    if (existingEntry.category?.includes('Owner Capital') || 
        existingEntry.description?.includes('Owner Capital')) {
      console.log('🔍 Detected Owner Capital entry - searching for related owner capital transaction...');
      
      // Find the related owner capital transaction
      const allOwnerCapital = await kv.getByPrefix(OWNER_CAPITAL_PREFIX);
      const relatedOwnerCapital = allOwnerCapital.find((oc: any) => {
        const ocDate = oc.date;
        const ocAmount = oc.amount;
        return ocDate === existingEntry.date && ocAmount === existingEntry.amount;
      });
      
      if (relatedOwnerCapital) {
        console.log(`🗑️ Deleting related owner capital transaction: ${relatedOwnerCapital.id}`);
        await kv.del(`${OWNER_CAPITAL_PREFIX}${relatedOwnerCapital.id}`);
        console.log(`✅ Related owner capital transaction deleted`);
      }
    }
    
    // 2. Check if this is a Loan Repayment (linked to a transaction)
    else if (existingEntry.description?.includes('Loan repayment') || 
             existingEntry.description?.includes('Payment from')) {
      console.log('🔍 Detected Loan Repayment entry - searching for related transaction...');
      
      // Extract client name from description (e.g., "Loan repayment - John Doe")
      const clientNameMatch = existingEntry.description.match(/(?:Loan repayment - |Payment from )(.+)/);
      if (clientNameMatch) {
        const clientName = clientNameMatch[1];
        console.log(`🔍 Client name extracted: ${clientName}`);
        
        // Find the related transaction
        const allTransactions = await kv.getByPrefix(TRANSACTIONS_PREFIX);
        const relatedTransaction = allTransactions.find((t: any) => {
          return t.clientName === clientName && 
                 t.date === existingEntry.date && 
                 t.amount === existingEntry.amount;
        });
        
        if (relatedTransaction) {
          console.log(`🔍 Found related transaction: ${relatedTransaction.id}`);
          console.log(`🔍 Need to reverse client balance changes...`);
          
          // Find the client and reverse the payment
          const allClients = await kv.getByPrefix(CLIENTS_PREFIX);
          const client = allClients.find((c: any) => c.fullName === clientName);
          
          if (client) {
            console.log(`🔍 Found client: ${client.fullName}`);
            console.log(`📊 Current totalPaid: ${client.totalPaid}, outstandingBalance: ${client.outstandingBalance}`);
            
            // Reverse the payment: subtract from totalPaid, add to outstandingBalance
            const updatedClient = {
              ...client,
              totalPaid: client.totalPaid - relatedTransaction.amount,
              outstandingBalance: client.outstandingBalance + relatedTransaction.amount,
              status: (client.outstandingBalance + relatedTransaction.amount) > 0 ? 'Active' : client.status,
              totalLoansCompleted: client.status === 'Completed' ? Math.max(0, (client.totalLoansCompleted || 0) - 1) : (client.totalLoansCompleted || 0),
            };
            
            console.log(`📊 Updated totalPaid: ${updatedClient.totalPaid}, outstandingBalance: ${updatedClient.outstandingBalance}`);
            console.log(`🔄 Updating client in database...`);
            await kv.set(`${CLIENTS_PREFIX}${client.id}`, updatedClient);
            console.log(`✅ Client balance reversed`);
          }
          
          // Delete the transaction
          console.log(`🗑️ Deleting related transaction: ${relatedTransaction.id}`);
          await kv.del(`${TRANSACTIONS_PREFIX}${relatedTransaction.id}`);
          console.log(`✅ Related transaction deleted`);
        }
      }
    }
    
    // 3. Check if this is a Processing Fee or Loan Disbursement (linked to client creation)
    else if (existingEntry.description?.includes('Processing Fee') || 
             existingEntry.description?.includes('Loan disbursement')) {
      console.log('⚠️ This is a Processing Fee or Loan Disbursement entry');
      console.log('⚠️ These are created when a client is added. Deleting this entry will NOT delete the client.');
      console.log('⚠️ If you want to remove the client completely, delete the client instead.');
    }
    
    // 4. Regular expense - no cascading needed
    else {
      console.log('📝 Regular expense entry - no cascading delete needed');
    }
    
    // Finally, delete the cashbook entry itself
    console.log(`✅ DELETE CASHBOOK: Proceeding to delete cashbook entry...`);
    await kv.del(`${CASHBOOK_PREFIX}${id}`);
    
    // Verify deletion
    const verifyDeleted = await kv.get(`${CASHBOOK_PREFIX}${id}`);
    if (verifyDeleted) {
      console.log(`❌ DELETE CASHBOOK: Entry ${id} STILL EXISTS after deletion!`);
      return c.json({ success: false, error: "Failed to delete entry" }, 500);
    }
    
    console.log(`✅ DELETE CASHBOOK: Entry ${id} successfully deleted from database`);
    return c.json({ success: true });
  } catch (error) {
    console.log("❌ DELETE CASHBOOK ERROR:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================================
// OWNER CAPITAL ENDPOINTS
// ============================================================

// Get all owner capital transactions
app.get("/make-server-7f28f6fd/owner-capital", async (c) => {
  try {
    const capitalTransactions = await getAllByPrefix(OWNER_CAPITAL_PREFIX);
    
    // Sort by date and time descending (with null safety)
    capitalTransactions.sort((a: any, b: any) => {
      const dateA = a.date || '0000-00-00';
      const dateB = b.date || '0000-00-00';
      const dateCompare = dateB.localeCompare(dateA);
      if (dateCompare !== 0) return dateCompare;
      
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeB.localeCompare(timeA);
    });

    return c.json({ success: true, data: capitalTransactions });
  } catch (error) {
    console.log("Error fetching owner capital:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add owner capital transaction
app.post("/make-server-7f28f6fd/owner-capital", async (c) => {
  try {
    const transaction = await c.req.json();
    
    console.log('🟢 BACKEND: Received owner capital transaction:', transaction);
    console.log('🟢 Transaction type received:', transaction.type);
    console.log('🟢 Type comparison check:', {
      receivedType: transaction.type,
      isCapitalInjection: transaction.type === 'Capital Injection',
      isOwnerWithdrawal: transaction.type === 'Owner Withdrawal',
    });
    
    // Add timestamps
    const transactionWithTimestamps = {
      ...transaction,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`${OWNER_CAPITAL_PREFIX}${transaction.id}`, transactionWithTimestamps);
    
    // 🆕 AUTOMATICALLY CREATE CASHBOOK ENTRY for owner capital transactions
    // Capital Injection (Add Money) = Income in Cashbook
    // Owner Withdrawal (Remove Money) = Expense in Cashbook
    // 🔧 Use owner capital transaction ID to prevent duplicates
    const cashbookEntryId = `oc_cashbook_${transaction.id}`;
    
    // Check if cashbook entry already exists to prevent duplicates
    const existingCashbookEntry = await kv.get(`${CASHBOOK_PREFIX}${cashbookEntryId}`);
    
    if (existingCashbookEntry) {
      console.log('⚠️ Cashbook entry already exists for this owner capital transaction, skipping duplicate creation');
      return c.json({ success: true, data: transactionWithTimestamps, cashbookEntry: existingCashbookEntry });
    }
    
    const cashbookType = transaction.type === 'Capital Injection' ? 'Income' : 'Expense';
    const cashbookStatus = transaction.type === 'Capital Injection' ? 'Profit' : 'Expense';
    
    console.log('🟢 Creating cashbook entry with type:', cashbookType);
    console.log('🟢 Creating cashbook entry with status:', cashbookStatus);
    
    const cashbookEntry = {
      id: cashbookEntryId,
      date: transaction.date,
      time: transaction.time,
      type: cashbookType,
      category: transaction.type === 'Capital Injection' ? '💰 Owner Capital Injection' : '💸 Owner Capital Withdrawal',
      description: `${transaction.type === 'Capital Injection' ? 'Capital Injected' : 'Capital Withdrawn'} by Owner - ${transaction.description || 'Owner Capital Transaction'}`,
      amount: transaction.amount,
      status: cashbookStatus,
      enteredBy: transaction.enteredBy || 'Owner',
      createdAt: new Date().toISOString(),
    };
    
    console.log('🟢 Final cashbook entry to save:', cashbookEntry);
    
    await kv.set(`${CASHBOOK_PREFIX}${cashbookEntryId}`, cashbookEntry);
    
    console.log(`✅ Owner capital transaction recorded and added to cashbook as ${cashbookEntry.type}`);
    
    return c.json({ success: true, data: transactionWithTimestamps, cashbookEntry });
  } catch (error) {
    console.log("Error adding owner capital transaction:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete owner capital transaction
app.delete("/make-server-7f28f6fd/owner-capital/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Get the owner capital transaction to find associated cashbook entry
    const ownerCapitalTransaction = await kv.get(`${OWNER_CAPITAL_PREFIX}${id}`);
    
    // Delete the owner capital transaction
    await kv.del(`${OWNER_CAPITAL_PREFIX}${id}`);
    
    // 🔧 Find and delete associated cashbook entry
    // The cashbook entry was created with description containing the owner capital description
    if (ownerCapitalTransaction) {
      const allCashbook = await getAllByPrefix(CASHBOOK_PREFIX);
      const associatedCashbookEntry = allCashbook.find((entry: any) => 
        entry.description?.includes(ownerCapitalTransaction.description) &&
        entry.enteredBy === ownerCapitalTransaction.enteredBy &&
        entry.date === ownerCapitalTransaction.date &&
        (entry.category?.includes('Owner Capital') || entry.status === 'Profit')
      );
      
      if (associatedCashbookEntry) {
        console.log(`🗑️ Deleting associated cashbook entry: ${associatedCashbookEntry.id}`);
        await kv.del(`${CASHBOOK_PREFIX}${associatedCashbookEntry.id}`);
      }
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting owner capital transaction:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================================
// SMS / MESSAGING ENDPOINTS (Africa's Talking Integration)
// ============================================================

// Send SMS via Africa's Talking
app.post("/make-server-7f28f6fd/sms/send", async (c) => {
  try {
    const { recipients, message, type, clientIds } = await c.req.json();
    
    console.log("📤 SMS Request received:", { recipients, messageLength: message?.length, type, clientIds });
    
    // Validate inputs
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return c.json({ success: false, error: "No recipients provided" }, 400);
    }
    
    if (!message || message.trim() === "") {
      return c.json({ success: false, error: "Message content is required" }, 400);
    }
    
    // Get API credentials from environment
    const apiKey = Deno.env.get("AFRICAS_TALKING_API_KEY");
    const username = Deno.env.get("AFRICAS_TALKING_USERNAME");
    
    if (!apiKey) {
      console.error("❌ AFRICAS_TALKING_API_KEY not configured");
      return c.json({ 
        success: false, 
        error: "SMS service not configured. Please contact administrator." 
      }, 500);
    }
    
    if (!username) {
      console.error("❌ AFRICAS_TALKING_USERNAME not configured");
      return c.json({ 
        success: false, 
        error: "SMS username not configured. Please set AFRICAS_TALKING_USERNAME environment variable." 
      }, 500);
    }
    
    console.log("🔑 API Key (first 20 chars):", apiKey?.substring(0, 20) + "...");
    console.log("👤 Username:", username);
    console.log("🔍 API Key length:", apiKey?.length);
    console.log("🔍 Username length:", username?.length);
    console.log("🔍 API Key starts with 'atsk_':", apiKey?.startsWith('atsk_'));
    
    // Format phone numbers for Uganda (+256)
    const formattedRecipients = recipients.map((phone: string) => {
      // Remove any spaces or special characters
      let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      
      // If starts with 0, replace with +256
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '+256' + cleanPhone.substring(1);
      }
      // If doesn't start with +, add +256
      else if (!cleanPhone.startsWith('+')) {
        cleanPhone = '+256' + cleanPhone;
      }
      
      return cleanPhone;
    });
    
    console.log("📱 Formatted recipients:", formattedRecipients);
    
    // Send SMS via Africa's Talking API
    const atApiUrl = "https://api.africastalking.com/version1/messaging";
    
    const smsPayload = new URLSearchParams({
      username: username,
      to: formattedRecipients.join(','),
      message: message,
      from: "ATTech", // Sender ID
    });
    
    console.log("🚀 Sending to Africa's Talking API...");
    console.log("🔑 Using API Key:", apiKey?.substring(0, 15) + "...");
    console.log("👤 Username:", username);
    
    const atResponse = await fetch(atApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "apikey": apiKey, // Africa's Talking uses lowercase 'apikey'
        "Accept": "application/json",
      },
      body: smsPayload.toString(),
    });
    
    console.log("📥 Response Status:", atResponse.status);
    console.log("📥 Response Headers:", Object.fromEntries(atResponse.headers));
    
    // Check content type before parsing
    const contentType = atResponse.headers.get("content-type") || "";
    console.log("📥 Content-Type:", contentType);
    
    // Get response text first
    const responseText = await atResponse.text();
    console.log("📥 Raw Response Text:", responseText.substring(0, 500));
    
    // Try to parse as JSON, but handle non-JSON responses
    let atResult: any;
    if (contentType.includes("application/json")) {
      try {
        atResult = JSON.parse(responseText);
        console.log("📥 Parsed JSON Response:", atResult);
      } catch (parseError) {
        console.error("❌ Failed to parse JSON response:", parseError);
        return c.json({ 
          success: false, 
          error: `API returned invalid JSON. Response: ${responseText.substring(0, 200)}` 
        }, 500);
      }
    } else {
      // Non-JSON response (likely an error HTML page)
      console.error("❌ API returned non-JSON response");
      console.error("Response preview:", responseText.substring(0, 500));
      
      return c.json({ 
        success: false, 
        error: `Africa's Talking API error: ${responseText.substring(0, 200)}. Please check your API credentials.` 
      }, 500);
    }
    
    // Check if SMS was sent successfully
    if (atResponse.ok && atResult.SMSMessageData?.Recipients) {
      const sentCount = atResult.SMSMessageData.Recipients.filter(
        (r: any) => r.statusCode === 101 || r.statusCode === 102
      ).length;
      
      // Save to SMS history
      const smsRecord = {
        id: `sms${Date.now()}`,
        recipients: formattedRecipients,
        message,
        type: type || "general",
        clientIds: clientIds || [],
        sentAt: new Date().toISOString(),
        status: "sent",
        sentCount,
        response: atResult,
      };
      
      await kv.set(`${SMS_HISTORY_PREFIX}${smsRecord.id}`, smsRecord);
      
      console.log(`✅ SMS sent to ${sentCount} recipient(s)`);
      
      return c.json({ 
        success: true, 
        data: {
          sentCount,
          recipients: formattedRecipients,
          atResponse: atResult,
        }
      });
    } else {
      console.error("❌ Africa's Talking API error:", atResult);
      return c.json({ 
        success: false, 
        error: atResult.SMSMessageData?.Message || "Failed to send SMS" 
      }, 400);
    }
    
  } catch (error: any) {
    console.error("❌ Exception in SMS endpoint:", error);
    return c.json({ 
      success: false, 
      error: `SMS sending failed: ${error.message || String(error)}` 
    }, 500);
  }
});

// Get SMS history
app.get("/make-server-7f28f6fd/sms/history", async (c) => {
  try {
    const history = await getAllByPrefix(SMS_HISTORY_PREFIX);
    
    // Sort by sentAt descending
    history.sort((a: any, b: any) => {
      return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
    });

    return c.json({ success: true, data: history });
  } catch (error) {
    console.log("Error fetching SMS history:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get SMS history for a specific client
app.get("/make-server-7f28f6fd/sms/history/client/:clientId", async (c) => {
  try {
    const clientId = c.req.param("clientId");
    
    const allHistory = await getAllByPrefix(SMS_HISTORY_PREFIX);
    const clientHistory = allHistory.filter((sms: any) => 
      sms.clientIds?.includes(clientId)
    );
    
    // Sort by sentAt descending
    clientHistory.sort((a: any, b: any) => {
      return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
    });

    return c.json({ success: true, data: clientHistory });
  } catch (error) {
    console.log("Error fetching client SMS history:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Start the Texas Finance server
Deno.serve(app.fetch);