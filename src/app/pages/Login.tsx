import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { LogIn, Lock, User } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => void;
}

const VALID_USERS = [
  { email: 'william@boss.com', password: 'William2026', role: 'Boss' },
  { email: 'cashier.com', password: 'Cash2026#', role: 'Cashier' },
  { email: 'gasasira.com', password: 'Gasasira2021', role: 'Field Officer' },
  { email: 'field2.com', password: 'Field2@26', role: 'Field Officer' },
  { email: 'field3.com', password: 'Field3@26', role: 'Field Officer' },
];

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate a brief loading state
    setTimeout(() => {
      const user = VALID_USERS.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        onLogin(user.email);
      } else {
        setError('Invalid email or password');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-bounce-subtle"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
      
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-lg shadow-2xl rounded-3xl border border-white/20 animate-scale-in relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8 animate-slide-in-down">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl mx-auto transform hover:scale-110 transition-transform">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">GITALA BRANCH</h1>
          <p className="text-gray-600 mt-3 font-medium">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="animate-slide-in-left stagger-1">
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-emerald-500" />
              </div>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all-smooth bg-gray-50 hover:bg-white font-medium"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="animate-slide-in-left stagger-2">
            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-emerald-500" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all-smooth bg-gray-50 hover:bg-white font-medium"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-4 rounded-xl text-sm font-medium animate-slide-in-down flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary hover:opacity-90 text-white py-4 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all-smooth touch-feedback disabled:opacity-50 animate-slide-in-up stagger-3"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </span>
            )}
          </Button>
        </form>

        {/* Quick Access Info */}
        <div className="mt-8 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 animate-fade-in">
          <p className="text-xs text-emerald-900 font-bold mb-3 flex items-center gap-2">
            <span className="text-lg">🔑</span>
            Valid Accounts:
          </p>
          <ul className="text-xs text-gray-700 space-y-2 font-medium">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              william@boss.com (Boss)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              cashier.com (Cashier)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              gasasira.com (Field Officer)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              field2.com (Field Officer)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              field3.com (Field Officer)
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}