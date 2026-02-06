import { useState, useMemo } from 'react';
import { X, UserPlus, Search, Users, CheckCircle2, UserMinus, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Client } from '@/app/data/mockData';

interface ClientAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onAssignClient: (clientId: string, userEmail: string) => void;
}

// List of all users in the system
const ALL_USERS = [
  { email: 'william@boss.com', name: 'GITARA BRANCH', role: 'Boss' },
  { email: 'cashier.com', name: 'Cashier', role: 'Cashier' },
  { email: 'field1.com', name: 'Field Officer 1', role: 'Field Officer' },
  { email: 'field2.com', name: 'Field Officer 2', role: 'Field Officer' },
  { email: 'field3.com', name: 'Field Officer 3', role: 'Field Officer' },
  { email: 'field4.com', name: 'Field Officer 4', role: 'Field Officer' },
  { email: 'field5.com', name: 'Field Officer 5', role: 'Field Officer' },
  { email: 'field6.com', name: 'Field Officer 6', role: 'Field Officer' },
];

export function ClientAllocationModal({
  isOpen,
  onClose,
  clients,
  onAssignClient,
}: ClientAllocationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    const query = searchQuery.toLowerCase();
    let filtered = clients;

    if (query) {
      filtered = filtered.filter(
        (c) =>
          c.fullName.toLowerCase().includes(query) ||
          c.phoneNumber.includes(query) ||
          c.address.toLowerCase().includes(query)
      );
    }

    // Sort: unassigned first, then by name
    return filtered.sort((a, b) => {
      if (!a.assignedTo && b.assignedTo) return -1;
      if (a.assignedTo && !b.assignedTo) return 1;
      // Null-safe name comparison
      const nameA = a.fullName || '';
      const nameB = b.fullName || '';
      return nameA.localeCompare(nameB);
    });
  }, [clients, searchQuery]);

  // Group clients by assigned user
  const clientsByUser = useMemo(() => {
    const grouped: { [key: string]: Client[] } = {
      unassigned: clients.filter(c => !c.assignedTo),
    };

    ALL_USERS.forEach(user => {
      grouped[user.email] = clients.filter(c => c.assignedTo === user.email);
    });

    return grouped;
  }, [clients]);

  const handleAssign = (clientId: string, userEmail: string) => {
    onAssignClient(clientId, userEmail);
    setSelectedClients(prev => {
      const next = new Set(prev);
      next.delete(clientId);
      return next;
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleBulkAssign = () => {
    if (!selectedUser || selectedClients.size === 0) return;
    
    selectedClients.forEach(clientId => {
      onAssignClient(clientId, selectedUser);
    });
    
    setSelectedClients(new Set());
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleUnassign = (clientId: string) => {
    onAssignClient(clientId, '');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-7xl h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Client Allocation</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 hidden sm:block">Drag-and-drop style assignment for field officers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 flex-shrink-0">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm sm:text-base text-green-800 font-medium">
              {selectedClients.size > 0 
                ? `${selectedClients.size} client(s) assigned!` 
                : 'Client assignment updated!'}
            </p>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedClients.size > 0 && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm sm:text-base text-blue-900 font-medium">
                {selectedClients.size} selected
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedClients(new Set())}
                className="flex-1 sm:flex-none"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleBulkAssign}
                disabled={!selectedUser}
                className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                <span className="truncate">Assign {selectedUser && `to ${ALL_USERS.find(u => u.email === selectedUser)?.name.split(' ')[0]}`}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Search and View Toggle */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Content - Grid View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Field Officers Column */}
              <div className="lg:col-span-1 space-y-4">
                <div className="sticky top-0 bg-white pb-3 sm:pb-4 z-10">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    Field Officers
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {selectedUser 
                      ? 'Tap clients to assign' 
                      : 'Select an officer'}
                  </p>
                </div>

                <div className="space-y-3">
                  {ALL_USERS.map(user => {
                    const userClients = clientsByUser[user.email] || [];
                    const activeCount = userClients.filter(c => c.status === 'Active').length;
                    const isSelected = selectedUser === user.email;

                    return (
                      <div
                        key={user.email}
                        onClick={() => setSelectedUser(isSelected ? null : user.email)}
                        className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all active:scale-98 ${
                          isSelected
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md active:shadow-lg'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">{user.name}</p>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                              )}
                              {user.role === 'Boss' && (
                                <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full flex-shrink-0">
                                  OWNER
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5 truncate">{user.email}</p>
                            
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              <div className="bg-white/60 rounded-lg p-2">
                                <p className="text-xs text-gray-600">Total</p>
                                <p className="text-base sm:text-lg font-bold text-gray-900">{userClients.length}</p>
                              </div>
                              <div className="bg-white/60 rounded-lg p-2">
                                <p className="text-xs text-gray-600">Active</p>
                                <p className="text-base sm:text-lg font-bold text-green-600">{activeCount}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expandable client list */}
                        {userClients.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <details className="group">
                              <summary className="text-xs font-medium text-purple-600 cursor-pointer hover:text-purple-700 flex items-center gap-1 select-none">
                                <span>View {userClients.length} client{userClients.length > 1 ? 's' : ''}</span>
                                <ArrowRight className="h-3 w-3 group-open:rotate-90 transition-transform" />
                              </summary>
                              <div className="mt-2 space-y-1.5 max-h-40 sm:max-h-48 overflow-y-auto">
                                {userClients.map(c => (
                                  <div 
                                    key={c.id} 
                                    className="flex items-center justify-between gap-2 p-2 bg-white/80 rounded hover:bg-white transition-colors group/client"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-gray-900 truncate">{c.fullName}</p>
                                      <p className="text-xs text-gray-500 truncate">{c.phoneNumber}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span className={`text-xs px-2 py-0.5 rounded ${
                                        c.status === 'Active' ? 'bg-green-100 text-green-700' : 
                                        c.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 
                                        'bg-red-100 text-red-700'
                                      }`}>
                                        {c.status}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUnassign(c.id);
                                        }}
                                        className="flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-all active:scale-95 border border-red-200"
                                        title="Unassign Client"
                                      >
                                        <UserMinus className="h-3.5 w-3.5" />
                                        <span className="text-xs font-medium">Unassign</span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Unassigned Clients Column */}
              <div className="lg:col-span-2 space-y-4">
                {clientsByUser.unassigned.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {clientsByUser.unassigned
                      .filter(c => 
                        !searchQuery || 
                        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.phoneNumber.includes(searchQuery) ||
                        c.address.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(client => {
                        const isSelected = selectedClients.has(client.id);
                        return (
                          <div
                            key={client.id}
                            onClick={() => {
                              if (selectedUser) {
                                if (!isSelected) {
                                  handleAssign(client.id, selectedUser);
                                }
                              } else {
                                toggleClientSelection(client.id);
                              }
                            }}
                            className={`p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer active:scale-98 ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : selectedUser
                                  ? 'border-orange-300 bg-orange-50 hover:bg-orange-100 hover:shadow-md active:shadow-lg'
                                  : 'border-orange-200 bg-orange-50/50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Selection checkbox */}
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleClientSelection(client.id);
                                }}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all active:scale-95 ${
                                  isSelected 
                                    ? 'bg-blue-600 border-blue-600' 
                                    : 'border-gray-300 hover:border-blue-400'
                                }`}
                              >
                                {isSelected && (
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">{client.fullName}</p>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">{client.phoneNumber}</p>
                                <p className="text-xs text-gray-500 mt-1 truncate">{client.address}</p>
                                
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    client.status === 'Active' ? 'bg-green-100 text-green-800' :
                                    client.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {client.status}
                                  </span>
                                </div>
                              </div>

                              {selectedUser && !isSelected && (
                                <div className="flex-shrink-0">
                                  <UserPlus className="h-5 w-5 text-orange-600" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 text-green-400" />
                    <p className="text-base sm:text-lg font-semibold text-gray-900">All clients assigned!</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Every client has a field officer</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // List View
            <div className="space-y-6">
              {/* Unassigned Section */}
              {clientsByUser.unassigned.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-orange-600 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Unassigned Clients ({clientsByUser.unassigned.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {clientsByUser.unassigned
                      .filter(c => 
                        !searchQuery || 
                        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.phoneNumber.includes(searchQuery) ||
                        c.address.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(client => {
                        const isSelected = selectedClients.has(client.id);
                        return (
                          <div
                            key={client.id}
                            onClick={() => {
                              if (selectedUser && !isSelected) {
                                handleAssign(client.id, selectedUser);
                              } else {
                                toggleClientSelection(client.id);
                              }
                            }}
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : selectedUser
                                  ? 'border-orange-300 bg-orange-50 hover:bg-orange-100'
                                  : 'border-orange-200 bg-orange-50/50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleClientSelection(client.id);
                                }}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                  isSelected 
                                    ? 'bg-blue-600 border-blue-600' 
                                    : 'border-gray-300 hover:border-blue-400'
                                }`}
                              >
                                {isSelected && (
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                )}
                              </div>
                              
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="font-semibold text-gray-900">{client.fullName}</p>
                                  <p className="text-sm text-gray-600">{client.phoneNumber}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">{client.address}</p>
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    client.status === 'Active' ? 'bg-green-100 text-green-800' :
                                    client.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {client.status}
                                  </span>
                                </div>
                              </div>

                              {selectedUser && !isSelected && (
                                <UserPlus className="h-5 w-5 text-orange-600 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Assigned by User */}
              {ALL_USERS.map(user => {
                const userClients = clientsByUser[user.email] || [];
                if (userClients.length === 0) return null;

                const filteredUserClients = userClients.filter(c => 
                  !searchQuery || 
                  c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.phoneNumber.includes(searchQuery) ||
                  c.address.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filteredUserClients.length === 0) return null;

                return (
                  <div key={user.email}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        {user.name} ({filteredUserClients.length})
                        {user.role === 'Boss' && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
                            OWNER
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {filteredUserClients.map(client => (
                        <div
                          key={client.id}
                          className="p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="font-semibold text-gray-900">{client.fullName}</p>
                                <p className="text-sm text-gray-600">{client.phoneNumber}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">{client.address}</p>
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  client.status === 'Active' ? 'bg-green-100 text-green-800' :
                                  client.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {client.status}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnassign(client.id)}
                              className="ml-4"
                            >
                              <UserMinus className="h-4 w-4 mr-1" />
                              Unassign
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              {clientsByUser.unassigned.length > 0 && (
                <span className="text-orange-600 font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{clientsByUser.unassigned.length} unassigned</span>
                </span>
              )}
              {selectedClients.size > 0 && (
                <span className="text-blue-600 font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{selectedClients.size} selected</span>
                </span>
              )}
              {selectedUser && (
                <span className="text-purple-600 font-medium flex items-center gap-2 hidden sm:flex">
                  <UserPlus className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">To: {ALL_USERS.find(u => u.email === selectedUser)?.name.split(' ')[0]}</span>
                </span>
              )}
            </div>
            <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}