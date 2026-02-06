import { useState, useMemo } from 'react';
import { Card } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { AlertCircle, PhoneCall, User, Clock, DollarSign, Calendar, UserCircle } from 'lucide-react';
import { Client, formatUGX } from '@/app/data/mockData';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Footer } from '@/app/components/Footer';

interface MissedPaymentsProps {
  clients: Client[];
  transactions?: any[]; // Need transactions to check if payment made today
  onViewClient?: (clientId: string) => void;
}

interface ClientWithMissedDays extends Client {
  daysSinceStart: number;
  hasPaidToday: boolean;
  expectedPaymentToday: number;
}

export function MissedPayments({ clients, transactions = [], onViewClient }: MissedPaymentsProps) {
  const [activeTab, setActiveTab] = useState('all');

  // NEW LOGIC: Show all active clients, mark who hasn't paid today
  const clientsWithMissedPayments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    return clients
      .filter(c => c.status === 'Active')
      .map(client => {
        // Check if client has made a payment TODAY
        const hasPaidToday = transactions.some(t => 
          t.clientId === client.id && 
          t.date === todayStr
        );

        // Calculate days since loan started
        const startDate = new Date(client.startDate);
        startDate.setHours(0, 0, 0, 0);
        const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        return {
          ...client,
          daysSinceStart,
          hasPaidToday,
          expectedPaymentToday: client.dailyPayment,
          missedDays: 0, // Not used in new logic
          missedAmount: 0, // Not used in new logic
        } as ClientWithMissedDays;
      })
      .filter(c => !c.hasPaidToday) // Only show clients who haven't paid today
      .sort((a, b) => b.dailyPayment - a.dailyPayment); // Sort by daily payment (highest first)
  }, [clients, transactions]);

  // Filter clients - simplified since we only show "not paid today"
  const filteredClients = useMemo(() => {
    // No filtering needed - just show all who haven't paid today
    return clientsWithMissedPayments;
  }, [clientsWithMissedPayments]);

  // Calculate summary stats - simplified
  const totalExpectedToday = clientsWithMissedPayments.reduce((sum, c) => sum + c.expectedPaymentToday, 0);
  const totalClientsNotPaid = clientsWithMissedPayments.length;
  const totalActiveClients = clients.filter(c => c.status === 'Active').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Calendar className="h-7 w-7 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Collection Tracker</h1>
          <p className="text-gray-600 mt-1">Track which clients have paid today - automatically updates when payments are collected</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Yet to Pay Today</p>
              <p className="text-3xl font-bold text-gray-900">{totalClientsNotPaid} / {totalActiveClients}</p>
              <p className="text-xs text-gray-500 mt-1">Active clients</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Expected from Today</p>
              <p className="text-2xl font-bold text-gray-900">{formatUGX(totalExpectedToday)}</p>
              <p className="text-xs text-gray-500 mt-1">Total daily collections</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Collection Progress</p>
              <p className="text-3xl font-bold text-green-600">{totalActiveClients - totalClientsNotPaid}</p>
              <p className="text-xs text-gray-500 mt-1">Paid today</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Client List */}
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-xl font-semibold text-gray-900">Clients to Collect From Today</h2>
          <p className="text-sm text-gray-600 mt-1">These clients haven't made their payment today yet</p>
        </div>

        <div className="p-6">{filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
              <p className="text-green-600 text-lg font-semibold">🎉 All clients have paid today!</p>
              <p className="text-gray-400 text-sm mt-1">Great job! Come back tomorrow for the next collection.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client) => {
                return (
                  <div
                    key={client.id}
                    className="p-5 rounded-xl border-2 bg-orange-50 border-orange-200 transition-all hover:shadow-md"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Client Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between lg:justify-start gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{client.fullName}</h3>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <PhoneCall className="h-3 w-3" />
                                {client.phoneNumber}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-orange-500 text-white hover:bg-orange-500">
                            Not Paid Today
                          </Badge>
                        </div>

                        {/* Payment Details */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                          <div className="bg-white p-3 rounded-lg border border-orange-200">
                            <p className="text-xs text-gray-600 mb-1">Expected Today</p>
                            <p className="text-lg font-bold text-blue-600">{formatUGX(client.expectedPaymentToday)}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-orange-200">
                            <p className="text-xs text-gray-600 mb-1">Total Outstanding</p>
                            <p className="text-lg font-bold text-orange-600">{formatUGX(client.outstandingBalance)}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-orange-200">
                            <p className="text-xs text-gray-600 mb-1">Daily Payment</p>
                            <p className="text-lg font-bold text-gray-900">{formatUGX(client.dailyPayment)}</p>
                          </div>
                        </div>

                        {/* Assigned To */}
                        {client.assignedTo && (
                          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                            <UserCircle className="h-4 w-4 text-purple-600" />
                            <span className="text-sm text-gray-700">
                              Assigned to: <span className="font-semibold text-purple-700">{client.assignedTo}</span>
                            </span>
                          </div>
                        )}
                        {!client.assignedTo && (
                          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-yellow-700 font-medium">
                              Not assigned to any field officer
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex lg:flex-col gap-2">
                        <Button
                          onClick={() => window.open(`tel:${client.phoneNumber}`)}
                          className="flex-1 lg:flex-none gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <PhoneCall className="h-4 w-4" />
                          Call Now
                        </Button>
                        {onViewClient && (
                          <Button
                            variant="outline"
                            onClick={() => onViewClient(client.id)}
                            className="flex-1 lg:flex-none"
                          >
                            Collect Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
      <Footer />
    </div>
  );
}