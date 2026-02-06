import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, TrendingUp, Wallet, AlertCircle, PhoneCall } from 'lucide-react';
import { 
  Client,
  Transaction,
  CashbookEntry,
  formatUGX 
} from '../data/mockData';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Footer } from '../components/Footer';

interface DashboardProps {
  clients: Client[];
  transactions: Transaction[];
  cashbookEntries: CashbookEntry[];
  currentUser?: string | null;
}

export function Dashboard({ clients, transactions, cashbookEntries, currentUser }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('today');

  // Check if current user is the owner
  const isOwner = currentUser === 'william@boss.com';

  // Calculate KPIs
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const totalActiveLoans = clients.filter(c => c.status === 'Active').length;
  const totalMoneyLent = clients.reduce((sum, client) => sum + client.loanAmount, 0);
  const totalOutstanding = clients
    .filter(c => c.status === 'Active')
    .reduce((sum, client) => sum + client.outstandingBalance, 0);

  // Calculate Net Worth and Business Profit (Owner Only)
  const totalIncome = cashbookEntries
    .filter(e => e.type === 'Income')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = cashbookEntries
    .filter(e => e.type === 'Expense')
    .reduce((sum, e) => sum + e.amount, 0);
  const netWorth = totalIncome - totalExpenses;
  const businessProfit = clients.reduce((sum, c) => sum + (c.totalPayable - c.loanAmount), 0);

  // Calculate missed payments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const clientsWithMissedPayments = clients
    .filter(c => c.status === 'Active')
    .map(client => {
      const startDate = new Date(client.startDate);
      startDate.setHours(0, 0, 0, 0);
      const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const expectedPaid = Math.min(daysSinceStart * client.dailyPayment, client.totalPayable);
      const missedAmount = Math.max(0, expectedPaid - client.totalPaid);
      const missedDays = Math.floor(missedAmount / client.dailyPayment);
      
      return {
        ...client,
        missedDays,
        missedAmount,
      };
    })
    .filter(c => c.missedDays > 0)
    .sort((a, b) => b.missedDays - a.missedDays);

  // Get new borrowers (clients created today/this week)
  const todayStr = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const newBorrowersToday = clients.filter(c => c.startDate === todayStr);
  const newBorrowersThisWeek = clients.filter(c => c.startDate >= sevenDaysAgo);
  
  const newBorrowers = activeTab === 'today' ? newBorrowersToday : newBorrowersThisWeek;

  // Generate loan activity data for last 7 days
  const loanActivityData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const dayClients = clients.filter(c => c.startDate === dateStr);
    const amount = dayClients.reduce((sum, c) => sum + c.loanAmount, 0);
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: amount,
    };
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Page Header with gradient */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 animate-slide-in-down">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 animate-slide-in-down stagger-1">Welcome back! Here's your business overview.</p>
      </div>

      {/* KPI Cards with animations */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 grid-stagger">
        <Card className="p-3 sm:p-6 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl shadow-lg hover:shadow-xl transition-all-smooth card-hover touch-feedback">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-blue-600 mb-1 truncate font-medium">Active Clients</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 counter-animate">{activeClients}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-info rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-6 bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl shadow-lg hover:shadow-xl transition-all-smooth card-hover touch-feedback">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-green-600 mb-1 truncate font-medium">Active Loans</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 counter-animate">{totalActiveLoans}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-success rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-6 bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl shadow-lg hover:shadow-xl transition-all-smooth card-hover touch-feedback">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-purple-600 mb-1 truncate font-medium">Money Lent</p>
              <p className="text-base sm:text-2xl font-bold text-gray-900 truncate counter-animate">{formatUGX(totalMoneyLent)}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-6 bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-xl shadow-lg hover:shadow-xl transition-all-smooth card-hover touch-feedback">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-orange-600 mb-1 truncate font-medium">Outstanding</p>
              <p className="text-base sm:text-2xl font-bold text-gray-900 truncate counter-animate">{formatUGX(totalOutstanding)}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-warning rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Owner-Only Financial KPIs with enhanced styling */}
      {isOwner && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 animate-slide-in-up">
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-amber-100 via-amber-50 to-white border-2 border-amber-300 rounded-xl shadow-xl hover:shadow-2xl transition-all-smooth card-hover relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 rounded-full -mr-16 -mt-16 opacity-20"></div>
            <div className="flex items-start justify-between relative z-10">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-amber-900 mb-1 font-bold truncate flex items-center gap-2">
                  <span className="text-2xl">💰</span> Net Worth (Owner Only)
                </p>
                <p className="text-xl sm:text-3xl font-black text-amber-900 truncate counter-animate">{formatUGX(netWorth)}</p>
                <p className="text-xs text-amber-700 mt-2 font-medium">Income - Expenses</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 gradient-warning rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-emerald-100 via-emerald-50 to-white border-2 border-emerald-300 rounded-xl shadow-xl hover:shadow-2xl transition-all-smooth card-hover relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200 rounded-full -mr-16 -mt-16 opacity-20"></div>
            <div className="flex items-start justify-between relative z-10">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-emerald-900 mb-1 font-bold truncate flex items-center gap-2">
                  <span className="text-2xl">📈</span> Business Profit (Owner Only)
                </p>
                <p className="text-xl sm:text-3xl font-black text-emerald-900 truncate counter-animate">{formatUGX(businessProfit)}</p>
                <p className="text-xs text-emerald-700 mt-2 font-medium">Interest from Loans</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 gradient-success rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* New Borrowers */}
        <Card className="p-4 sm:p-6 bg-white border border-gray-200 rounded-xl shadow-lg animate-slide-in-left">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">New Borrowers</h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 w-full sm:w-auto">
              <TabsTrigger value="today" className="flex-1 sm:flex-none">Today</TabsTrigger>
              <TabsTrigger value="week" className="flex-1 sm:flex-none">This Week</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="space-y-2 sm:space-y-3 max-h-[300px] overflow-y-auto">
                {newBorrowers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 text-sm">No new borrowers {activeTab === 'today' ? 'today' : 'this week'}</p>
                ) : (
                  newBorrowers.map((borrower) => (
                    <div
                      key={borrower.id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base text-gray-900 truncate">{borrower.fullName}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{borrower.startDate}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="font-semibold text-sm sm:text-base text-blue-600">{formatUGX(borrower.loanAmount)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Loan Activity Chart */}
        <Card className="p-4 sm:p-6 bg-white border border-gray-200 rounded-xl shadow-lg animate-slide-in-right">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Loan Activity (Last 7 Days)</h2>
          
          {loanActivityData && loanActivityData.length > 0 ? (
            <div className="w-full" style={{ height: '320px', minHeight: '320px' }}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={loanActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatUGX(value)}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full h-[320px] flex items-center justify-center text-gray-400">
              <p>No loan activity data available</p>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card className="p-4 sm:p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Completed Loans</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {clients.filter(c => c.status === 'Completed').length}
            </p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Collected</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600 truncate">
              {formatUGX(clients.reduce((sum, c) => sum + c.totalPaid, 0))}
            </p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Collection Rate</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">
              {clients.reduce((sum, c) => sum + c.totalPayable, 0) > 0
                ? ((clients.reduce((sum, c) => sum + c.totalPaid, 0) / 
                    clients.reduce((sum, c) => sum + c.totalPayable, 0)) * 100).toFixed(1)
                : '0.0'}%
            </p>
          </div>
        </div>
      </Card>
      <Footer />
    </div>
  );
}