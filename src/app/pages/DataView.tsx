import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { DataTable, Column, DataTableAction } from '@/app/components/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Eye, Edit, Trash2, Database, PlusCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Footer } from '@/app/components/Footer';

interface Client {
  id: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  loanAmount: number;
  outstandingBalance: number;
  totalPaid: number;
  status: string;
  startDate: string;
  dailyPayment: number;
  totalPayable: number;
  guarantorName?: string;
  guarantorId?: string;
  guarantorPhone?: string;
  guarantorLocation?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Transaction {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  amount: number;
  notes?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CashbookEntry {
  id: string;
  date: string;
  time: string;
  description: string;
  type: string;
  amount: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  enteredBy?: string;
}

interface OwnerCapital {
  id: string;
  date: string;
  time: string;
  type: string;
  amount: number;
  description: string;
  createdAt?: string;
}

interface DataViewProps {
  clients: Client[];
  transactions: Transaction[];
  cashbookEntries: CashbookEntry[];
  ownerCapitalTransactions: OwnerCapital[];
  onOwnerCapital?: () => void;
  currentUser?: string | null;
  onDeleteClient?: (clientId: string) => void;
  onEditClient?: (client: Client) => void;
  onViewClient?: (clientId: string) => void;
  onDeleteTransaction?: (transactionId: string) => void;
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteCashbook?: (cashbookId: string) => void;
  onDeleteOwnerCapital?: (ownerCapitalId: string) => void;
  onRepairCashbook?: () => void; // 🔧 New prop for data repair
}

export function DataView({ 
  clients, 
  transactions, 
  cashbookEntries, 
  ownerCapitalTransactions,
  onOwnerCapital,
  currentUser,
  onDeleteClient,
  onEditClient,
  onViewClient,
  onDeleteTransaction,
  onEditTransaction,
  onDeleteCashbook,
  onDeleteOwnerCapital,
  onRepairCashbook // 🔧 New prop for data repair
}: DataViewProps) {
  // Client columns
  const clientColumns: Column<Client>[] = [
    {
      key: 'id',
      label: 'ID',
      width: 'w-32',
      truncate: true,
      maxWidth: '120px',
    },
    {
      key: 'fullName',
      label: 'Full Name',
      width: 'w-48',
    },
    {
      key: 'phoneNumber',
      label: 'Phone',
      width: 'w-36',
    },
    {
      key: 'address',
      label: 'Address',
      truncate: true,
      maxWidth: '200px',
    },
    {
      key: 'loanAmount',
      label: 'Loan Amount',
      type: 'currency',
      width: 'w-36',
    },
    {
      key: 'outstandingBalance',
      label: 'Outstanding',
      type: 'currency',
      width: 'w-36',
    },
    {
      key: 'totalPaid',
      label: 'Total Paid',
      type: 'currency',
      width: 'w-36',
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      width: 'w-28',
    },
    {
      key: 'startDate',
      label: 'Start Date',
      type: 'date',
      width: 'w-32',
    },
    {
      key: 'dailyPayment',
      label: 'Daily Payment',
      type: 'currency',
      width: 'w-36',
    },
    {
      key: 'createdAt',
      label: 'Created At',
      type: 'date',
      width: 'w-32',
      sortable: true,
    },
  ];

  // Transaction columns
  const transactionColumns: Column<Transaction>[] = [
    {
      key: 'id',
      label: 'ID',
      width: 'w-32',
      truncate: true,
      maxWidth: '120px',
    },
    {
      key: 'clientName',
      label: 'Client Name',
      width: 'w-48',
    },
    {
      key: 'date',
      label: 'Date',
      type: 'date',
      width: 'w-32',
    },
    {
      key: 'time',
      label: 'Time',
      type: 'time',
      width: 'w-28',
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'currency',
      width: 'w-36',
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      width: 'w-28',
    },
    {
      key: 'notes',
      label: 'Notes',
      truncate: true,
      maxWidth: '200px',
    },
    {
      key: 'createdAt',
      label: 'Created At',
      type: 'date',
      width: 'w-32',
    },
  ];

  // Cashbook columns
  const cashbookColumns: Column<CashbookEntry>[] = [
    {
      key: 'id',
      label: 'ID',
      width: 'w-32',
      truncate: true,
      maxWidth: '120px',
    },
    {
      key: 'date',
      label: 'Date',
      type: 'date',
      width: 'w-32',
    },
    {
      key: 'time',
      label: 'Time',
      type: 'time',
      width: 'w-28',
    },
    {
      key: 'type',
      label: 'Type',
      type: 'status',
      width: 'w-28',
    },
    {
      key: 'description',
      label: 'Description',
      truncate: true,
      maxWidth: '300px',
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'currency',
      width: 'w-36',
    },
    {
      key: 'enteredBy',
      label: 'Entered By',
      width: 'w-36',
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {value || 'System'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      width: 'w-32',
    },
    {
      key: 'createdAt',
      label: 'Created At',
      type: 'date',
      width: 'w-32',
    },
  ];

  // Owner Capital columns
  const ownerCapitalColumns: Column<OwnerCapital>[] = [
    {
      key: 'id',
      label: 'ID',
      width: 'w-32',
      truncate: true,
      maxWidth: '120px',
    },
    {
      key: 'date',
      label: 'Date',
      type: 'date',
      width: 'w-32',
    },
    {
      key: 'time',
      label: 'Time',
      type: 'time',
      width: 'w-28',
    },
    {
      key: 'type',
      label: 'Type',
      width: 'w-48',
      render: (value) => (
        <span className={value === 'Capital Injection' ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
          {value}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'currency',
      width: 'w-36',
    },
    {
      key: 'description',
      label: 'Description',
      truncate: true,
      maxWidth: '300px',
    },
    {
      key: 'createdAt',
      label: 'Created At',
      type: 'date',
      width: 'w-32',
    },
  ];

  // Actions for demonstration
  const clientActions: DataTableAction<Client>[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row) => {
        if (onViewClient) {
          onViewClient(row.id);
        } else {
          toast.info(`View client: ${row.fullName}`);
        }
      },
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row) => {
        if (onEditClient) {
          onEditClient(row);
        } else {
          toast.info(`Edit client: ${row.fullName}`);
        }
      },
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row) => {
        if (onDeleteClient) {
          onDeleteClient(row.id);
        } else {
          toast.info(`Delete client: ${row.fullName}`);
        }
      },
      variant: 'destructive',
    },
  ];

  // Transaction actions
  const transactionActions: DataTableAction<Transaction>[] = [
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row) => {
        if (onEditTransaction) {
          onEditTransaction(row);
        }
      },
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row) => {
        if (onDeleteTransaction) {
          onDeleteTransaction(row.id);
        }
      },
      variant: 'destructive',
    },
  ];

  // Cashbook actions
  const cashbookActions: DataTableAction<CashbookEntry>[] = [
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row) => {
        if (onDeleteCashbook) {
          onDeleteCashbook(row.id);
        }
      },
      variant: 'destructive',
    },
  ].filter(action => {
    // Only show delete button to owner
    if (action.label === 'Delete' && currentUser !== 'william@boss.com') {
      return false;
    }
    return true;
  });

  // Owner capital actions
  const ownerCapitalActions: DataTableAction<OwnerCapital>[] = [
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row) => {
        if (onDeleteOwnerCapital) {
          onDeleteOwnerCapital(row.id);
        }
      },
      variant: 'destructive',
    },
  ];

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Data View</h1>
            <p className="text-sm text-muted-foreground">
              All records displayed in clean, modern tables
            </p>
          </div>
        </div>
      </div>

      {/* Tabs for different data tables */}
      <Tabs defaultValue="clients" className="w-full">
        <div className="overflow-x-auto mb-4">
          <TabsList className="grid grid-cols-4 w-full min-w-[640px] lg:w-auto lg:min-w-0">
            <TabsTrigger value="clients" className="text-xs sm:text-sm">
              Clients <span className="ml-1 sm:ml-2 text-xs bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded-full">{clients.length}</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs sm:text-sm">
              Transactions <span className="ml-1 sm:ml-2 text-xs bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded-full">{transactions.length}</span>
            </TabsTrigger>
            <TabsTrigger value="cashbook" className="text-xs sm:text-sm">
              Cashbook <span className="ml-1 sm:ml-2 text-xs bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded-full">{cashbookEntries.length}</span>
            </TabsTrigger>
            <TabsTrigger value="capital" className="text-xs sm:text-sm">
              Capital <span className="ml-1 sm:ml-2 text-xs bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded-full">{ownerCapitalTransactions.length}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Clients Table */}
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clients</CardTitle>
              <CardDescription>
                All loan clients with their details and payment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={clients}
                columns={clientColumns}
                actions={clientActions}
                searchable
                searchPlaceholder="Search clients by name, phone, address..."
                emptyMessage="No clients found. Add a new client to get started."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Table */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                All payment transactions recorded in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={transactions}
                columns={transactionColumns}
                actions={transactionActions}
                searchable
                searchPlaceholder="Search transactions by client name, notes..."
                emptyMessage="No transactions found."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cashbook Table */}
        <TabsContent value="cashbook" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cashbook</CardTitle>
                  <CardDescription>
                    Daily income and expense entries
                  </CardDescription>
                </div>
                {/* 🔧 DATA REPAIR BUTTON - Only for william@boss.com */}
                {currentUser === 'william@boss.com' && onRepairCashbook && (
                  <Button onClick={onRepairCashbook} variant="outline" className="gap-2 bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100">
                    <Database className="h-4 w-4" />
                    🔧 Repair Missing Entries
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={cashbookEntries}
                columns={cashbookColumns}
                actions={cashbookActions}
                searchable
                searchPlaceholder="Search cashbook by description..."
                emptyMessage="No cashbook entries found."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Owner Capital Table */}
        <TabsContent value="capital" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Owner Capital</CardTitle>
                  <CardDescription>
                    Capital injections and withdrawals by Texas Finance
                  </CardDescription>
                </div>
                {/* Only show button for william@boss.com */}
                {currentUser === 'william@boss.com' && onOwnerCapital && (
                  <Button onClick={onOwnerCapital} className="gap-2">
                    <DollarSign className="h-4 w-4" />
                    Manage Capital
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={ownerCapitalTransactions}
                columns={ownerCapitalColumns}
                actions={ownerCapitalActions}
                searchable
                searchPlaceholder="Search capital transactions..."
                emptyMessage="No capital transactions found."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Footer />
    </div>
  );
}