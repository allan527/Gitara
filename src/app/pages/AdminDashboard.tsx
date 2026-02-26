import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Wallet, 
  RefreshCw, 
  TrendingUp, 
  MessageSquare, 
  AlertCircle,
  CheckCircle,
  BarChart3,
  Settings,
  FileText,
  Database,
  Bell,
  User,
  Activity
} from 'lucide-react';
import { fetchSMSBalance, parseBalance, getCurrency } from '../../services/africasTalkingApi';
import { toast } from 'sonner';
import { Footer } from '../components/Footer';

interface AdminDashboardProps {
  currentUser?: string | null;
}

export function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const [balance, setBalance] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Fetch balance on mount
  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const balanceStr = await fetchSMSBalance();
      setBalance(balanceStr);
      setLastRefresh(new Date());
      toast.success('Balance loaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load balance';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    toast.info('Refreshing balance...');
    loadBalance();
  };

  // Calculate balance status
  const numericBalance = balance ? parseBalance(balance) : 0;
  const currency = balance ? getCurrency(balance) : 'UGX';
  const isLowBalance = numericBalance < 500;
  const isActive = numericBalance > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Africa's Talking Balance Overview</p>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
              </Button>
              
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser === 'william@boss.com' ? 'William (Boss)' : 
                     currentUser === 'gasasira.com' ? 'Gasasira' :
                     currentUser === 'cashier.com' ? 'Cashier' :
                     currentUser === 'field2.com' ? 'Field Officer 2' :
                     currentUser === 'field3.com' ? 'Field Officer 3' : 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full justify-start bg-orange-500 hover:bg-orange-600 text-white"
                  variant="secondary"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                  variant="ghost"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  SMS Logs
                </Button>
                <Button 
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                  variant="ghost"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Transactions
                </Button>
                <Button 
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                  variant="ghost"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Usage
                </Button>
                <Button 
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                  variant="ghost"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>

            {/* API Info Card - HIDDEN */}
            {/* <Card className="mt-4 border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-900">
                  <Database className="h-4 w-4" />
                  API Connection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div>
                  <p className="font-semibold text-orange-800">Endpoint:</p>
                  <p className="text-orange-700 break-all">
                    api.africastalking.com/version1/user
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-orange-800">Data Source:</p>
                  <p className="text-orange-700">UserData.balance</p>
                </div>
                <div>
                  <p className="font-semibold text-orange-800">Username:</p>
                  <p className="text-orange-700">william_main_user</p>
                </div>
                <div className="flex items-center gap-1 pt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-orange-800 font-medium">Live Connection</p>
                </div>
              </CardContent>
            </Card> */}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Balance Card - Main Component */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-orange-50 via-white to-orange-50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Wallet className="h-6 w-6 text-white" />
                      </div>
                      Current SMS Balance
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      Real-time balance from Africa's Talking API
                    </CardDescription>
                  </div>
                  
                  {/* Status Badge */}
                  {!loading && !error && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      isLowBalance 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {isLowBalance ? (
                        <>
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-semibold text-sm">Low Balance</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-semibold text-sm">Active</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Loading State */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <RefreshCw className="h-12 w-12 text-orange-500 animate-spin" />
                    <p className="mt-4 text-gray-600 font-medium">Loading balance from API...</p>
                    <p className="text-sm text-gray-500 mt-1">Connecting to Africa's Talking</p>
                  </div>
                )}

                {/* Error State */}
                {error && !loading && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-red-600 font-semibold text-lg">Failed to load balance from API</p>
                    <p className="text-gray-600 text-sm mt-2 max-w-md text-center">{error}</p>
                    <Button 
                      onClick={handleRefresh}
                      className="mt-6 bg-orange-500 hover:bg-orange-600"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                )}

                {/* Success State - Balance Display */}
                {!loading && !error && balance && (
                  <div className="space-y-6">
                    {/* Big Balance Display */}
                    <div className="text-center py-10 sm:py-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-2xl">
                      <p className="text-white/90 text-base sm:text-sm font-semibold uppercase tracking-wider mb-3 sm:mb-2 px-4">
                        Available Balance
                      </p>
                      <div className="flex items-center justify-center px-4">
                        <p className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg whitespace-nowrap">
                          {balance || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Balance Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Wallet className="h-5 w-5 text-white" />
                          </div>
                          <p className="text-sm font-medium text-blue-900">Numeric Value</p>
                        </div>
                        <p className="text-3xl sm:text-2xl font-bold text-blue-900">
                          {numericBalance.toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">{currency}</p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl border border-purple-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-white" />
                          </div>
                          <p className="text-sm font-medium text-purple-900">Status</p>
                        </div>
                        <p className="text-3xl sm:text-2xl font-bold text-purple-900">
                          {isActive ? 'Active' : 'Inactive'}
                        </p>
                        <p className="text-xs text-purple-700 mt-1">
                          {isLowBalance ? 'Please top up' : 'Healthy balance'}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl border border-green-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <RefreshCw className="h-5 w-5 text-white" />
                          </div>
                          <p className="text-sm font-medium text-green-900">Last Updated</p>
                        </div>
                        <p className="text-xl sm:text-lg font-bold text-green-900">
                          {lastRefresh?.toLocaleTimeString('en-GB', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          {lastRefresh?.toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>

                    {/* Refresh Button */}
                    <div className="flex justify-center pt-4">
                      <Button 
                        onClick={handleRefresh}
                        disabled={loading}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                      >
                        <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Balance
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-emerald-900 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    SMS Sent Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-emerald-700">--</p>
                  <p className="text-xs text-emerald-600 mt-1">Feature coming soon</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Monthly Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-700">--</p>
                  <p className="text-xs text-blue-600 mt-1">Feature coming soon</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}