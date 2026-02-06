import { useMemo, useState, Fragment } from 'react';
import { Card } from '@/app/components/ui/card';
import { TrendingUp, Users, DollarSign, Target, Award, AlertCircle, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';
import { Client, Transaction, formatUGX } from '@/app/data/mockData';
import { UserDetailModal } from '@/app/components/UserDetailModal';
import { Button } from '@/app/components/ui/button';
import { Footer } from '@/app/components/Footer';

interface UserPerformanceProps {
  clients: Client[];
  transactions: Transaction[];
  currentUser: string | null;
}

interface ClientWithPayment extends Client {
  actualPaidToday: number;
}

interface UserMetrics {
  email: string;
  name: string;
  totalClients: number;
  activeClients: number;
  completedClients: number;
  totalAmountDisbursed: number;
  totalCollected: number;
  expectedToday: number;
  collectedToday: number;
  collectionRate: number;
  missedPaymentsToday: number;
  paidClientsToday: ClientWithPayment[];
  unpaidClientsToday: Client[];
}

// List of all users in the system
const ALL_USERS = [
  { email: 'william@boss.com', name: 'Texas Finance', role: 'Boss' },
  { email: 'cashier.com', name: 'Cashier', role: 'Cashier' },
  { email: 'field1.com', name: 'Field Officer 1', role: 'Field Officer' },
  { email: 'field2.com', name: 'Field Officer 2', role: 'Field Officer' },
  { email: 'field3.com', name: 'Field Officer 3', role: 'Field Officer' },
  { email: 'field4.com', name: 'Field Officer 4', role: 'Field Officer' },
  { email: 'field5.com', name: 'Field Officer 5', role: 'Field Officer' },
  { email: 'field6.com', name: 'Field Officer 6', role: 'Field Officer' },
];

export function UserPerformance({ clients, transactions, currentUser }: UserPerformanceProps) {
  const isOwner = currentUser === 'william@boss.com';
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<UserMetrics | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleUserExpansion = (userEmail: string) => {
    setExpandedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userEmail)) {
        next.delete(userEmail);
      } else {
        next.add(userEmail);
      }
      return next;
    });
  };

  // Calculate metrics for all users
  const userMetrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    return ALL_USERS.map(user => {
      // Get clients assigned to this user
      const userClients = clients.filter(c => c.assignedTo === user.email);
      const activeClients = userClients.filter(c => c.status === 'Active');
      const completedClients = userClients.filter(c => c.status === 'Completed');

      // Calculate total amount disbursed (sum of all loan amounts)
      const totalAmountDisbursed = userClients.reduce((sum, c) => sum + c.loanAmount, 0);

      // Calculate total collected from ACTUAL TRANSACTIONS (not from client.totalPaid)
      const userClientIds = userClients.map(c => c.id);
      const totalCollected = transactions
        .filter(t => userClientIds.includes(t.clientId))
        .reduce((sum, t) => sum + t.amount, 0);

      // Calculate expected today (sum of daily payments for active clients)
      const expectedToday = activeClients.reduce((sum, c) => sum + c.dailyPayment, 0);

      // Calculate collected today from ACTUAL PAYMENT TRANSACTIONS (exclude loan disbursements)
      const collectedToday = transactions
        .filter(t => {
          if (t.date !== today || !userClientIds.includes(t.clientId)) return false;
          
          // 🚫 STRICT FILTERING: Exclude ONLY loan disbursements, NOT large payments
          // 💰 IMPORTANT: Clients can pay ANY amount (above daily payment is ALLOWED!)
          const client = clients.find(c => c.id === t.clientId);
          if (!client) return false;
          
          // 🐛 DEBUG LOGGING for transactions today
          const clientName = client.fullName;
          const shouldLog = t.date === today && userClientIds.includes(t.clientId);
          
          // Exclude if marked as new loan
          if (t.isNewLoan) {
            if (shouldLog) console.log(`❌ FILTERED [${clientName}]: isNewLoan = true`);
            return false;
          }
          
          // Exclude if notes contain disbursement keywords
          const notesLower = t.notes.toLowerCase();
          if (notesLower.includes('disbursed') || 
              notesLower.includes('loan issued') || 
              notesLower.includes('new loan')) {
            if (shouldLog) console.log(`❌ FILTERED [${clientName}]: Notes contain disbursement keywords: "${t.notes}"`);
            return false;
          }
          
          // Exclude if status is "Unpaid" (loan disbursements are marked unpaid)
          if (t.status === 'Unpaid') {
            if (shouldLog) console.log(`❌ FILTERED [${clientName}]: Status = Unpaid`);
            return false;
          }
          
          // ✅ REMOVED: Amount filters that blocked legitimate large payments
          // Clients can pay as much as they want - we MUST record everything!
          
          if (shouldLog) console.log(`✅ INCLUDED [${clientName}]: Amount = ${formatUGX(t.amount)}, Date = ${t.date}, Notes = "${t.notes}", Status = ${t.status}`);
          return true;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      // Get clients who paid today and calculate ACTUAL amounts paid per client
      // 🚫 Apply SAME strict filtering to exclude loan disbursements
      const todayTransactions = transactions.filter(t => {
        if (t.date !== today || !userClientIds.includes(t.clientId)) return false;
        
        // 🚫 STRICT FILTERING: Exclude loan disbursements (same logic as collectedToday)
        const client = clients.find(c => c.id === t.clientId);
        if (!client) return false;
        
        // Exclude if marked as new loan
        if (t.isNewLoan) return false;
        
        // Exclude if notes contain disbursement keywords
        const notesLower = t.notes.toLowerCase();
        if (notesLower.includes('disbursed') || 
            notesLower.includes('loan issued') || 
            notesLower.includes('new loan')) {
          return false;
        }
        
        // Exclude if status is "Unpaid" (loan disbursements are marked unpaid)
        if (t.status === 'Unpaid') return false;
        
        // ✅ REMOVED: Amount filters that blocked legitimate large payments
        // Clients can pay as much as they want - we MUST record everything!
        
        return true;
      });
      
      // Calculate actual amount paid by each client today
      const clientPaymentsToday = new Map<string, number>();
      todayTransactions.forEach(t => {
        const current = clientPaymentsToday.get(t.clientId) || 0;
        clientPaymentsToday.set(t.clientId, current + t.amount);
      });
      
      const clientsWhoPaidToday = new Set(todayTransactions.map(t => t.clientId));
      
      // 🚨 CRITICAL FIX: Include BOTH Active AND Completed clients who paid today
      // Completed clients who paid today just finished their loan - MUST be tracked!
      // This prevents workers from stealing final payments
      const allRelevantClients = [...activeClients, ...completedClients];
      
      const paidClientsToday = allRelevantClients
        .filter(c => clientsWhoPaidToday.has(c.id))
        .map(c => ({
          ...c,
          actualPaidToday: clientPaymentsToday.get(c.id) || 0
        }));
      
      const unpaidClientsToday = activeClients.filter(c => !clientsWhoPaidToday.has(c.id));
      const missedPaymentsToday = unpaidClientsToday.length;

      // Calculate collection rate (percentage of expected amount collected)
      const collectionRate = expectedToday > 0 ? (collectedToday / expectedToday) * 100 : 0;

      return {
        email: user.email,
        name: user.name,
        totalClients: userClients.length,
        activeClients: activeClients.length,
        completedClients: completedClients.length,
        totalAmountDisbursed,
        totalCollected,
        expectedToday,
        collectedToday,
        collectionRate,
        missedPaymentsToday,
        paidClientsToday,
        unpaidClientsToday,
      };
    }).filter(m => m.totalClients > 0 || isOwner); // Show all users if owner, otherwise only those with clients
  }, [clients, transactions, isOwner]);

  // Calculate overall metrics
  const totalMetrics = useMemo(() => {
    return userMetrics.reduce((acc, user) => ({
      totalClients: acc.totalClients + user.totalClients,
      activeClients: acc.activeClients + user.activeClients,
      completedClients: acc.completedClients + user.completedClients,
      totalAmountDisbursed: acc.totalAmountDisbursed + user.totalAmountDisbursed,
      totalCollected: acc.totalCollected + user.totalCollected,
      expectedToday: acc.expectedToday + user.expectedToday,
      collectedToday: acc.collectedToday + user.collectedToday,
      missedPaymentsToday: acc.missedPaymentsToday + user.missedPaymentsToday,
    }), {
      totalClients: 0,
      activeClients: 0,
      completedClients: 0,
      totalAmountDisbursed: 0,
      totalCollected: 0,
      expectedToday: 0,
      collectedToday: 0,
      missedPaymentsToday: 0,
    });
  }, [userMetrics]);

  const overallCollectionRate = totalMetrics.expectedToday > 0 
    ? (totalMetrics.collectedToday / totalMetrics.expectedToday) * 100 
    : 0;

  // Get top performers (only if owner)
  const topPerformers = useMemo(() => {
    if (!isOwner) return [];
    return [...userMetrics]
      .filter(u => u.activeClients > 0)
      .sort((a, b) => b.collectionRate - a.collectionRate)
      .slice(0, 3);
  }, [userMetrics, isOwner]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-100 rounded-xl">
          <Award className="h-7 w-7 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Performance</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {isOwner 
              ? 'Track collection performance across all field officers' 
              : 'View your collection performance and metrics'}
          </p>
        </div>
      </div>

      {/* Overall Metrics - Only show if owner */}
      {isOwner && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <Card className="p-4 sm:p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Overall Collection</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{overallCollectionRate.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {formatUGX(totalMetrics.collectedToday)}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Active Officers</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{userMetrics.filter(u => u.activeClients > 0).length}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">With clients</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Active Clients</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalMetrics.activeClients}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">All officers</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Missed Today</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">{totalMetrics.missedPaymentsToday}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">Not paid</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Top Performers */}
          {topPerformers.length > 0 && (
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                Top Performers Today
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {topPerformers.map((user, index) => (
                  <div key={user.email} className="bg-white p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}>
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-600 truncate">{user.activeClients} active clients</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">Collection Rate</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">{user.collectionRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {formatUGX(user.collectedToday)} / {formatUGX(user.expectedToday)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* User Performance Table */}
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-5">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {isOwner ? 'All Users Performance' : 'Your Performance'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Detailed metrics and client lists for each field officer</p>
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {userMetrics.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              No performance data available
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {userMetrics.map((user) => {
                const isExpanded = expandedUsers.has(user.email);
                return (
                  <div key={user.email} className={`p-4 ${user.email === currentUser ? 'bg-blue-50' : ''}`}>
                    {/* User Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-600 truncate">{user.email}</p>
                      </div>
                      {user.activeClients > 0 && (
                        <button
                          onClick={() => toggleUserExpansion(user.email)}
                          className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg active:bg-purple-200 transition-colors text-sm font-medium flex-shrink-0"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              View
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Collection Rate - Prominent Display */}
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Collection Rate Today</span>
                        <span className={`text-2xl font-bold ${
                          user.collectionRate >= 80 ? 'text-green-600' :
                          user.collectionRate >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {user.collectionRate.toFixed(1)}%
                        </span>
                      </div>
                      {user.activeClients > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              user.collectionRate >= 80 ? 'bg-green-500' :
                              user.collectionRate >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(user.collectionRate, 100)}%` }}
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                        <span>Collected: {formatUGX(user.collectedToday)}</span>
                        <span>Expected: {formatUGX(user.expectedToday)}</span>
                      </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-600 mb-0.5">Clients</p>
                        <p className="text-lg font-bold text-gray-900">{user.totalClients}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2">
                        <p className="text-xs text-gray-600 mb-0.5">Active</p>
                        <p className="text-lg font-bold text-green-600">{user.activeClients}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2">
                        <p className="text-xs text-gray-600 mb-0.5">Done</p>
                        <p className="text-lg font-bold text-blue-600">{user.completedClients}</p>
                      </div>
                    </div>

                    {/* Today's Status */}
                    <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg mb-3">
                      <span className="text-xs text-gray-700">Not Paid Today</span>
                      {user.missedPaymentsToday > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-200 text-orange-800">
                          {user.missedPaymentsToday} clients
                        </span>
                      ) : (
                        <span className="text-xs text-green-600 font-medium">✓ All paid</span>
                      )}
                    </div>

                    {/* View History Button */}
                    <Button
                      onClick={() => {
                        setSelectedUser(user);
                        setIsModalOpen(true);
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white mb-3"
                      size="sm"
                    >
                      📊 View Payment History
                    </Button>

                    {/* Financial Summary - Collapsible */}
                    <details className="mt-3">
                      <summary className="text-xs font-medium text-purple-600 cursor-pointer select-none">
                        View Financial Details
                      </summary>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Total Disbursed</span>
                          <span className="font-semibold text-gray-900">{formatUGX(user.totalAmountDisbursed)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Total Collected</span>
                          <span className="font-semibold text-gray-900">{formatUGX(user.totalCollected)}</span>
                        </div>
                      </div>
                    </details>

                    {/* Expanded Client Lists */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        {/* Paid Clients Today */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <h4 className="font-semibold text-sm text-gray-900">
                              Paid Today ({user.paidClientsToday.length})
                            </h4>
                          </div>
                          {user.paidClientsToday.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {user.paidClientsToday.map(client => (
                                <div
                                  key={client.id}
                                  className="p-2 bg-green-50 border border-green-200 rounded-lg"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm text-gray-900 truncate">{client.fullName}</p>
                                      <p className="text-xs text-gray-600 truncate">{client.phoneNumber}</p>
                                      <p className="text-xs text-orange-600 font-medium mt-1">
                                        Outstanding: {formatUGX(client.outstandingBalance)}
                                      </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <p className="text-xs font-bold text-green-700">
                                        {formatUGX(client.actualPaidToday)}
                                      </p>
                                      <p className="text-xs text-gray-500">Paid</p>
                                      {client.actualPaidToday !== client.dailyPayment && (
                                        <p className="text-xs text-gray-400">
                                          ({formatUGX(client.dailyPayment)} exp.)
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500">No clients paid today</p>
                            </div>
                          )}
                        </div>

                        {/* Unpaid Clients Today */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="h-4 w-4 text-orange-600" />
                            <h4 className="font-semibold text-sm text-gray-900">
                              Not Paid Today ({user.unpaidClientsToday.length})
                            </h4>
                          </div>
                          {user.unpaidClientsToday.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {user.unpaidClientsToday.map(client => (
                                <div
                                  key={client.id}
                                  className="p-2 bg-orange-50 border border-orange-200 rounded-lg"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm text-gray-900 truncate">{client.fullName}</p>
                                      <p className="text-xs text-gray-600 truncate">{client.phoneNumber}</p>
                                      <p className="text-xs text-orange-600 font-medium mt-1">
                                        Outstanding: {formatUGX(client.outstandingBalance)}
                                      </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <p className="text-xs font-semibold text-orange-600">
                                        {formatUGX(client.dailyPayment)}
                                      </p>
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-200 text-orange-800">
                                        Pending
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 bg-green-50 rounded-lg">
                              <CheckCircle2 className="h-8 w-8 mx-auto mb-1 text-green-400" />
                              <p className="text-xs font-semibold text-green-600">All clients paid!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Clients
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total Disbursed
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total Collected
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Expected Today
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Collected Today
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Collection Rate
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Not Paid Today
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userMetrics.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-8 text-center text-gray-500">
                    No performance data available
                  </td>
                </tr>
              ) : (
                userMetrics.map((user) => {
                  const isExpanded = expandedUsers.has(user.email);
                  const rows = [
                    <tr key={`${user.email}-main`} className={`hover:bg-gray-50 transition-colors ${
                      user.email === currentUser ? 'bg-blue-50' : ''
                    }`}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-900 font-medium">{user.totalClients}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {user.activeClients}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.completedClients}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-gray-900 font-medium">{formatUGX(user.totalAmountDisbursed)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-gray-900 font-medium">{formatUGX(user.totalCollected)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-gray-900 font-medium">{formatUGX(user.expectedToday)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-green-600 font-semibold">{formatUGX(user.collectedToday)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-lg font-bold ${
                            user.collectionRate >= 80 ? 'text-green-600' :
                            user.collectionRate >= 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {user.collectionRate.toFixed(1)}%
                          </span>
                          {user.activeClients > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2 max-w-[80px]">
                              <div
                                className={`h-2 rounded-full ${
                                  user.collectionRate >= 80 ? 'bg-green-500' :
                                  user.collectionRate >= 50 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(user.collectionRate, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.missedPaymentsToday > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {user.missedPaymentsToday}
                          </span>
                        ) : (
                          <span className="text-green-600 font-medium">✓ All paid</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.activeClients > 0 && (
                          <button
                            onClick={() => toggleUserExpansion(user.email)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-4 w-4" />
                                Hide
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4" />
                                View
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ];
                  
                  // Add expanded row if needed
                  if (isExpanded) {
                    rows.push(
                      <tr key={`${user.email}-expanded`}>
                        <td colSpan={11} className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Paid Clients Today */}
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <h4 className="font-semibold text-gray-900">
                                  Paid Today ({user.paidClientsToday.length})
                                </h4>
                              </div>
                              {user.paidClientsToday.length > 0 ? (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                  {user.paidClientsToday.map(client => (
                                    <div
                                      key={client.id}
                                      className="p-3 bg-white border border-green-200 rounded-lg"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                          <p className="font-semibold text-gray-900">{client.fullName}</p>
                                          <p className="text-sm text-gray-600">{client.phoneNumber}</p>
                                          <p className="text-xs text-gray-500 mt-1">{client.address}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-lg font-bold text-green-600">
                                            {formatUGX(client.actualPaidToday)}
                                          </p>
                                          <p className="text-xs text-gray-500 mb-1">Paid Today</p>
                                          {client.actualPaidToday !== client.dailyPayment && (
                                            <p className="text-xs text-gray-400">
                                              Expected: {formatUGX(client.dailyPayment)}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                                        <span className="text-gray-600">
                                          Outstanding: {formatUGX(client.outstandingBalance)}
                                        </span>
                                        <span className={`font-semibold ${
                                          client.actualPaidToday >= client.dailyPayment 
                                            ? 'text-green-600' 
                                            : 'text-yellow-600'
                                        }`}>
                                          {client.actualPaidToday >= client.dailyPayment 
                                            ? '✓ Fully Paid' 
                                            : '⚠ Partial Payment'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                  <p className="text-sm text-gray-500">No clients paid today</p>
                                </div>
                              )}
                            </div>

                            {/* Unpaid Clients Today */}
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <XCircle className="h-5 w-5 text-orange-600" />
                                <h4 className="font-semibold text-gray-900">
                                  Not Paid Today ({user.unpaidClientsToday.length})
                                </h4>
                              </div>
                              {user.unpaidClientsToday.length > 0 ? (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                  {user.unpaidClientsToday.map(client => (
                                    <div
                                      key={client.id}
                                      className="p-3 bg-white border border-orange-200 rounded-lg"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                          <p className="font-semibold text-gray-900">{client.fullName}</p>
                                          <p className="text-sm text-gray-600">{client.phoneNumber}</p>
                                          <p className="text-xs text-gray-500 mt-1">{client.address}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm font-semibold text-orange-600">
                                            {formatUGX(client.dailyPayment)}
                                          </p>
                                          <p className="text-xs text-gray-500">Due today</p>
                                        </div>
                                      </div>
                                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                                        <span className="text-gray-600">
                                          Outstanding: {formatUGX(client.outstandingBalance)}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                          Pending
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-400" />
                                  <p className="text-sm font-semibold text-green-600">All clients paid!</p>
                                  <p className="text-xs text-gray-500 mt-1">100% collection rate today</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  
                  return rows;
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userName={selectedUser.name}
          userEmail={selectedUser.email}
          clients={clients.filter(c => c.assignedTo === selectedUser.email)}
          transactions={transactions}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}