import { AddClientModal } from '../components/AddClientModal';
import { EditClientModal } from '../components/EditClientModal';
import { Footer } from '../components/Footer';
import { Search, Eye, Edit, UserPlus, TrendingUp, TrendingDown, X, SlidersHorizontal, Users } from 'lucide-react';
import { Client, formatUGX } from '../data/mockData';
import { toast } from 'sonner';
import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/table';

interface ClientsProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onViewClient: (clientId: string) => void;
  currentUser: string | null;
}

type StatusFilter = 'All' | 'Active' | 'Completed';
type SortOption = 'name' | 'loanAmount' | 'outstanding' | 'startDate';

export function Clients({ clients, onAddClient, onUpdateClient, onViewClient, currentUser }: ClientsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const isBoss = currentUser === 'william@boss.com';

  // Filter and sort clients
  const filteredAndSortedClients = clients
    .filter((client) => {
      // Status filter
      if (statusFilter !== 'All' && client.status !== statusFilter) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          client.fullName.toLowerCase().includes(query) ||
          client.phoneNumber.includes(query) ||
          client.address.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          // Null-safe name comparison
          const nameA = a.fullName || '';
          const nameB = b.fullName || '';
          comparison = nameA.localeCompare(nameB);
          break;
        case 'loanAmount':
          comparison = a.loanAmount - b.loanAmount;
          break;
        case 'outstanding':
          comparison = a.outstandingBalance - b.outstandingBalance;
          break;
        case 'startDate':
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Clients / Borrowers</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage all your loan clients</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Client
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-3 sm:p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <Input
            type="text"
            placeholder="Search by name, phone, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-gray-100 rounded-full flex-shrink-0"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
        
        {/* Filter and Sort Row */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {(['All', 'Active', 'Completed'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
                {status === 'Active' && ` (${clients.filter(c => c.status === 'Active').length})`}
                {status === 'Completed' && ` (${clients.filter(c => c.status === 'Completed').length})`}
                {status === 'All' && ` (${clients.length})`}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white hover:border-gray-400 transition-colors"
            >
              <option value="name">Sort by Name</option>
              <option value="loanAmount">Sort by Loan Amount</option>
              <option value="outstanding">Sort by Outstanding</option>
              <option value="startDate">Sort by Start Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? (
                <TrendingUp className="w-4 h-4 text-gray-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || statusFilter !== 'All') && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600">
                Showing {filteredAndSortedClients.length} of {clients.length} clients
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Total Clients</p>
          <p className="text-xl sm:text-3xl font-bold text-gray-900">{clients.length}</p>
        </Card>
        <Card className="p-3 sm:p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Active Loans</p>
          <p className="text-xl sm:text-3xl font-bold text-green-600">
            {clients.filter(c => c.status === 'Active').length}
          </p>
        </Card>
        <Card className="p-3 sm:p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Completed Loans</p>
          <p className="text-xl sm:text-3xl font-bold text-blue-600">
            {clients.filter(c => c.status === 'Completed').length}
          </p>
        </Card>
      </div>

      {/* Clients Table - Desktop */}
      <Card className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Full Name</TableHead>
                <TableHead className="font-semibold">Phone Number</TableHead>
                <TableHead className="font-semibold">Address</TableHead>
                <TableHead className="font-semibold text-right">Loan Amount</TableHead>
                <TableHead className="font-semibold text-right">Outstanding</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    No clients found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{client.fullName}</TableCell>
                    <TableCell className="text-gray-600">{client.phoneNumber}</TableCell>
                    <TableCell className="text-gray-600">{client.address}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatUGX(client.loanAmount)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatUGX(client.outstandingBalance)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          client.status === 'Active'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                        }
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewClient(client.id)}
                          className="h-8"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {isBoss && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedClient(client);
                              setShowEditModal(true);
                            }}
                            className="h-8 text-gray-600 hover:text-gray-900"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Clients Cards - Mobile - Compact */}
      <div className="md:hidden space-y-2.5">
        {filteredAndSortedClients.length === 0 ? (
          <Card className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 font-medium">No clients found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          </Card>
        ) : (
          filteredAndSortedClients.map((client) => {
            const paymentProgress = client.loanAmount > 0 
              ? ((client.loanAmount - client.outstandingBalance) / client.loanAmount) * 100 
              : 0;
            
            return (
              <Card 
                key={client.id} 
                onClick={() => onViewClient(client.id)}
                className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm active:bg-gray-50 transition-colors"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-gray-900 truncate flex-1">{client.fullName}</h3>
                  <Badge
                    className={
                      client.status === 'Active'
                        ? 'bg-green-100 text-green-700 flex-shrink-0 ml-2 text-xs'
                        : 'bg-blue-100 text-blue-700 flex-shrink-0 ml-2 text-xs'
                    }
                  >
                    {client.status}
                  </Badge>
                </div>

                {/* Phone */}
                <p className="text-xs text-gray-600 mb-2">{client.phoneNumber}</p>

                {/* Financial Info - Compact */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-blue-50 rounded px-2 py-1.5">
                    <p className="text-xs text-blue-700">Loan</p>
                    <p className="text-sm font-bold text-blue-900 truncate">{formatUGX(client.loanAmount)}</p>
                  </div>
                  <div className="bg-orange-50 rounded px-2 py-1.5">
                    <p className="text-xs text-orange-700">Outstanding</p>
                    <p className="text-sm font-bold text-orange-900 truncate">{formatUGX(client.outstandingBalance)}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs font-bold text-blue-600">{paymentProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={
                        paymentProgress >= 75 ? 'h-1.5 rounded-full transition-all bg-green-500' :
                        paymentProgress >= 50 ? 'h-1.5 rounded-full transition-all bg-blue-500' :
                        paymentProgress >= 25 ? 'h-1.5 rounded-full transition-all bg-yellow-500' :
                        'h-1.5 rounded-full transition-all bg-red-500'
                      }
                      style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewClient(client.id);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-8"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    View Details
                  </Button>
                  {isBoss && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(client);
                        setShowEditModal(true);
                      }}
                      className="border-gray-300 hover:bg-gray-50 h-8 px-3"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Client Modal */}
      <AddClientModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={onAddClient}
      />

      {/* Edit Client Modal */}
      <EditClientModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        client={selectedClient}
        onUpdate={onUpdateClient}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}