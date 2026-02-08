import { BackendStatus } from './BackendStatus';

interface FooterProps {
  backendConnected?: boolean;
  backendLoading?: boolean;
  backendError?: string | null;
}

export function Footer({ 
  backendConnected = false, 
  backendLoading = false, 
  backendError = null 
}: FooterProps) {
  return (
    <footer className="mt-8 pt-6 pb-4 border-t border-gray-200">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <BackendStatus 
            connected={backendConnected} 
            loading={backendLoading}
            error={backendError}
          />
        </div>
        <p className="text-sm text-gray-600">
          © 2026 GITARA BRANCH, Uganda. All Rights Reserved.
        </p>
        <div className="pt-2 border-t border-gray-200 inline-block px-6">
          <p className="text-sm font-semibold text-gray-800">
            Developed by Allan
          </p>
          <p className="text-xs text-gray-500">
            Software Developer
          </p>
        </div>
      </div>
    </footer>
  );
}