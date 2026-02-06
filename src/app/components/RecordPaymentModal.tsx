import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { formatUGX, Client } from '../data/mockData';
import { DollarSign, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
  client: Client | null;
  onRecordPayment: (payment: {
    clientId: string;
    amount: number;
    notes: string;
    date: string;
    time: string;
    recordedBy?: string;
  }) => void;
  currentUser?: string | null;
}

export function RecordPaymentModal({ 
  open, 
  onClose, 
  client, 
  onRecordPayment,
  currentUser 
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('Daily payment');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  // Update amount when client changes
  useEffect(() => {
    if (client) {
      setAmount(client.dailyPayment.toString());
    }
  }, [client]);

  if (!client) return null;

  // Check if client has completed their loan
  const hasCompletedLoan = client.outstandingBalance <= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent payment if loan is completed
    if (hasCompletedLoan) {
      alert('This client has completed their loan! Please issue a new loan if they need one.');
      return;
    }
    
    const paymentAmount = parseFloat(amount);
    
    if (paymentAmount <= 0) {
      return;
    }

    // Get current time in HH:MM format
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);

    onRecordPayment({
      clientId: client.id,
      amount: paymentAmount,
      notes,
      date: paymentDate,
      time,
      recordedBy: currentUser || 'Unknown',
    });
    
    // Reset form to defaults
    setAmount(client.dailyPayment.toString());
    setNotes('Daily payment');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  const amountNum = parseFloat(amount) || 0;
  const newBalance = Math.max(0, client.outstandingBalance - amountNum);
  const newTotalPaid = client.totalPaid + amountNum;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Record Payment</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Record a loan repayment for {client.fullName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Loan Completed Warning */}
          {hasCompletedLoan && (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-green-900 mb-1">🎉 Loan Completed!</h3>
                  <p className="text-sm text-green-800">
                    {client.fullName} has successfully completed their loan payment! 
                    No more payments are needed. If they need another loan, please use the 
                    <strong> "Issue New Loan"</strong> button instead.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Client Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Client:</span>
                <span className="font-semibold text-gray-900">{client.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Outstanding Balance:</span>
                <span className="font-semibold text-orange-600">{formatUGX(client.outstandingBalance)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Recommended Daily Payment:</span>
                <span className="font-semibold text-blue-600">{formatUGX(client.dailyPayment)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2 italic">
                💡 You can adjust the amount above or below the recommended payment
              </div>
            </div>
          </div>

          {/* Payment Date */}
          <div>
            <Label htmlFor="paymentDate">Payment Date *</Label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="pl-10"
                max={new Date().toISOString().split('T')[0]}
                required
                disabled={hasCompletedLoan}
              />
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <Label htmlFor="amount">Payment Amount (UGX) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
                min="0"
                step="1"
                required
                disabled={hasCompletedLoan}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Payment Notes</Label>
            <Textarea
              id="notes"
              placeholder="e.g., Daily payment, Partial payment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 resize-none"
              rows={3}
              disabled={hasCompletedLoan}
            />
          </div>

          {/* Payment Summary */}
          {amountNum > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Payment Amount:</span>
                  <span className="font-semibold text-green-600">{formatUGX(amountNum)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">New Total Paid:</span>
                  <span className="font-semibold text-gray-900">{formatUGX(newTotalPaid)}</span>
                </div>
                <div className="border-t border-green-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Remaining Balance:</span>
                    <span className="text-lg font-bold text-orange-600">{formatUGX(newBalance)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={hasCompletedLoan}
            >
              {hasCompletedLoan ? 'Loan Completed ✓' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}