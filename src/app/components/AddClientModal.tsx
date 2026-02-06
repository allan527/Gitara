import { useState } from 'react';
import { Client } from '../data/mockData';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { formatUGX, normalizePhoneNumber, validatePhoneNumber } from '../data/mockData';
import { Calculator, Shield, AlertTriangle } from 'lucide-react';

interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (client: any) => void;
  currentUser?: string | null;
  existingClients?: any[];
}

export function AddClientModal({ open, onClose, onAdd, currentUser, existingClients = [] }: AddClientModalProps) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [clientNIN, setClientNIN] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorNIN, setGuarantorNIN] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [guarantorLocation, setGuarantorLocation] = useState('');
  const [duplicateError, setDuplicateError] = useState('');

  // Calculate loan details (20% monthly interest, 30 days repayment)
  const loanAmountNum = parseFloat(loanAmount) || 0;
  const interest = loanAmountNum * 0.20;
  const totalPayable = loanAmountNum + interest;
  const dailyPayment = totalPayable / 30;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🆕 VALIDATE PHONE NUMBERS BEFORE SUBMITTING
    const clientPhoneValidation = validatePhoneNumber(phoneNumber);
    if (!clientPhoneValidation.valid) {
      setDuplicateError(`❌ Client ${clientPhoneValidation.error}`);
      return;
    }
    
    // Validate guarantor phone if provided
    if (guarantorPhone) {
      const guarantorPhoneValidation = validatePhoneNumber(guarantorPhone);
      if (!guarantorPhoneValidation.valid) {
        setDuplicateError(`❌ Guarantor ${guarantorPhoneValidation.error}`);
        return;
      }
    }
    
    // Check for duplicates by NIN or phone number
    const duplicateByNIN = existingClients.find(client => 
      client.clientNIN && clientNIN && client.clientNIN.toLowerCase() === clientNIN.toLowerCase()
    );
    
    const duplicateByPhone = existingClients.find(client => 
      client.phoneNumber && phoneNumber && 
      normalizePhoneNumber(client.phoneNumber) === normalizePhoneNumber(phoneNumber)
    );
    
    if (duplicateByNIN) {
      setDuplicateError(`A client with NIN "${clientNIN}" already exists: ${duplicateByNIN.fullName}. If this client needs a new loan, please use the "Issue New Loan" option instead.`);
      return;
    }
    
    if (duplicateByPhone) {
      setDuplicateError(`A client with phone number "${phoneNumber}" already exists: ${duplicateByPhone.fullName}. If this client needs a new loan, please use the "Issue New Loan" option instead.`);
      return;
    }
    
    // Clear any previous errors
    setDuplicateError('');
    
    const newClient = {
      id: Date.now().toString(),
      fullName,
      phoneNumber,
      address,
      clientNIN,
      loanAmount: loanAmountNum,
      outstandingBalance: totalPayable,
      totalPaid: 0,
      status: 'Active' as const,
      startDate: new Date().toISOString().split('T')[0],
      dailyPayment,
      totalPayable,
      guarantorName: guarantorName || undefined,
      guarantorNIN: guarantorNIN || undefined,
      guarantorPhone: guarantorPhone || undefined,
      guarantorLocation: guarantorLocation || undefined,
      createdBy: currentUser || 'Unknown',
      loanIssuedBy: currentUser || 'Unknown', // Same person who creates client also issues the loan
    };

    onAdd(newClient);
    
    // Reset form
    setFullName('');
    setPhoneNumber('');
    setAddress('');
    setClientNIN('');
    setLoanAmount('');
    setGuarantorName('');
    setGuarantorNIN('');
    setGuarantorPhone('');
    setGuarantorLocation('');
    setDuplicateError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Client</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Enter the client's details and loan amount to add a new client.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="e.g., Namukasa Sarah"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="e.g., +256 700 123456"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              type="text"
              placeholder="e.g., Kampala, Central Division"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="clientNIN">Client NIN *</Label>
            <Input
              id="clientNIN"
              type="text"
              placeholder="e.g., CM1234567890"
              value={clientNIN}
              onChange={(e) => setClientNIN(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="loanAmount">Loan Amount (UGX) *</Label>
            <Input
              id="loanAmount"
              type="number"
              placeholder="e.g., 500000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="mt-1"
              min="0"
              step="100"
              required
            />
          </div>

          {/* Loan Calculation Display */}
          {loanAmountNum > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Automatic Calculation</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Principal Amount:</span>
                  <span className="font-semibold text-gray-900">{formatUGX(loanAmountNum)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Interest (20% monthly):</span>
                  <span className="font-semibold text-gray-900">{formatUGX(interest)}</span>
                </div>
                
                <div className="border-t border-blue-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Payable:</span>
                    <span className="text-xl font-bold text-blue-600">{formatUGX(totalPayable)}</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Daily Payment (30 days):</span>
                    <span className="text-lg font-bold text-green-600">{formatUGX(dailyPayment)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mt-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Guarantor Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guarantorName">Guarantor Name</Label>
                <Input
                  id="guarantorName"
                  type="text"
                  placeholder="e.g., Okello James"
                  value={guarantorName}
                  onChange={(e) => setGuarantorName(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="guarantorNIN">Guarantor NIN Number</Label>
                <Input
                  id="guarantorNIN"
                  type="text"
                  placeholder="e.g., CM1234567890"
                  value={guarantorNIN}
                  onChange={(e) => setGuarantorNIN(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="guarantorPhone">Guarantor Phone</Label>
                <Input
                  id="guarantorPhone"
                  type="tel"
                  placeholder="e.g., +256 700 123456"
                  value={guarantorPhone}
                  onChange={(e) => setGuarantorPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="guarantorLocation">Guarantor Location</Label>
                <Input
                  id="guarantorLocation"
                  type="text"
                  placeholder="e.g., Kampala, Central Division"
                  value={guarantorLocation}
                  onChange={(e) => setGuarantorLocation(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {duplicateError && (
            <div className="text-red-500 text-sm mt-2">
              <AlertTriangle className="w-4 h-4 inline-block mr-1" />
              {duplicateError}
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
              Add Client
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}