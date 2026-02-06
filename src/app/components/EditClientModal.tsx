import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { formatUGX, normalizePhoneNumber, validatePhoneNumber, attemptPhoneCorrection } from '../data/mockData';
import { Calculator, User, Shield } from 'lucide-react';
import { Client } from '../data/mockData';

interface EditClientModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (client: Client) => void;
  client: Client | null;
}

export function EditClientModal({ open, onClose, onUpdate, client }: EditClientModalProps) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorId, setGuarantorId] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [guarantorLocation, setGuarantorLocation] = useState('');
  const [validationError, setValidationError] = useState('');

  // 🆕 AUTO-CORRECTION SUGGESTIONS
  const clientPhoneCorrection = attemptPhoneCorrection(phoneNumber);
  const guarantorPhoneCorrection = guarantorPhone ? attemptPhoneCorrection(guarantorPhone) : null;

  // Populate form when client changes
  useEffect(() => {
    if (client) {
      setFullName(client.fullName);
      setPhoneNumber(client.phoneNumber);
      setAddress(client.address);
      setLoanAmount(client.loanAmount.toString());
      setGuarantorName(client.guarantorName || '');
      setGuarantorId(client.guarantorId || '');
      setGuarantorPhone(client.guarantorPhone || '');
      setGuarantorLocation(client.guarantorLocation || '');
    }
  }, [client]);

  // Calculate loan details (20% monthly interest, 30 days repayment)
  const loanAmountNum = parseFloat(loanAmount) || 0;
  const interest = loanAmountNum * 0.20;
  const totalPayable = loanAmountNum + interest;
  const dailyPayment = totalPayable / 30;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!client) return;

    // 🆕 VALIDATE PHONE NUMBERS BEFORE SUBMITTING
    setValidationError(''); // Clear previous errors
    
    const clientPhoneValidation = validatePhoneNumber(phoneNumber);
    if (!clientPhoneValidation.valid) {
      setValidationError(`❌ Client ${clientPhoneValidation.error}`);
      return;
    }
    
    // Validate guarantor phone if provided
    if (guarantorPhone) {
      const guarantorPhoneValidation = validatePhoneNumber(guarantorPhone);
      if (!guarantorPhoneValidation.valid) {
        setValidationError(`❌ Guarantor ${guarantorPhoneValidation.error}`);
        return;
      }
    }

    // Calculate the difference between new and old loan amount
    const oldTotalPayable = client.totalPayable;
    const newTotalPayable = totalPayable;
    const payableDifference = newTotalPayable - oldTotalPayable;
    
    // Update outstanding balance based on the difference
    const newOutstandingBalance = client.outstandingBalance + payableDifference;

    const updatedClient: Client = {
      ...client,
      fullName,
      phoneNumber: normalizePhoneNumber(phoneNumber), // Normalize before saving
      address,
      loanAmount: loanAmountNum,
      outstandingBalance: newOutstandingBalance,
      dailyPayment,
      totalPayable,
      guarantorName: guarantorName || undefined,
      guarantorId: guarantorId || undefined,
      guarantorPhone: guarantorPhone ? normalizePhoneNumber(guarantorPhone) : undefined, // Normalize before saving
      guarantorLocation: guarantorLocation || undefined,
    };

    onUpdate(updatedClient);
    onClose();
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Client</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Update the client's details and loan information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 🆕 VALIDATION ERROR DISPLAY */}
          {validationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">{validationError}</p>
            </div>
          )}
          
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
                onChange={(e) => setPhoneNumber(normalizePhoneNumber(e.target.value))}
                className="mt-1"
                required
              />
              {/* 🆕 AUTO-CORRECTION SUGGESTION */}
              {clientPhoneCorrection && !validatePhoneNumber(phoneNumber).valid && (
                <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 mb-2">
                    💡 {clientPhoneCorrection.suggestion}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setPhoneNumber(clientPhoneCorrection.corrected)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                  >
                    Apply This Suggestion
                  </Button>
                </div>
              )}
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
            <p className="text-xs text-gray-500 mt-1">
              Note: Changing the loan amount will adjust the outstanding balance accordingly.
            </p>
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

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
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
                <Label htmlFor="guarantorId">Guarantor ID Number</Label>
                <Input
                  id="guarantorId"
                  type="text"
                  placeholder="e.g., CM1234567890"
                  value={guarantorId}
                  onChange={(e) => setGuarantorId(e.target.value)}
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
                  onChange={(e) => setGuarantorPhone(normalizePhoneNumber(e.target.value))}
                  className="mt-1"
                />
                {/* 🆕 AUTO-CORRECTION SUGGESTION */}
                {guarantorPhoneCorrection && (
                  <p className="text-sm text-gray-500 mt-1">
                    Did you mean: <span className="font-medium">{guarantorPhoneCorrection}</span>?
                  </p>
                )}
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
              Update Client
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}