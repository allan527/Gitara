import { TrendingUp, TrendingDown, DollarSign, Plus, Crown, Trash2, RefreshCw } from 'lucide-react';
import { CashbookEntry, formatUGX } from '../data/mockData';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Footer } from '../components/Footer';

interface CashbookProps {
  entries: CashbookEntry[];
  onAddExpense: () => void;
  onOwnerCapital?: () => void;
  onCleanupDuplicates?: () => void;
  onRefreshData?: () => void;
  onDeleteEntry?: (entryId: string) => void; // 🆕 Add delete handler
  currentUser?: string | null;
}

// Card component (simple div wrapper)
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

// Table components (simple HTML table wrappers with Tailwind)
function Table({ children }: { children: React.ReactNode }) {
  return <table className="w-full">{children}</table>;
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="bg-gray-50">{children}</thead>;
}

function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-gray-200">{children}</tbody>;
}

function TableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={className}>{children}</tr>;
}

function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left text-xs ${className || ''}`}>{children}</th>;
}

function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm ${className || ''}`}>{children}</td>;
}

export function Cashbook({ entries, onAddExpense, onOwnerCapital, onCleanupDuplicates, onRefreshData, onDeleteEntry, currentUser }: CashbookProps) {
  // Check if current user is the owner
  const isOwner = currentUser === 'william@boss.com';

  // Group entries by date
  const entriesByDate = entries.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = [];
    }
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, CashbookEntry[]>);

  // Calculate daily summaries
  const dailySummaries = Object.entries(entriesByDate).map(([date, dayEntries]) => {
    const totalIncome = dayEntries
      .filter(e => e.type === 'Income')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalExpenses = dayEntries
      .filter(e => e.type === 'Expense')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const netBalance = totalIncome - totalExpenses;

    return {
      date,
      totalIncome,
      totalExpenses,
      netBalance,
      entries: dayEntries,
    };
  });

  // Sort by date (most recent first)
  dailySummaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate daily balances with opening and closing balances
  const reversedSummaries = [...dailySummaries].reverse();
  const dailyBalances = [];
  
  // Starting balance (first day's opening balance starts at 0)
  let carryForwardBalance = 0;
  
  for (const summary of reversedSummaries) {
    // Opening balance is the closing balance from the previous day
    const openingBalance = carryForwardBalance;
    
    // Closing balance is opening + income - expenses
    const closingBalance = openingBalance + summary.netBalance;
    
    dailyBalances.push({
      ...summary,
      openingBalance,
      closingBalance,
    });
    
    // Carry forward the closing balance to the next day
    carryForwardBalance = closingBalance;
  }

  // Reverse back to show most recent first
  dailyBalances.reverse();
  
  // Net balance: Total closing balance of the most recent day
  const netBalanceValue = dailyBalances.length > 0 ? dailyBalances[0].closingBalance : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Cashbook</h1>
          <p className="text-gray-600 mt-1">Track all income and expenses by day</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Hidden: Recalculate Balances button */}
          {/* {onRefreshData && isOwner && (
            <Button
              onClick={onRefreshData}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recalculate Balances
            </Button>
          )} */}
          {onOwnerCapital && isOwner && (
            <Button
              onClick={onOwnerCapital}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Owner Capital
            </Button>
          )}
          <Button
            onClick={onAddExpense}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                {formatUGX(
                  entries
                    .filter(e => e.type === 'Income')
                    .reduce((sum, e) => sum + e.amount, 0)
                )}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {formatUGX(
                  entries
                    .filter(e => e.type === 'Expense')
                    .reduce((sum, e) => sum + e.amount, 0)
                )}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Net Balance</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatUGX(netBalanceValue)}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Daily Cashbook Entries */}
      <div className="space-y-6">
        {dailyBalances.map((summary) => (
          <Card key={summary.date} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Daily Summary Header */}
            <div className="bg-gray-50 p-5 border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {new Date(summary.date).toLocaleDateString('en-UG', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {summary.entries.length} transaction{summary.entries.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full md:w-auto md:gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Income</p>
                    <p className="font-semibold text-green-600 text-sm md:text-base">{formatUGX(summary.totalIncome)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Expenses</p>
                    <p className="font-semibold text-red-600 text-sm md:text-base">{formatUGX(summary.totalExpenses)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Net</p>
                    <p className={`font-semibold text-sm md:text-base ${summary.netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatUGX(summary.netBalance)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Transactions Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Time</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Entered By</TableHead>
                    <TableHead className="font-semibold text-right">Amount</TableHead>
                    <TableHead className="font-semibold text-right">Balance</TableHead>
                    {/* Hidden: Delete Actions column */}
                    {/* {onDeleteEntry && isOwner && (
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    )} */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Opening Balance Row */}
                  <TableRow className="bg-blue-50 hover:bg-blue-50">
                    <TableCell className="font-bold">—</TableCell>
                    <TableCell className="font-bold text-blue-900">Opening Balance</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell className="text-right">—</TableCell>
                    <TableCell className="text-right font-bold text-blue-900">
                      {formatUGX(summary.openingBalance)}
                    </TableCell>
                    {/* Hidden: Delete button */}
                    {/* {onDeleteEntry && isOwner && (
                      <TableCell className="text-right">—</TableCell>
                    )} */}
                  </TableRow>

                  {/* Transaction Rows */}
                  {summary.entries
                    .sort((a, b) => {
                      // Sort by ID timestamp only (original order of recording)
                      const timestampA = parseInt(a.id.replace(/\D/g, '')) || 0;
                      const timestampB = parseInt(b.id.replace(/\D/g, '')) || 0;
                      return timestampA - timestampB;
                    })
                    .reduce((acc, entry, index) => {
                      // Calculate running balance
                      const previousBalance = index === 0 
                        ? summary.openingBalance 
                        : acc[index - 1].runningBalance;
                      const runningBalance = previousBalance + (entry.type === 'Income' ? entry.amount : -entry.amount);
                      
                      acc.push({ ...entry, runningBalance });
                      return acc;
                    }, [] as Array<CashbookEntry & { runningBalance: number }>)
                    .map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{entry.time || '—'}</TableCell>
                        <TableCell className="text-gray-600">{entry.description}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              entry.type === 'Income'
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : 'bg-red-100 text-red-700 hover:bg-red-100'
                            }
                          >
                            {entry.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {entry.enteredBy || currentUser || 'System'}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${
                          entry.type === 'Income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {entry.type === 'Income' ? '+' : '-'}{formatUGX(entry.amount)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-gray-900">
                          {formatUGX(entry.runningBalance)}
                        </TableCell>
                        {/* Hidden: Delete button for each transaction */}
                        {/* {onDeleteEntry && isOwner && (
                          <TableCell className="text-right">
                            <Button
                              onClick={() => onDeleteEntry(entry.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        )} */}
                      </TableRow>
                    ))}

                  {/* Closing Balance Row */}
                  <TableRow className="bg-purple-50 hover:bg-purple-50 border-t-2 border-purple-200">
                    <TableCell className="font-bold">—</TableCell>
                    <TableCell className="font-bold text-purple-900">Closing Balance</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell className="text-right">—</TableCell>
                    <TableCell className="text-right font-bold text-purple-900">
                      {formatUGX(summary.closingBalance)}
                    </TableCell>
                    {/* Hidden: Delete action cell for closing balance */}
                    {/* {onDeleteEntry && isOwner && (
                      <TableCell className="text-right">—</TableCell>
                    )} */}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>
        ))}
      </div>
      <Footer />
    </div>
  );
}