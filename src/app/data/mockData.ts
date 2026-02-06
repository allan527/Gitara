// Mock data for William Loans dashboard

export interface Client {
  id: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  loanAmount: number;
  outstandingBalance: number;
  totalPaid: number;
  status: 'Active' | 'Completed' | 'Defaulted';
  startDate: string;
  dailyPayment: number;
  totalPayable: number;
  guarantorName?: string;
  guarantorId?: string;
  guarantorPhone?: string;
  guarantorLocation?: string;
  createdBy?: string; // User who added the client
  loanIssuedBy?: string; // User who issued/disbursed the loan
  assignedTo?: string; // User assigned to collect payments from this client
  currentLoanNumber?: number; // 🆕 Track which loan number this is (1 for first loan, 2 for second, etc.)
  totalLoansCompleted?: number; // 🆕 How many loans has this client completed before
}

export interface Transaction {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  amount: number;
  notes: string;
  status: 'Paid' | 'Unpaid';
  recordedBy?: string; // User who recorded this payment/transaction
  loanNumber?: number; // 🆕 Track which loan this transaction belongs to (1, 2, 3, etc.)
  isNewLoan?: boolean; // 🆕 Flag to indicate this is a new loan disbursement
}

export interface CashbookEntry {
  id: string;
  date: string;
  time: string;
  description: string;
  type: 'Income' | 'Expense';
  amount: number;
  status: 'Paid' | 'Expense' | 'Profit' | 'Disbursement';
  enteredBy?: string; // User who entered this cashbook entry
}

// Ugandan locations
const ugandaLocations = [
  'Kampala, Central Division',
  'Entebbe, Wakiso District',
  'Jinja, Eastern Region',
  'Mbarara, Western Region',
  'Gulu, Northern Region',
  'Mbale, Eastern Region',
  'Mukono, Central Region',
  'Kasese, Western Region',
  'Masaka, Central Region',
  'Lira, Northern Region',
  'Hoima, Western Region',
  'Soroti, Eastern Region',
  'Kabale, Western Region',
  'Arua, West Nile Region',
  'Fort Portal, Western Region',
];

// ⚠️ NO MOCK DATA - App starts empty
export const mockClients: Client[] = [];

// ⚠️ NO MOCK DATA - App starts empty  
export const mockTransactions: Transaction[] = [];

// ⚠️ NO MOCK DATA - App starts empty
export const mockCashbookEntries: CashbookEntry[] = [];

// ⚠️ NO MOCK DATA - App starts empty
export const newBorrowersThisWeek: any[] = [];

// ⚠️ NO MOCK DATA - App starts empty
export const newBorrowersToday: any[] = [];

// ⚠️ NO MOCK DATA - App starts empty
export const loanActivityData: any[] = [];

// Helper function to format UGX currency
export const formatUGX = (amount: number): string => {
  return `UGX ${amount.toLocaleString('en-UG')}`;
};

// Helper function to validate Uganda phone numbers
// Valid formats: 07XXXXXXXX, 256XXXXXXXXX, +256XXXXXXXXX (total 10 digits after country code)
export const validatePhoneNumber = (phoneNumber: string): { valid: boolean; error?: string } => {
  if (!phoneNumber) return { valid: false, error: 'Phone number is required' };
  
  // Remove all spaces, dashes, and parentheses
  let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Remove + prefix if exists
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // Check if starts with 256 (Uganda country code)
  if (cleaned.startsWith('256')) {
    // After removing 256, should have exactly 9 digits
    const localNumber = cleaned.substring(3);
    if (localNumber.length !== 9) {
      return { 
        valid: false, 
        error: `Invalid Uganda phone number. After +256, need 9 digits. You have ${localNumber.length} digits (${localNumber}). Example: +256 700 123456` 
      };
    }
    // First digit should be 7, 3, or 4 (common Uganda mobile prefixes)
    if (!['7', '3', '4'].includes(localNumber[0])) {
      return {
        valid: false,
        error: 'Uganda mobile numbers typically start with 7, 3, or 4 after +256'
      };
    }
    return { valid: true };
  }
  
  // Check if starts with 0 (local format)
  if (cleaned.startsWith('0')) {
    // Should have exactly 10 digits total (0 + 9 digits)
    if (cleaned.length !== 10) {
      return { 
        valid: false, 
        error: `Invalid phone number. Local format needs 10 digits (0XXXXXXXXX). You have ${cleaned.length} digits (${cleaned}). Example: 0700123456` 
      };
    }
    // Second digit should be 7, 3, or 4
    if (!['7', '3', '4'].includes(cleaned[1])) {
      return {
        valid: false,
        error: 'Uganda mobile numbers typically start with 07XX, 03XX, or 04XX'
      };
    }
    return { valid: true };
  }
  
  // If doesn't start with 256 or 0, check if it's 9 digits (assume Uganda)
  if (cleaned.length === 9) {
    if (!['7', '3', '4'].includes(cleaned[0])) {
      return {
        valid: false,
        error: 'Uganda mobile numbers typically start with 7, 3, or 4'
      };
    }
    return { valid: true };
  }
  
  return { 
    valid: false, 
    error: `Invalid phone number format. Use: +256 700 123456 or 0700123456 (must be 9 digits after country code)` 
  };
};

// 🆕 Helper function to attempt auto-correction of phone numbers
export const attemptPhoneCorrection = (phoneNumber: string): { corrected: string; suggestion: string } | null => {
  if (!phoneNumber) return null;
  
  // Remove all spaces, dashes, and parentheses
  let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Remove + prefix if exists
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // Remove country code if present
  if (cleaned.startsWith('256')) {
    cleaned = cleaned.substring(3);
  }
  
  // Remove leading 0 if present
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Now we should have just the local number without 0 or country code
  // Check if it's 8 digits (missing one digit)
  if (cleaned.length === 8 && ['7', '3', '4'].includes(cleaned[0])) {
    // Suggest adding a digit at the end (most common mistake)
    const suggestion1 = '0' + cleaned + '0';
    return {
      corrected: suggestion1,
      suggestion: `Phone appears to be missing a digit. Try: ${suggestion1} (added 0 at end)`
    };
  }
  
  // Check if it's 9 digits but doesn't start with 0
  if (cleaned.length === 9 && ['7', '3', '4'].includes(cleaned[0])) {
    const corrected = '0' + cleaned;
    return {
      corrected: corrected,
      suggestion: `Added leading 0: ${corrected}`
    };
  }
  
  // Check if it's 7 digits (missing 2 digits)
  if (cleaned.length === 7 && ['7', '3', '4'].includes(cleaned[0])) {
    const suggestion = '0' + cleaned + '00';
    return {
      corrected: suggestion,
      suggestion: `Phone appears to be missing 2 digits. Try: ${suggestion} (added 00 at end)`
    };
  }
  
  return null;
};

// Helper function to normalize phone numbers (remove country code)
// Converts: +256777123456 or 256777123456 -> 0777123456
export const normalizePhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove all spaces, dashes, and parentheses
  let normalized = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Remove + prefix if exists
  if (normalized.startsWith('+')) {
    normalized = normalized.substring(1);
  }
  
  // If starts with 256 (Uganda country code), remove it and add 0
  if (normalized.startsWith('256')) {
    normalized = '0' + normalized.substring(3);
  }
  
  // If doesn't start with 0, add it
  if (!normalized.startsWith('0')) {
    normalized = '0' + normalized;
  }
  
  return normalized;
};