import { ArrowLeft, Phone, MapPin, Calendar, DollarSign, TrendingUp, User, Clock, Plus, FileText, Shield, CreditCard, Briefcase, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import { Client, Transaction, formatUGX } from '../data/mockData';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Footer } from '@/app/components/Footer';
import jsPDF from 'jspdf';

interface ClientDetailProps {
  client: Client;
  transactions: Transaction[];
  onBack: () => void;
  onRecordPayment: () => void;
  onIssueNewLoan?: () => void;
  currentUser?: string | null;
  onEditPayment?: (transaction: Transaction) => void;
  onDeletePayment?: (transactionId: string) => void;
}

export function ClientDetail({ 
  client, 
  transactions, 
  onBack, 
  onRecordPayment,
  onIssueNewLoan, 
  currentUser,
  onEditPayment,
  onDeletePayment 
}: ClientDetailProps) {
  const repaymentProgress = ((client.totalPaid / client.totalPayable) * 100).toFixed(1);
  
  // Check if current user is the owner
  const isOwner = currentUser === 'william@boss.com';

  // Check if loan is completed
  const isLoanCompleted = client.outstandingBalance <= 0;

  // Filter transactions for this client
  const clientTransactions = transactions.filter(t => t.clientId === client.id);

  const printReceipt = () => {
    const doc = new jsPDF();
    
    // Get the most recent payment details
    const latestTransaction = clientTransactions[0]; // Assuming transactions are sorted by date
    const paymentDate = latestTransaction ? latestTransaction.date : new Date().toLocaleDateString('en-UG');
    const amountPaid = latestTransaction ? latestTransaction.amount : 0;
    
    // Header
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('TEXAS FINANCE', 105, 25, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Personal Loan Management - Uganda', 105, 33, { align: 'center' });
    
    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);
    
    // Receipt Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('PAYMENT RECEIPT', 105, 52, { align: 'center' });
    
    // Line separator
    doc.line(20, 58, 190, 58);
    
    // Receipt Details - Simple and Clean
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    
    // Date
    doc.setFont(undefined, 'bold');
    doc.text('Date:', 25, 75);
    doc.setFont(undefined, 'normal');
    doc.text(paymentDate, 70, 75);
    
    // Client Name
    doc.setFont(undefined, 'bold');
    doc.text('Client Name:', 25, 90);
    doc.setFont(undefined, 'normal');
    doc.text(client.fullName, 70, 90);
    
    // Amount Paid (Highlighted)
    doc.setFont(undefined, 'bold');
    doc.text('Amount Paid:', 25, 105);
    doc.setFontSize(16);
    doc.setTextColor(0, 128, 0); // Green color for amount
    doc.text(formatUGX(amountPaid), 70, 105);
    
    // Outstanding Balance
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Outstanding Balance:', 25, 120);
    doc.setFontSize(14);
    doc.setTextColor(255, 69, 0); // Orange-red for balance
    doc.text(formatUGX(client.outstandingBalance), 70, 120);
    
    // Issued By
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Issued By:', 25, 135);
    doc.setFont(undefined, 'normal');
    doc.text(currentUser || 'System', 70, 135);
    
    // Footer line
    doc.setLineWidth(0.5);
    doc.line(20, 150, 190, 150);
    
    // Footer text
    doc.setFontSize(10);
    doc.setFont(undefined, 'italic');
    doc.text('Thank you for your payment!', 105, 160, { align: 'center' });
    doc.setFontSize(8);
    doc.text('Keep this receipt for your records', 105, 167, { align: 'center' });
    
    // Save the PDF
    const filename = `Receipt_${client.fullName.replace(/\s+/g, '_')}_${paymentDate.replace(/\//g, '-')}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={onBack}
        className="mb-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Clients
      </Button>

      {/* Loan Completed Banner */}
      {isLoanCompleted && onIssueNewLoan && (
        <Card className="p-5 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-xl shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-900 mb-1">🎉 Loan Fully Paid!</h3>
                <p className="text-sm text-green-800">
                  {client.fullName} has successfully completed their loan of {formatUGX(client.loanAmount)}. 
                  Ready for another loan? Click below to issue a new one.
                </p>
              </div>
            </div>
            <Button
              onClick={onIssueNewLoan}
              className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap flex-shrink-0"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Issue New Loan
            </Button>
          </div>
        </Card>
      )}

      {/* Client Summary Card */}
      <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{client.fullName}</h1>
                {isLoanCompleted ? (
                  <Badge className="bg-green-100 text-green-700 border-green-300 hover:bg-green-100 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Loan Completed
                  </Badge>
                ) : (
                  <Badge
                    className={
                      client.status === 'Active'
                        ? 'bg-green-100 text-green-700 hover:bg-green-100'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                    }
                  >
                    {client.status}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600">Client ID: {client.id}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium text-gray-900">{client.phoneNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">{client.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium text-gray-900">{client.startDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Daily Payment</p>
                  <p className="font-medium text-gray-900">{formatUGX(client.dailyPayment)}</p>
                </div>
              </div>
            </div>

            {/* User Tracking Information */}
            {(client.createdBy || client.loanIssuedBy) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Loan Tracking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {client.createdBy && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-xs text-gray-500">Client Added By</p>
                        <p className="text-sm font-medium text-gray-900">{client.createdBy}</p>
                      </div>
                    </div>
                  )}
                  {client.loanIssuedBy && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-xs text-gray-500">Loan Issued By</p>
                        <p className="text-sm font-medium text-gray-900">{client.loanIssuedBy}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Loan Amount</p>
          <p className="text-2xl font-bold text-gray-900">{formatUGX(client.loanAmount)}</p>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Payable</p>
          <p className="text-2xl font-bold text-blue-600">{formatUGX(client.totalPayable)}</p>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">{formatUGX(client.totalPaid)}</p>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Remaining Balance</p>
          <p className="text-2xl font-bold text-orange-600">{formatUGX(client.outstandingBalance)}</p>
        </Card>
      </div>

      {/* Repayment Progress */}
      <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Repayment Progress</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Progress</span>
            <span className="text-2xl font-bold text-blue-600">{repaymentProgress}%</span>
          </div>
          <Progress value={parseFloat(repaymentProgress)} className="h-3" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Paid: {formatUGX(client.totalPaid)}</span>
            <span>Target: {formatUGX(client.totalPayable)}</span>
          </div>
        </div>
      </Card>

      {/* Guarantor Information */}
      {(client.guarantorName || client.guarantorId || client.guarantorPhone || client.guarantorLocation) && (
        <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Guarantor Information</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {client.guarantorName && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{client.guarantorName}</p>
                </div>
              </div>
            )}
            
            {client.guarantorId && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">ID Number</p>
                  <p className="font-medium text-gray-900">{client.guarantorId}</p>
                </div>
              </div>
            )}
            
            {client.guarantorPhone && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium text-gray-900">{client.guarantorPhone}</p>
                </div>
              </div>
            )}
            
            {client.guarantorLocation && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">{client.guarantorLocation}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Transaction History */}
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
              <p className="text-sm text-gray-600 mt-1">All payment records for this client</p>
            </div>
            <Button
              onClick={onRecordPayment}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
            <Button
              onClick={printReceipt}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Time</TableHead>
                <TableHead className="font-semibold text-right">Amount Paid</TableHead>
                <TableHead className="font-semibold">Notes</TableHead>
                <TableHead className="font-semibold">Recorded By</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                {isOwner && (
                  <TableHead className="font-semibold">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    No transactions yet
                  </TableCell>
                </TableRow>
              ) : (
                clientTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{transaction.date}</TableCell>
                    <TableCell className="text-gray-600">{transaction.time}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatUGX(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {/* 🆕 Show loan number badge if this is a repeat loan */}
                      {transaction.loanNumber && transaction.loanNumber > 1 && (
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 mr-2">
                          Loan #{transaction.loanNumber}
                        </Badge>
                      )}
                      {transaction.isNewLoan && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mr-2">
                          🎯 NEW LOAN
                        </Badge>
                      )}
                      {transaction.notes}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {transaction.recordedBy || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    {isOwner && (
                      <TableCell className="flex items-center gap-2">
                        <Edit
                          className="w-4 h-4 text-blue-600 cursor-pointer"
                          onClick={() => onEditPayment && onEditPayment(transaction)}
                        />
                        <Trash2
                          className="w-4 h-4 text-red-600 cursor-pointer"
                          onClick={() => onDeletePayment && onDeletePayment(transaction.id)}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      <Footer />
    </div>
  );
}