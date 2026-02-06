import { AlertCircle, CheckCircle2, Database, Rocket } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { healthCheck, isBackendConfigured } from '../services/api';

export function BackendSetupBanner() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isHealthy, setIsHealthy] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    setIsChecking(true);
    const configured = isBackendConfigured();
    setIsConfigured(configured);

    if (configured) {
      try {
        await healthCheck();
        setIsHealthy(true);
        console.log('✅ Backend is healthy');
      } catch {
        // Silently fail - backend not deployed yet
        setIsHealthy(false);
      }
    }
    setIsChecking(false);
  };

  if (isChecking) {
    return (
      <Card className="p-4 bg-blue-50 border-blue-200 mb-6 animate-pulse">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-blue-600 animate-spin" />
          <div>
            <p className="text-sm font-medium text-blue-900">Checking backend connection...</p>
          </div>
        </div>
      </Card>
    );
  }

  // ✅ Backend is connected and healthy
  if (isConfigured && isHealthy) {
    return (
      <Card className="p-4 bg-emerald-50 border-2 border-emerald-300 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">✅ Backend Connected</p>
              <p className="text-xs text-emerald-700">All data is being saved to Supabase database</p>
            </div>
          </div>
          <Button 
            onClick={checkBackendStatus}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3"
          >
            Refresh
          </Button>
        </div>
      </Card>
    );
  }

  // ⚠️ Backend is configured but not deployed yet
  if (isConfigured && !isHealthy) {
    return (
      <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 mb-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-yellow-900 mb-2">⚙️ Complete Setup - 3 Simple Steps</h3>
            <p className="text-sm text-yellow-800 mb-4">
              Backend is configured. Follow these steps to activate cloud storage:
            </p>
            
            <Button 
              onClick={() => setShowSteps(!showSteps)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm touch-feedback mb-4"
            >
              {showSteps ? 'Hide' : 'Show'} Deployment Steps
            </Button>

            {showSteps && (
              <div className="space-y-4 animate-slide-in-up">
                {/* Step 1: Run SQL Script */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <span className="text-xl">🗄️</span>
                    Step 1: Run SQL Script (2 minutes)
                  </h4>
                  <ol className="text-sm text-blue-800 space-y-1 ml-6 list-decimal">
                    <li>
                      Go to <a 
                        href="https://supabase.com/dashboard/project/zruzetnnneigombftzlj/sql/new" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline font-semibold hover:text-blue-600"
                      >
                        Supabase SQL Editor
                      </a>
                    </li>
                    <li>Click "New query"</li>
                    <li>Copy contents from <code className="bg-blue-100 px-1 rounded">/supabase_setup.sql</code></li>
                    <li>Paste and click "Run"</li>
                  </ol>
                  <div className="mt-2 p-2 bg-blue-100 rounded">
                    <p className="text-xs text-blue-900 font-semibold">Expected: "Database setup complete!"</p>
                  </div>
                </div>

                {/* Step 2: Deploy Edge Function */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                    <span className="text-xl">🚀</span>
                    Step 2: Deploy Edge Function (5 minutes)
                  </h4>
                  <ol className="text-sm text-green-800 space-y-1 ml-6 list-decimal">
                    <li>
                      Go to <a 
                        href="https://supabase.com/dashboard/project/zruzetnnneigombftzlj/functions" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline font-semibold hover:text-green-600"
                      >
                        Edge Functions
                      </a>
                    </li>
                    <li>Click "Deploy a new function"</li>
                    <li>Name: <code className="bg-green-100 px-1 rounded">server</code></li>
                    <li>Copy code from <code className="bg-green-100 px-1 rounded">/supabase/functions/server/index.tsx</code></li>
                    <li>Paste and deploy</li>
                  </ol>
                  <div className="mt-2 p-2 bg-green-100 rounded">
                    <p className="text-xs text-green-900 font-semibold">
                      ✅ NO SECRETS NEEDED!
                    </p>
                    <p className="text-xs text-green-800">
                      Supabase automatically provides SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY to all Edge Functions.
                    </p>
                  </div>
                </div>

                {/* Step 3: Test Connection */}
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                    <span className="text-xl">🚀</span>
                    Step 3: Test Connection (1 minute)
                  </h4>
                  <ol className="text-sm text-purple-800 space-y-1 ml-6 list-decimal">
                    <li>Click "Retry Connection" button above</li>
                    <li>Should see ✅ "Backend Connected"</li>
                    <li>Or use <code className="bg-purple-100 px-1 rounded">/test_connection.html</code></li>
                  </ol>
                </div>

                {/* Full Guide */}
                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-xl">📘</span>
                    Full Guide
                  </h4>
                  <p className="text-sm text-gray-700">
                    See <code className="bg-gray-200 px-1 rounded">/SUPABASE_CONNECTION_STEPS.md</code> for detailed instructions.
                  </p>
                </div>

                {/* Retry Button */}
                <Button 
                  onClick={checkBackendStatus}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold touch-feedback"
                >
                  🔄 Retry Connection
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // ❌ Backend is not configured
  return (
    <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 mb-6 shadow-lg animate-slide-in-down">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-emerald-900 mb-2">✅ App Running in Local Mode</h3>
          <p className="text-sm text-emerald-800 mb-3">
            All your data is saved to <strong>localStorage</strong> and persists across browser sessions.
            <br />
            <span className="text-xs text-emerald-700 mt-1 block">
              💾 Your data is safe and will remain even after closing the browser!
            </span>
          </p>
          
          <Button 
            onClick={() => setShowSteps(!showSteps)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm touch-feedback"
          >
            {showSteps ? 'Hide' : 'Show'} Cloud Features
          </Button>

          {showSteps && (
            <div className="mt-4 p-4 bg-white rounded-lg border-2 border-emerald-200 animate-slide-in-up">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Want Cloud Features?
              </h4>
              
              <div className="space-y-3 text-sm mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-lg">🌍</span>
                  <div>
                    <div className="font-semibold text-gray-900">Multi-Device Access</div>
                    <div className="text-xs text-gray-600">Access your data from any device</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-lg">☁️</span>
                  <div>
                    <div className="font-semibold text-gray-900">Cloud Backup</div>
                    <div className="text-xs text-gray-600">Never lose your data</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-lg">👥</span>
                  <div>
                    <div className="font-semibold text-gray-900">Team Collaboration</div>
                    <div className="text-xs text-gray-600">Multiple users, same data</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-lg">📱</span>
                  <div>
                    <div className="font-semibold text-gray-900">SMS Notifications</div>
                    <div className="text-xs text-gray-600">Send payment reminders</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-900">
                  <strong>📘 Ready to enable cloud features?</strong>
                  <br />
                  See <code className="bg-white px-1 rounded">/ENABLE_SUPABASE.md</code> for simple deployment steps (takes ~10 minutes).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}