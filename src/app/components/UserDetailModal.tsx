import { useState, useMemo } from 'react';
import { X, Calendar, TrendingDown, AlertTriangle, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Client, Transaction, formatUGX } from '@/app/data/mockData';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface UserDetailModalProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  clients: Client[];
  transactions: Transaction[];
}

interface DayData {
  date: string;
  dateStr: string;
  expected: number;
  collected: number;
  collectionRate: number;
  paidClients: (Client & { actualAmountPaid: number })[];
  unpaidClients: (Client & { actualAmountPaid: number })[];
}

export function UserDetailModal({
  open,
  onClose,
  userName,
  userEmail,
  clients,
  transactions,
}: UserDetailModalProps) {
  const [daysToShow, setDaysToShow] = useState(7); // Default to 7 days
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Calculate historical data for the last N days
  const historicalData = useMemo(() => {
    const data: DayData[] = [];
    const today = new Date();
    
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Get all active clients for that date (these ALL start as "Not Paid")
      // A client is active if their loan start date is on or before this day
      const activeClients = clients.filter(c => {
        const startDate = new Date(c.startDate);
        const clientDate = new Date(dateStr);
        return c.status === 'Active' && startDate <= clientDate;
      });
      
      // STEP 1: Day starts with 0 paid, ALL active clients are unpaid
      // STEP 2: Check actual transactions to see who ACTUALLY PAID
      // ONLY count real payment transactions (EXCLUDE loan disbursements)
      
      // DEBUG: First, let's see ALL transactions for this date
      if (dateStr === new Date().toISOString().split('T')[0]) {
        const allTransactionsForToday = transactions.filter(t => t.date === dateStr);
        console.log(`📋 ALL TRANSACTIONS FOR TODAY (${dateStr}):`, allTransactionsForToday.map(t => ({
          id: t.id,
          clientName: t.clientName,
          amount: t.amount,
          status: t.status,
          notes: t.notes,
          isNewLoan: t.isNewLoan,
        })));
      }
      
      const paymentTransactionsForDay = transactions.filter(t => {
        const isForThisDate = t.date === dateStr && clients.some(c => c.id === t.clientId);
        
        // Find the client for this transaction
        const client = clients.find(c => c.id === t.clientId);
        
        // STRICT FILTERING: Exclude ANY of these disbursement indicators
        const isLoanDisbursement = 
          t.isNewLoan === true || 
          t.notes?.toUpperCase().includes('DISBURSED') ||
          t.notes?.toUpperCase().includes('NEW LOAN') ||
          t.notes?.toUpperCase().includes('LOAN DISBURSEMENT') ||
          t.notes?.toUpperCase().includes('DISBURSEMENT') ||
          t.status === 'Unpaid' || // Unpaid status means no collection happened
          // NEW: If amount equals loan amount, it's likely a disbursement
          (client && t.amount === client.loanAmount) ||
          // NEW: If amount is much larger than daily payment (>2x), likely disbursement
          (client && t.amount > client.dailyPayment * 2);
        
        // ONLY count if it's for this date AND it's NOT a loan disbursement
        const shouldCount = isForThisDate && !isLoanDisbursement;
        
        // DEBUG: Log what's being excluded
        if (dateStr === new Date().toISOString().split('T')[0]) {
          if (isForThisDate && isLoanDisbursement) {
            console.log(`❌ EXCLUDED TRANSACTION (${dateStr}):`, {
              clientName: t.clientName,
              amount: t.amount,
              reason: t.isNewLoan ? 'isNewLoan=true' : 
                      t.status === 'Unpaid' ? 'status=Unpaid' :
                      (client && t.amount === client.loanAmount) ? 'amount matches loan amount' :
                      (client && t.amount > client.dailyPayment * 2) ? 'amount > 2x daily payment' :
                      'notes contain disbursement keywords',
              notes: t.notes,
              clientDailyPayment: client?.dailyPayment,
              clientLoanAmount: client?.loanAmount,
            });
          }
          if (shouldCount) {
            console.log(`✅ INCLUDED TRANSACTION (${dateStr}):`, {
              clientName: t.clientName,
              amount: t.amount,
              status: t.status,
              notes: t.notes,
              clientDailyPayment: client?.dailyPayment,
            });
          }
        }
        
        return shouldCount;
      });
      
      // DEBUG: Log summary for today
      if (dateStr === new Date().toISOString().split('T')[0]) {
        console.log(`📊 TODAY'S SUMMARY (${dateStr}):`, {
          totalTransactionsForDate: transactions.filter(t => t.date === dateStr).length,
          paymentTransactionsCounted: paymentTransactionsForDay.length,
          totalCollected: paymentTransactionsForDay.reduce((sum, t) => sum + t.amount, 0),
        });
      }
      
      // Calculate total collected from ACTUAL payments received
      const collected = paymentTransactionsForDay.reduce((sum, t) => sum + t.amount, 0);
      
      // Get client IDs who ACTUALLY made payments (moved from unpaid to paid)
      const clientsWhoPaid = new Set(paymentTransactionsForDay.map(t => t.clientId));
      
      // PAID CLIENTS: Only those who have actual payment transactions for this day
      const paidClientsWithAmounts = activeClients
        .filter(c => clientsWhoPaid.has(c.id))
        .map(client => {
          const totalPaid = paymentTransactionsForDay
            .filter(t => t.clientId === client.id)
            .reduce((sum, t) => sum + t.amount, 0);
          return { ...client, actualAmountPaid: totalPaid };
        });
      
      // NOT PAID CLIENTS: All active clients who have NOT made payments yet
      const unpaidClients = activeClients
        .filter(c => !clientsWhoPaid.has(c.id))
        .map(c => ({ ...c, actualAmountPaid: 0 }));
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
        dateStr,
        expected: 0, // Not using expected amounts - only real data
        collected,
        collectionRate: 0, // Not calculating rate - only showing real amounts
        paidClients: paidClientsWithAmounts,
        unpaidClients: unpaidClients,
      });
    }
    
    return data.reverse(); // Show oldest to newest
  }, [clients, transactions, daysToShow]);

  // Calculate overall metrics
  const totalExpected = historicalData.reduce((sum, d) => sum + d.expected, 0);
  const totalCollected = historicalData.reduce((sum, d) => sum + d.collected, 0);
  const overallRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
  
  // Get clients with consecutive missed days
  const clientsMissedPayments = useMemo(() => {
    const missedMap = new Map<string, { client: Client; missedDays: number; totalMissed: number }>();
    
    clients.filter(c => c.status === 'Active').forEach(client => {
      let consecutiveMissed = 0;
      let totalMissedAmount = 0;
      
      // Check from most recent to oldest
      for (let i = historicalData.length - 1; i >= 0; i--) {
        const day = historicalData[i];
        const isPaid = day.paidClients.some(c => c.id === client.id);
        
        if (!isPaid && day.unpaidClients.some(c => c.id === client.id)) {
          consecutiveMissed++;
          totalMissedAmount += client.dailyPayment;
        } else if (isPaid) {
          break; // Stop counting consecutive days once we find a payment
        }
      }
      
      if (consecutiveMissed > 0) {
        missedMap.set(client.id, {
          client,
          missedDays: consecutiveMissed,
          totalMissed: totalMissedAmount,
        });
      }
    });
    
    return Array.from(missedMap.values()).sort((a, b) => b.missedDays - a.missedDays);
  }, [clients, historicalData]);

  if (!open) return null;

  const selectedDayData = selectedDay ? historicalData.find(d => d.dateStr === selectedDay) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{userName}</h2>
              <p className="text-sm text-gray-600 mt-1">{userEmail}</p>
              <p className="text-xs text-gray-500 mt-1">
                Performance History - Last {daysToShow} Days
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">View:</span>
            {[7, 14, 30].map(days => (
              <Button
                key={days}
                size="sm"
                variant={daysToShow === days ? 'default' : 'outline'}
                onClick={() => setDaysToShow(days)}
                className={daysToShow === days ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                {days} Days
              </Button>
            ))}
          </div>

          {/* Overall Summary */}
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary - Last {daysToShow} Days (Real Transaction Data)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Collected</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{formatUGX(totalCollected)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Clients</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">{clients.length}</p>
              </div>
            </div>
          </Card>

          {/* Clients with Missed Payments */}
          {clientsMissedPayments.length > 0 && (
            <Card className="p-4 sm:p-6 bg-red-50 border-red-200">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Clients with Missed Payments ({clientsMissedPayments.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {clientsMissedPayments.map(({ client, missedDays, totalMissed }) => (
                  <div
                    key={client.id}
                    className="p-3 bg-white border border-red-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{client.fullName}</p>
                        <p className="text-sm text-gray-600 truncate">{client.phoneNumber}</p>
                        <p className="text-xs text-gray-500 mt-1">{client.address}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge className="bg-red-600 text-white mb-1">
                          {missedDays} {missedDays === 1 ? 'day' : 'days'}
                        </Badge>
                        <p className="text-sm font-bold text-red-600">{formatUGX(totalMissed)}</p>
                        <p className="text-xs text-gray-500">Missed</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Daily Performance Timeline */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Performance Timeline</h3>
            <div className="space-y-2">
              {historicalData.map((day) => {
                const isSelected = selectedDay === day.dateStr;
                return (
                  <div key={day.dateStr}>
                    <div
                      onClick={() => setSelectedDay(isSelected ? null : day.dateStr)}
                      className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 bg-gray-50 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-gray-900">{day.date}</p>
                            <p className="text-xs text-gray-500">{day.dateStr}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl sm:text-2xl font-bold text-green-600">
                            {formatUGX(day.collected)}
                          </p>
                          <p className="text-xs text-gray-500">Collected</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 text-xs">
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{day.paidClients.length} Paid</span>
                        </div>
                        <div className="flex items-center gap-1 text-orange-600">
                          <XCircle className="w-4 h-4" />
                          <span>{day.unpaidClients.length} Not Paid</span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Day Details */}
                    {isSelected && selectedDayData && (
                      <div className="mt-2 p-4 bg-white border-2 border-purple-300 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Paid Clients */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <h4 className="font-semibold text-gray-900">
                                Paid ({selectedDayData.paidClients.length})
                              </h4>
                            </div>
                            {selectedDayData.paidClients.length > 0 ? (
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {selectedDayData.paidClients.map(client => (
                                  <div
                                    key={client.id}
                                    className="p-2 bg-green-50 border border-green-200 rounded-lg"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-gray-900 truncate">
                                          {client.fullName}
                                        </p>
                                        <p className="text-xs text-gray-600 truncate">
                                          {client.phoneNumber}
                                        </p>
                                      </div>
                                      <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-semibold text-green-600">
                                          {formatUGX(client.actualAmountPaid)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                                No payments received
                              </p>
                            )}
                          </div>

                          {/* Unpaid Clients */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <XCircle className="w-5 h-5 text-orange-600" />
                              <h4 className="font-semibold text-gray-900">
                                Not Paid ({selectedDayData.unpaidClients.length})
                              </h4>
                            </div>
                            {selectedDayData.unpaidClients.length > 0 ? (
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {selectedDayData.unpaidClients.map(client => (
                                  <div
                                    key={client.id}
                                    className="p-2 bg-orange-50 border border-orange-200 rounded-lg"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-gray-900 truncate">
                                          {client.fullName}
                                        </p>
                                        <p className="text-xs text-gray-600 truncate">
                                          {client.phoneNumber}
                                        </p>
                                      </div>
                                      <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-semibold text-orange-600">
                                          UGX 0
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {client.startDate === selectedDayData.dateStr ? '(New Loan)' : '(Not Paid)'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 bg-green-50 rounded-lg">
                                <CheckCircle2 className="w-8 h-8 mx-auto mb-1 text-green-400" />
                                <p className="text-sm font-semibold text-green-600">All paid!</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onClose}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}