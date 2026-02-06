import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { formatUGX, Client } from '../data/mockData';
import { Calculator, DollarSign, CheckCircle } from 'lucide-react';

interface NewLoanModalProps {
  open: boolean;
  onClose: () => void;
  client: Client | null;
  onIssueNewLoan: (clientId: string, loanAmount: number) => void;
  currentUser?: string | null;
}

export function NewLoanModal({ 
  open, 
  onClose, 
  client,
  onIssueNewLoan,
  currentUser 
}: NewLoanModalProps) {
  const [loanAmount, setLoanAmount] = useState('');

  if (!client) return null;

  const loanAmountNum = parseFloat(loanAmount) || 0;
  const interest = loanAmountNum * 0.20;
  const totalPayable = loanAmountNum + interest;
  const dailyPayment = totalPayable / 30;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loanAmountNum <= 0) {
      return;
    }

    onIssueNewLoan(client.id, loanAmountNum);
    
    // Reset form
    setLoanAmount('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Issue New Loan</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Issue a new loan to existing client
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Client Info & Previous Loan Success */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-green-900">{client.fullName}</p>
                <p className="text-sm text-green-700 mt-1">
                  Previous loan completed successfully!
                </p>
                <div className="mt-3 pt-3 border-t border-green-200 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Previous Loan:</span>
                    <span className="font-medium text-green-900">{formatUGX(client.loanAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Total Paid:</span>
                    <span className="font-medium text-green-900">{formatUGX(client.totalPaid)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* New Loan Amount */}
          <div>
            <Label htmlFor="loanAmount">New Loan Amount (UGX) *</Label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="loanAmount"
                type="number"
                placeholder="Enter loan amount"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="pl-10"
                min="0"
                step="100"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimum: UGX 50,000 | Recommended: UGX 100,000 - 5,000,000
            </p>
          </div>

          {/* Loan Calculation Summary */}
          {loanAmountNum > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Loan Calculation</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Loan Principal:</span>
                  <span className="font-medium text-gray-900">{formatUGX(loanAmountNum)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Interest (20%):</span>
                  <span className="font-medium text-orange-600">{formatUGX(interest)}</span>
                </div>
                <div className="border-t border-blue-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Payable:</span>
                    <span className="text-lg font-bold text-blue-600">{formatUGX(totalPayable)}</span>
                  </div>
                </div>
                <div className="border-t border-blue-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Daily Payment (30 days):</span>
                    <span className="text-lg font-bold text-green-600">{formatUGX(dailyPayment)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Terms Notice */}
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
            <p className="text-xs text-gray-700">
              <strong>Loan Terms:</strong> 20% monthly interest rate, 30-day repayment period. 
              This will replace the previous loan record with a new active loan.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loanAmountNum <= 0}
            >
              Issue New Loan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}