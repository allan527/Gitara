import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Users,
  UserPlus,
  Key,
  Trash2,
  Shield,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface User {
  email: string;
  password: string;
  role: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface UserManagementProps {
  currentUser?: string | null;
}

export function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  // Add user form
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Field Officer');
  
  // Change password form
  const [changePasswordEmail, setChangePasswordEmail] = useState('');
  const [changePasswordNew, setChangePasswordNew] = useState('');

  const isOwner = currentUser === 'william@boss.com';

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7f28f6fd`;

  useEffect(() => {
    if (isOwner) {
      loadUsers();
    }
  }, [isOwner]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/users`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail || !newPassword || !newRole) {
      toast.error('All fields are required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          role: newRole,
          requestedBy: currentUser,
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success('User added successfully!');
        setNewEmail('');
        setNewPassword('');
        setNewRole('Field Officer');
        setShowAddForm(false);
        loadUsers();
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
    }
  };

  const handleChangePassword = async (email: string, newPassword: string) => {
    if (!newPassword) {
      toast.error('Password cannot be empty');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/users/${encodeURIComponent(email)}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          newPassword,
          requestedBy: currentUser,
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`Password changed for ${email}`);
        setChangePasswordEmail('');
        setChangePasswordNew('');
        loadUsers();
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (email === 'william@boss.com') {
      toast.error('Cannot delete the owner account');
      return;
    }

    if (!confirm(`Are you sure you want to delete user: ${email}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/users/${encodeURIComponent(email)}?requestedBy=${encodeURIComponent(currentUser || '')}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(data.message || 'User deleted successfully');
        loadUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const togglePasswordVisibility = (email: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [email]: !prev[email],
    }));
  };

  // If not owner, show unauthorized message
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">
                Only the owner (william@boss.com) can access user management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage system users and permissions</p>
              </div>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Add User Form */}
        {showAddForm && (
          <Card className="mb-6 border-emerald-200 bg-emerald-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <UserPlus className="h-5 w-5" />
                Add New User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="text"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    >
                      <option value="Field Officer">Field Officer</option>
                      <option value="Cashier">Cashier</option>
                      <option value="Manager">Manager</option>
                      <option value="Boss">Boss</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              System Users ({users.length})
            </CardTitle>
            <CardDescription>View and manage all system users</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No users found</div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.email}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow gap-4"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{user.email}</h3>
                        {user.email === 'william@boss.com' && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                            OWNER
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          {user.role}
                        </span>
                        <span className="flex items-center gap-1">
                          <Key className="h-4 w-4" />
                          Password:{' '}
                          {showPasswords[user.email] ? (
                            <span className="font-mono">{user.password}</span>
                          ) : (
                            '••••••••'
                          )}
                          <button
                            onClick={() => togglePasswordVisibility(user.email)}
                            className="ml-1 text-emerald-600 hover:text-emerald-700"
                          >
                            {showPasswords[user.email] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </span>
                      </div>
                      {user.createdAt && (
                        <p className="text-xs text-gray-500">
                          Created: {new Date(user.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newPass = prompt(`Enter new password for ${user.email}:`);
                          if (newPass) {
                            handleChangePassword(user.email, newPass);
                          }
                        }}
                        className="flex-1 sm:flex-none"
                      >
                        <Key className="h-4 w-4 mr-1" />
                        Change Password
                      </Button>
                      {user.email !== 'william@boss.com' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user.email)}
                          className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Owner Permissions</p>
                <p>
                  As the owner (william@boss.com), you have full control over user management. You
                  can add new users, change passwords, and delete users (except your own account).
                  All other users have read-only access to this page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
