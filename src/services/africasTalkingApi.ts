// Africa's Talking API Service for SMS Balance
import { projectId, publicAnonKey } from '/utils/supabase/info';

const AT_API_KEY = 'atsk_eee56107794a362a5f04a427ca658d3c6063ce37b3c7932106e4016e6a7a950c9fc121e0';
const AT_USERNAME = 'william_main_user';

interface ATUserData {
  balance: string;
}

interface ATResponse {
  UserData: ATUserData;
}

/**
 * Fetch SMS balance from Africa's Talking API
 * This is proxied through our backend server to avoid CORS issues
 */
export const fetchSMSBalance = async (): Promise<string> => {
  try {
    console.log('🔄 Fetching SMS balance from Africa\'s Talking...');
    
    // Call our backend endpoint which will proxy the request to Africa's Talking
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-7f28f6fd/sms-balance`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch SMS balance:', errorText);
      throw new Error(`Failed to fetch SMS balance: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ SMS balance fetched successfully:', data);
    
    return data.balance || 'N/A';
  } catch (error) {
    console.error('❌ Error fetching SMS balance:', error);
    throw error;
  }
};

/**
 * Parse balance string to get numeric value
 * Example: "KES 1785.50" -> 1785.50
 */
export const parseBalance = (balanceStr: string): number => {
  const match = balanceStr.match(/[\d,.]+/);
  if (match) {
    return parseFloat(match[0].replace(',', ''));
  }
  return 0;
};

/**
 * Get currency from balance string
 * Example: "KES 1785.50" -> "KES"
 */
export const getCurrency = (balanceStr: string): string => {
  const match = balanceStr.match(/^[A-Z]{3}/);
  return match ? match[0] : 'UGX';
};
