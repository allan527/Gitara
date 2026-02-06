import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { formatUGX } from '../data/mockData';
import { TrendingDown, Calendar, FileText } from 'lucide-react';

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onAddExpense: (expense: {
    description: string;
    amount: number;
    date: string;
    time: string;
  }) => void;
}

export function AddExpenseModal({ 
  open, 
  onClose, 
  onAddExpense 
}: AddExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expenseAmount = parseFloat(amount);
    
    if (expenseAmount <= 0 || !description.trim()) {
      return;
    }

    // Get current time in HH:MM format
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);

    onAddExpense({
      description: description.trim(),
      amount: expenseAmount,
      date: expenseDate,
      time,
    });
    
    // Reset form
    setDescription('');
    setAmount('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  const amountNum = parseFloat(amount) || 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-red-600" />
            Add Expense
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Record a business expense or cost
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Expense Date */}
          <div>
            <Label htmlFor="expenseDate">Expense Date *</Label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="expenseDate"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="pl-10"
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <div className="relative mt-1">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Textarea
                id="description"
                placeholder="e.g., Office rent, Transport, Utilities, Staff salary"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="pl-10 resize-none"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount">Expense Amount (UGX) *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter expense amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
              min="0"
              step="1"
              required
            />
          </div>

          {/* Expense Preview */}
          {amountNum > 0 && description && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-3">Expense Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-gray-700">Description:</span>
                  <span className="font-medium text-gray-900 text-right">{description}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Date:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(expenseDate).toLocaleDateString('en-UG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="border-t border-red-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Amount:</span>
                    <span className="text-xl font-bold text-red-600">{formatUGX(amountNum)}</span>
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
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Add Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}