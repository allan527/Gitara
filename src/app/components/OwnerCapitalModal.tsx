import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { PlusCircle, MinusCircle, Crown, User, Phone, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface OwnerCapitalModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: 'Capital Injection' | 'Owner Withdrawal';
    amount: number;
    description: string;
  }) => void;
  ownerCapitalTransactions?: any[]; // Pass transactions to calculate totals
}

export function OwnerCapitalModal({ open, onClose, onSubmit, ownerCapitalTransactions = [] }: OwnerCapitalModalProps) {
  const [transactionType, setTransactionType] = useState<'Capital Injection' | 'Owner Withdrawal'>('Capital Injection');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Owner details - hardcoded
  const OWNER_NAME = 'GITALA BRANCH';
  const OWNER_PHONE = '+256709907775';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountValue = parseInt(amount.replace(/,/g, ''));
    if (isNaN(amountValue) || amountValue <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // 🚫 DUPLICATE DETECTION: Check if same amount & type exists today
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    const duplicateExists = ownerCapitalTransactions.some((transaction) => {
      // Get transaction date (it might be stored as 'date' or 'createdAt')
      const transactionDate = transaction.date || transaction.createdAt || '';
      const transactionDateOnly = transactionDate.split('T')[0]; // Extract YYYY-MM-DD
      
      return (
        transactionDateOnly === today &&
        transaction.type === transactionType &&
        transaction.amount === amountValue
      );
    });

    if (duplicateExists) {
      alert(`⚠️ DUPLICATE DETECTED!\n\nYou already recorded a ${transactionType} of UGX ${amountValue.toLocaleString()} today.\n\nPlease check your records to avoid duplicate entries.`);
      return;
    }

    onSubmit({
      type: transactionType,
      amount: amountValue,
      description: description || (transactionType === 'Capital Injection' ? 'Owner capital injection' : 'Owner withdrawal'),
    });

    // Reset form
    setAmount('');
    setDescription('');
    setTransactionType('Capital Injection');
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value ? parseInt(value).toLocaleString() : '');
    }
  };

  // Calculate totals
  const totalCapitalInjection = ownerCapitalTransactions
    .filter((transaction) => transaction.type === 'Capital Injection')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalOwnerWithdrawal = ownerCapitalTransactions
    .filter((transaction) => transaction.type === 'Owner Withdrawal')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const netCapital = totalCapitalInjection - totalOwnerWithdrawal;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Owner Capital Transaction</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">Record capital injection or withdrawal by GITALA BRANCH</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Owner Info Card */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-700" />
                  <p className="font-bold text-amber-900">{OWNER_NAME}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <p className="text-sm text-amber-700">{OWNER_PHONE}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Business Owner</p>
              </div>
            </div>
          </div>

          {/* 💰 CAPITAL SUMMARY SECTION - Prominent Display */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-900 text-lg">Capital Summary</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {/* Total Added */}
              <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <p className="text-xs font-medium text-gray-600">Added</p>
                </div>
                <p className="text-lg font-bold text-green-700">
                  {totalCapitalInjection.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">UGX</p>
              </div>

              {/* Total Withdrawn */}
              <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <p className="text-xs font-medium text-gray-600">Withdrawn</p>
                </div>
                <p className="text-lg font-bold text-red-700">
                  {totalOwnerWithdrawal.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">UGX</p>
              </div>

              {/* Net Capital */}
              <div className={`bg-white/80 backdrop-blur rounded-lg p-3 border-2 ${
                netCapital >= 0 ? 'border-blue-300 bg-blue-50/50' : 'border-orange-300 bg-orange-50/50'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className={`w-4 h-4 ${netCapital >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                  <p className="text-xs font-bold text-gray-700 uppercase">Net Total</p>
                </div>
                <p className={`text-xl font-bold ${
                  netCapital >= 0 ? 'text-blue-700' : 'text-orange-700'
                }`}>
                  {netCapital.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">UGX in business</p>
              </div>
            </div>
          </div>

          {/* Transaction Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Transaction Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTransactionType('Capital Injection')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  transactionType === 'Capital Injection'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <PlusCircle className={`w-6 h-6 mx-auto mb-2 ${
                  transactionType === 'Capital Injection' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-semibold ${
                  transactionType === 'Capital Injection' ? 'text-green-900' : 'text-gray-600'
                }`}>
                  Add Money
                </p>
                <p className="text-xs text-gray-500 mt-1">Capital Injection</p>
              </button>

              <button
                type="button"
                onClick={() => setTransactionType('Owner Withdrawal')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  transactionType === 'Owner Withdrawal'
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-red-300'
                }`}
              >
                <MinusCircle className={`w-6 h-6 mx-auto mb-2 ${
                  transactionType === 'Owner Withdrawal' ? 'text-red-600' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-semibold ${
                  transactionType === 'Owner Withdrawal' ? 'text-red-900' : 'text-gray-600'
                }`}>
                  Remove Money
                </p>
                <p className="text-xs text-gray-500 mt-1">Owner Withdrawal</p>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-semibold">
              Amount (UGX) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0"
              required
              className="text-lg font-semibold"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`e.g., ${transactionType === 'Capital Injection' ? 'Additional capital for loan disbursement' : 'Personal withdrawal'}`}
              rows={3}
            />
          </div>

          {/* Summary */}
          <div className={`p-4 rounded-lg ${
            transactionType === 'Capital Injection' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className="text-sm text-gray-600 mb-1">Transaction Summary</p>
            <p className={`text-xl font-bold ${
              transactionType === 'Capital Injection' ? 'text-green-700' : 'text-red-700'
            }`}>
              {transactionType === 'Capital Injection' ? '+' : '-'} UGX {amount || '0'}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {transactionType === 'Capital Injection' 
                ? 'This will increase business cash available' 
                : 'This will decrease business cash available'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
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
              className={`flex-1 ${
                transactionType === 'Capital Injection'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Record Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}