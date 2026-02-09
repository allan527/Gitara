import { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Receipt, PieChart, Wallet } from 'lucide-react';
import { Transaction, CashbookEntry, formatUGX, Client } from '../data/mockData';

interface EvaluationProps {
  transactions: Transaction[];
  cashbookEntries: CashbookEntry[];
  clients: Client[];
  currentUser: string | null;
}

interface DailyData {
  date: string;
  dayName: string;
  totalPaymentsCollected: number;
  totalProcessingFees: number;
  totalCollections: number;
  income: number; // 20% of payments collected
  expense: number;
  netProfit: number;
  totalOutstanding: number;
  closingBalance: number;
  businessCapital: number;
}

export function Evaluation({ transactions, cashbookEntries, clients, currentUser }: EvaluationProps) {
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.

  // Helper function to get start of week (Monday)
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Get the week range based on offset
  const getWeekRange = (offset: number) => {
    const today = new Date();
    const startOfThisWeek = getStartOfWeek(today);
    const startOfWeek = new Date(startOfThisWeek);
    startOfWeek.setDate(startOfWeek.getDate() + (offset * 7));
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    
    return { startOfWeek, endOfWeek };
  };

  const { startOfWeek, endOfWeek } = getWeekRange(selectedWeekOffset);

  // Format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Get day name
  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Calculate daily data for the selected week
  const calculateDailyData = (): DailyData[] => {
    const dailyData: DailyData[] = [];
    
    // Get today's date for comparison (as string YYYY-MM-DD)
    const today = new Date();
    const todayStr = formatDate(today);
    
    // Generate 7 days (Monday to Sunday)
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = formatDate(currentDate);
      
      // Check if this date is in the future
      const isFutureDate = dateStr > todayStr;
      
      // Calculate total payments collected on this date
      const paymentsOnDate = transactions.filter(t => t.date === dateStr);
      const totalPaymentsCollected = paymentsOnDate.reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate processing fees collected on this date (from cashbook)
      const processingFeesOnDate = cashbookEntries.filter(
        e => e.date === dateStr && e.type === 'Income' && e.description.includes('Processing fee')
      );
      const totalProcessingFees = processingFeesOnDate.reduce((sum, e) => sum + e.amount, 0);
      
      // Total collections = payments + processing fees
      const totalCollections = totalPaymentsCollected + totalProcessingFees;
      
      // Income = 20% of total payments collected (not including processing fees)
      const income = totalPaymentsCollected * 0.20;
      
      // Calculate expenses on this date
      const expensesOnDate = cashbookEntries.filter(
        e => e.date === dateStr && e.type === 'Expense'
      );
      const expense = expensesOnDate.reduce((sum, e) => sum + e.amount, 0);
      
      // Net profit = income - expense
      const netProfit = income - expense;
      
      let totalOutstanding = 0;
      let closingBalance = 0;
      let businessCapital = 0;
      
      // Only calculate outstanding, closing balance, and business capital for past/today dates
      if (!isFutureDate) {
        // Calculate total outstanding for this specific date
        // For each client, calculate outstanding as of this date
        clients.forEach(client => {
          // Only consider clients whose loan started on or before this date
          if (client.startDate <= dateStr) {
            // Calculate total paid up to this date for this client
            const paymentsUpToDate = transactions.filter(
              t => t.clientId === client.id && t.date <= dateStr
            );
            const totalPaidUpToDate = paymentsUpToDate.reduce((sum, t) => sum + t.amount, 0);
            
            // Outstanding = Total Payable - Total Paid up to this date
            const outstandingOnDate = client.totalPayable - totalPaidUpToDate;
            
            // Only add if outstanding is positive (loan not fully paid yet)
            if (outstandingOnDate > 0) {
              totalOutstanding += outstandingOnDate;
            }
          }
        });
        
        // Calculate closing balance for the day from cashbook up to this date
        const cashbookUpToDate = cashbookEntries.filter(e => e.date <= dateStr);
        closingBalance = cashbookUpToDate.reduce((sum, e) => {
          if (e.type === 'Income' || e.type === 'Owner Capital In') {
            return sum + e.amount;
          } else if (e.type === 'Expense' || e.type === 'Owner Capital Out') {
            return sum - e.amount;
          }
          return sum;
        }, 0);
        
        // Calculate business capital = Total Outstanding + Closing Balance
        businessCapital = totalOutstanding + closingBalance;
      }
      
      dailyData.push({
        date: dateStr,
        dayName: getDayName(dateStr),
        totalPaymentsCollected,
        totalProcessingFees,
        totalCollections,
        income,
        expense,
        netProfit,
        totalOutstanding,
        closingBalance,
        businessCapital,
      });
    }
    
    return dailyData;
  };

  const dailyData = calculateDailyData();

  // Calculate weekly totals
  const weeklyTotals = {
    totalPaymentsCollected: dailyData.reduce((sum, day) => sum + day.totalPaymentsCollected, 0),
    totalProcessingFees: dailyData.reduce((sum, day) => sum + day.totalProcessingFees, 0),
    totalCollections: dailyData.reduce((sum, day) => sum + day.totalCollections, 0),
    income: dailyData.reduce((sum, day) => sum + day.income, 0),
    expense: dailyData.reduce((sum, day) => sum + day.expense, 0),
    netProfit: dailyData.reduce((sum, day) => sum + day.netProfit, 0),
    // Use the last day's values for these (they don't accumulate across the week)
    totalOutstanding: dailyData.length > 0 ? dailyData[dailyData.length - 1].totalOutstanding : 0,
    closingBalance: dailyData.length > 0 ? dailyData[dailyData.length - 1].closingBalance : 0,
    businessCapital: dailyData.length > 0 ? dailyData[dailyData.length - 1].businessCapital : 0,
  };

  // Format week range for display
  const formatWeekRange = () => {
    const start = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <PieChart className="w-8 h-8 text-emerald-600" />
            Weekly Evaluation
          </h1>
          <p className="text-gray-600 mt-1">Income & Expense Analysis</p>
        </div>
        
        {/* Week Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedWeekOffset(selectedWeekOffset - 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            ← Previous Week
          </button>
          <button
            onClick={() => setSelectedWeekOffset(selectedWeekOffset + 1)}
            disabled={selectedWeekOffset >= 0}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Week →
          </button>
        </div>
      </div>

      {/* Current Week Display */}
      <div className="glass-card p-4 flex items-center gap-3">
        <Calendar className="w-6 h-6 text-emerald-600" />
        <div>
          <p className="text-sm text-gray-600">Current Selection</p>
          <p className="font-semibold text-gray-900">{formatWeekRange()}</p>
        </div>
      </div>

      {/* Weekly Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Total Payments Collected */}
        <div className="glass-card p-4 border-l-4 border-blue-500">
          <DollarSign className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-xs text-gray-600 mb-1">Total Collected</p>
          <p className="text-lg font-bold text-gray-900">{formatUGX(weeklyTotals.totalPaymentsCollected)}</p>
          <p className="text-xs text-gray-500 mt-0.5">From client payments</p>
        </div>

        {/* Total Processing Fees */}
        <div className="glass-card p-4 border-l-4 border-emerald-500">
          <Receipt className="w-6 h-6 text-emerald-500 mb-2" />
          <p className="text-xs text-gray-600 mb-1">Processing Fees</p>
          <p className="text-lg font-bold text-emerald-600">{formatUGX(weeklyTotals.totalProcessingFees)}</p>
          <p className="text-xs text-gray-500 mt-0.5">From cashbook</p>
        </div>

        {/* Total Collections */}
        <div className="glass-card p-4 border-l-4 border-emerald-600">
          <Receipt className="w-6 h-6 text-emerald-600 mb-2" />
          <p className="text-xs text-gray-600 mb-1">Total Collections</p>
          <p className="text-lg font-bold text-emerald-600">{formatUGX(weeklyTotals.totalCollections)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Payments + Fees</p>
        </div>

        {/* Weekly Income (20%) */}
        <div className="glass-card p-4 border-l-4 border-emerald-500">
          <TrendingUp className="w-6 h-6 text-emerald-500 mb-2" />
          <p className="text-xs text-gray-600 mb-1">Income (20%)</p>
          <p className="text-lg font-bold text-emerald-600">{formatUGX(weeklyTotals.income)}</p>
          <p className="text-xs text-gray-500 mt-0.5">20% of collections</p>
        </div>

        {/* Weekly Expenses */}
        <div className="glass-card p-4 border-l-4 border-red-500">
          <Receipt className="w-6 h-6 text-red-500 mb-2" />
          <p className="text-xs text-gray-600 mb-1">Total Expenses</p>
          <p className="text-lg font-bold text-red-600">{formatUGX(weeklyTotals.expense)}</p>
          <p className="text-xs text-gray-500 mt-0.5">All expenses</p>
        </div>

        {/* Net Profit/Loss */}
        <div className={`glass-card p-4 border-l-4 ${weeklyTotals.netProfit >= 0 ? 'border-green-500' : 'border-orange-500'}`}>
          {weeklyTotals.netProfit >= 0 ? (
            <TrendingUp className="w-6 h-6 text-green-500 mb-2" />
          ) : (
            <TrendingDown className="w-6 h-6 text-orange-500 mb-2" />
          )}
          <p className="text-xs text-gray-600 mb-1">Net Profit/Loss</p>
          <p className={`text-lg font-bold ${weeklyTotals.netProfit >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
            {formatUGX(weeklyTotals.netProfit)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Income - Expenses</p>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Breakdown</h2>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Day</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Collections</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Income (20%)</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Expenses</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Net Profit</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Outstanding</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Closing Balance</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Business Capital</th>
              </tr>
            </thead>
            <tbody>
              {dailyData.map((day, index) => (
                <tr key={day.date} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-900">{day.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{day.dayName}</td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-blue-600">
                    {formatUGX(day.totalCollections)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-emerald-600">
                    {formatUGX(day.income)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-red-600">
                    {formatUGX(day.expense)}
                  </td>
                  <td className={`py-3 px-4 text-sm text-right font-bold ${
                    day.netProfit >= 0 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {formatUGX(day.netProfit)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-red-600">
                    {formatUGX(day.totalOutstanding)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-blue-600">
                    {formatUGX(day.closingBalance)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-emerald-600">
                    {formatUGX(day.businessCapital)}
                  </td>
                </tr>
              ))}
              
              {/* Weekly Totals Row */}
              <tr className="bg-emerald-50 font-bold border-t-2 border-emerald-200">
                <td className="py-4 px-4 text-sm text-gray-900" colSpan={2}>WEEKLY TOTAL</td>
                <td className="py-4 px-4 text-sm text-right text-blue-600">
                  {formatUGX(weeklyTotals.totalCollections)}
                </td>
                <td className="py-4 px-4 text-sm text-right text-emerald-600">
                  {formatUGX(weeklyTotals.income)}
                </td>
                <td className="py-4 px-4 text-sm text-right text-red-600">
                  {formatUGX(weeklyTotals.expense)}
                </td>
                <td className={`py-4 px-4 text-sm text-right ${
                  weeklyTotals.netProfit >= 0 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {formatUGX(weeklyTotals.netProfit)}
                </td>
                <td className="py-4 px-4 text-sm text-right text-red-600">
                  {formatUGX(weeklyTotals.totalOutstanding)}
                </td>
                <td className="py-4 px-4 text-sm text-right text-blue-600">
                  {formatUGX(weeklyTotals.closingBalance)}
                </td>
                <td className="py-4 px-4 text-sm text-right text-emerald-600">
                  {formatUGX(weeklyTotals.businessCapital)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {dailyData.map((day) => (
            <div key={day.date} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <div>
                  <p className="font-semibold text-gray-900">{day.dayName}</p>
                  <p className="text-sm text-gray-600">{day.date}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Collections:</span>
                  <span className="text-sm font-medium text-blue-600">{formatUGX(day.totalCollections)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Income (20%):</span>
                  <span className="text-sm font-medium text-emerald-600">{formatUGX(day.income)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expenses:</span>
                  <span className="text-sm font-medium text-red-600">{formatUGX(day.expense)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Net Profit:</span>
                  <span className={`text-sm font-bold ${
                    day.netProfit >= 0 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {formatUGX(day.netProfit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Outstanding:</span>
                  <span className="text-sm font-medium text-red-600">{formatUGX(day.totalOutstanding)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Closing Balance:</span>
                  <span className="text-sm font-medium text-blue-600">{formatUGX(day.closingBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Business Capital:</span>
                  <span className="text-sm font-medium text-emerald-600">{formatUGX(day.businessCapital)}</span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Weekly Totals Card */}
          <div className="border-2 border-emerald-500 rounded-lg p-4 bg-emerald-50 space-y-3">
            <div className="border-b border-emerald-200 pb-2">
              <p className="font-bold text-gray-900">WEEKLY TOTAL</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Collections:</span>
                <span className="text-sm font-bold text-blue-600">{formatUGX(weeklyTotals.totalCollections)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Income (20%):</span>
                <span className="text-sm font-bold text-emerald-600">{formatUGX(weeklyTotals.income)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Expenses:</span>
                <span className="text-sm font-bold text-red-600">{formatUGX(weeklyTotals.expense)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-emerald-300">
                <span className="text-sm font-bold text-gray-900">Net Profit:</span>
                <span className={`text-sm font-bold ${
                  weeklyTotals.netProfit >= 0 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {formatUGX(weeklyTotals.netProfit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Outstanding:</span>
                <span className="text-sm font-bold text-red-600">{formatUGX(weeklyTotals.totalOutstanding)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Closing Balance:</span>
                <span className="text-sm font-bold text-blue-600">{formatUGX(weeklyTotals.closingBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Business Capital:</span>
                <span className="text-sm font-bold text-emerald-600">{formatUGX(weeklyTotals.businessCapital)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="glass-card p-6 bg-blue-50 border-l-4 border-blue-500">
        <h3 className="font-semibold text-gray-900 mb-2">Calculation Methods</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Collections</strong> = Client payments + Processing fees (10,000 UGX per loan)</li>
          <li>• <strong>Income</strong> = 20% of total daily payments collected from clients (excluding processing fees)</li>
          <li>• <strong>Expenses</strong> = All expenses recorded in the cashbook for that day</li>
          <li>• <strong>Net Profit</strong> = Income - Expenses</li>
          <li>• <strong>Total Outstanding</strong> = Sum of all client outstanding balances as of that specific date (Total Payable - Payments Made)</li>
          <li>• <strong>Closing Balance</strong> = Cumulative cash balance (Income + Owner Capital In - Expenses - Owner Capital Out) up to that date</li>
          <li>• <strong>Business Capital</strong> = Total Outstanding + Closing Balance (includes owner capital injections/withdrawals)</li>
        </ul>
      </div>
    </div>
  );
}