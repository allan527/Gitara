import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { formatUGX, Transaction } from '../data/mockData';
import { DollarSign, Calendar, AlertTriangle } from 'lucide-react';

interface EditPaymentModalProps {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onEditPayment: (transactionId: string, updatedData: {
    amount: number;
    notes: string;
    date: string;
  }) => void;
  currentUser?: string | null;
}

export function EditPaymentModal({ 
  open, 
  onClose, 
  transaction,
  onEditPayment,
  currentUser 
}: EditPaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setNotes(transaction.notes);
      setPaymentDate(transaction.date);
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentAmount = parseFloat(amount);
    
    if (paymentAmount <= 0) {
      return;
    }

    onEditPayment(transaction.id, {
      amount: paymentAmount,
      notes,
      date: paymentDate,
    });
    
    onClose();
  };

  const originalAmount = transaction.amount;
  const newAmount = parseFloat(amount) || 0;
  const difference = newAmount - originalAmount;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Payment</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Modify payment details for {transaction.clientName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Warning Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-900">Editing Payment Record</p>
              <p className="text-xs text-yellow-700 mt-1">
                This will update the client's balance and cashbook entries.
              </p>
            </div>
          </div>

          {/* Original Transaction Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Client:</span>
                <span className="font-semibold text-gray-900">{transaction.clientName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Original Amount:</span>
                <span className="font-semibold text-gray-900">{formatUGX(originalAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Recorded By:</span>
                <span className="font-semibold text-gray-900">{transaction.recordedBy || 'N/A'}</span>
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
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Payment Notes</Label>
            <Textarea
              id="notes"
              placeholder="e.g., Daily payment, Corrected amount"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 resize-none"
              rows={3}
            />
          </div>

          {/* Change Summary */}
          {difference !== 0 && (
            <div className={`border rounded-lg p-4 ${
              difference > 0 
                ? 'bg-orange-50 border-orange-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                difference > 0 ? 'text-orange-900' : 'text-blue-900'
              }`}>
                Balance Adjustment
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Original Amount:</span>
                  <span className="font-medium text-gray-900">{formatUGX(originalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">New Amount:</span>
                  <span className="font-medium text-gray-900">{formatUGX(newAmount)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Difference:</span>
                    <span className={`text-lg font-bold ${
                      difference > 0 ? 'text-orange-600' : 'text-blue-600'
                    }`}>
                      {difference > 0 ? '+' : ''}{formatUGX(difference)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {difference > 0 
                      ? 'Client balance will decrease (more paid)'
                      : 'Client balance will increase (less paid)'}
                  </p>
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}