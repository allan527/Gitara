import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { AlertCircle, CheckCircle, Database, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Client, Transaction, CashbookEntry } from '../data/mockData';
import { OwnerCapitalTransaction } from '../hooks/useSupabaseData';

interface DataMigrationProps {
  onMigrate: (data: {
    clients: Client[];
    transactions: Transaction[];
    cashbookEntries: CashbookEntry[];
    ownerCapitalTransactions: OwnerCapitalTransaction[];
  }) => Promise<void>;
  backendConnected: boolean;
}

const STORAGE_KEYS = {
  CLIENTS: 'gitara_branch_clients',
  TRANSACTIONS: 'gitara_branch_transactions',
  CASHBOOK: 'gitara_branch_cashbook',
  OWNER_CAPITAL: 'gitara_branch_owner_capital',
};

export const DataMigration = ({ onMigrate, backendConnected }: DataMigrationProps) => {
  const [localData, setLocalData] = useState<{
    clients: Client[];
    transactions: Transaction[];
    cashbookEntries: CashbookEntry[];
    ownerCapitalTransactions: OwnerCapitalTransaction[];
  } | null>(null);
  
  const [migrating, setMigrating] = useState(false);
  const [migrated, setMigrated] = useState(false);

  useEffect(() => {
    loadLocalData();
  }, []);

  const loadLocalData = () => {
    try {
      const clients = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]');
      const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
      const cashbookEntries = JSON.parse(localStorage.getItem(STORAGE_KEYS.CASHBOOK) || '[]');
      const ownerCapitalTransactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.OWNER_CAPITAL) || '[]');

      setLocalData({
        clients,
        transactions,
        cashbookEntries,
        ownerCapitalTransactions,
      });
    } catch (error) {
      console.error('Error loading local data:', error);
      toast.error('Failed to load local data');
    }
  };

  const handleMigrate = async () => {
    if (!localData) {
      toast.error('No local data to migrate');
      return;
    }

    const totalRecords = 
      localData.clients.length + 
      localData.transactions.length + 
      localData.cashbookEntries.length + 
      localData.ownerCapitalTransactions.length;

    if (totalRecords === 0) {
      toast.info('No data to migrate');
      return;
    }

    const confirmed = confirm(
      `🚀 MIGRATE DATA TO BACKEND\n\n` +
      `You are about to migrate:\n` +
      `- ${localData.clients.length} clients\n` +
      `- ${localData.transactions.length} transactions\n` +
      `- ${localData.cashbookEntries.length} cashbook entries\n` +
      `- ${localData.ownerCapitalTransactions.length} owner capital transactions\n\n` +
      `This will sync your local data to the Supabase backend.\n\n` +
      `Continue?`
    );

    if (!confirmed) return;

    setMigrating(true);
    try {
      await onMigrate(localData);
      setMigrated(true);
      toast.success('✅ Data migrated successfully to backend!', { duration: 5000 });
    } catch (error) {
      console.error('Migration error:', error);
      toast.error(`Failed to migrate data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setMigrating(false);
    }
  };

  if (!localData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-600" />
              Loading Data...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const totalRecords = 
    localData.clients.length + 
    localData.transactions.length + 
    localData.cashbookEntries.length + 
    localData.ownerCapitalTransactions.length;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Database className="h-6 w-6 text-emerald-600" />
            Data Migration to Backend
          </CardTitle>
          <CardDescription>
            {backendConnected ? (
              <span className="flex items-center gap-2 text-emerald-600 font-medium">
                <CheckCircle className="h-4 w-4" />
                Backend connected successfully
              </span>
            ) : (
              <span className="flex items-center gap-2 text-amber-600 font-medium">
                <AlertCircle className="h-4 w-4" />
                Checking backend connection...
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Local Data Summary */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h3 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Local Data Summary
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Clients</div>
                <div className="text-2xl font-bold text-emerald-600">{localData.clients.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Transactions</div>
                <div className="text-2xl font-bold text-emerald-600">{localData.transactions.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Cashbook Entries</div>
                <div className="text-2xl font-bold text-emerald-600">{localData.cashbookEntries.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Owner Capital</div>
                <div className="text-2xl font-bold text-emerald-600">{localData.ownerCapitalTransactions.length}</div>
              </div>
            </div>
          </div>

          {/* Migration Status */}
          {migrated ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900">Migration Complete!</h4>
                  <p className="text-sm text-green-700 mt-1">
                    All your data has been successfully migrated to the backend. You can now close this page and use the app.
                  </p>
                </div>
              </div>
            </div>
          ) : totalRecords === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">No Local Data Found</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    You don't have any local data to migrate. You can start using the app with the backend.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900">Ready to Migrate</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Found {totalRecords} records in local storage. Click the button below to migrate them to the backend database.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Migration Button */}
          {!migrated && totalRecords > 0 && (
            <Button 
              onClick={handleMigrate} 
              disabled={migrating || !backendConnected}
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg"
            >
              {migrating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Migrating Data...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Migrate {totalRecords} Records to Backend
                </>
              )}
            </Button>
          )}

          {/* Skip Button */}
          {!migrated && (
            <Button 
              variant="outline" 
              onClick={() => {
                const skip = confirm('Skip migration? You can migrate data later from the settings.');
                if (skip) {
                  setMigrated(true);
                }
              }}
              className="w-full"
            >
              Skip Migration (Continue with Empty Backend)
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
