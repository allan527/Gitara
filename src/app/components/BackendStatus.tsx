import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';

interface BackendStatusProps {
  connected: boolean;
  loading?: boolean;
  error?: string | null;
  compact?: boolean;
}

export const BackendStatus = ({ 
  connected, 
  loading = false, 
  error = null,
  compact = false 
}: BackendStatusProps) => {
  if (loading) {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-700 mr-2" />
        Connecting...
      </Badge>
    );
  }

  if (error) {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
        <XCircle className="h-3 w-3 mr-1" />
        {compact ? 'Error' : 'Backend Error'}
      </Badge>
    );
  }

  if (connected) {
    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
        <CheckCircle className="h-3 w-3 mr-1" />
        {compact ? 'Cloud' : 'Cloud Connected'}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
      <AlertCircle className="h-3 w-3 mr-1" />
      {compact ? 'Local' : 'Local Only'}
    </Badge>
  );
};
