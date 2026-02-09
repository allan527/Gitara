import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { formatUGX } from '../data/mockData';
import { Printer, Download } from 'lucide-react';
import jsPDF from 'jspdf';

interface PaymentReceiptModalProps {
  open: boolean;
  onClose: () => void;
  receiptData: {
    clientName: string;
    date: string;
    amountPaid: number;
    outstandingBalance: number;
    issuedBy: string;
  };
}

export function PaymentReceiptModal({ open, onClose, receiptData }: PaymentReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('GITALA BRANCH', 105, 25, { align: 'center' });
    
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
    doc.text(receiptData.date, 70, 75);
    
    // Client Name
    doc.setFont(undefined, 'bold');
    doc.text('Client Name:', 25, 90);
    doc.setFont(undefined, 'normal');
    doc.text(receiptData.clientName, 70, 90);
    
    // Amount Paid (Highlighted)
    doc.setFont(undefined, 'bold');
    doc.text('Amount Paid:', 25, 105);
    doc.setFontSize(16);
    doc.setTextColor(0, 128, 0); // Green color for amount
    doc.text(formatUGX(receiptData.amountPaid), 70, 105);
    
    // Outstanding Balance
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Outstanding Balance:', 25, 120);
    doc.setFontSize(14);
    doc.setTextColor(255, 69, 0); // Orange-red for balance
    doc.text(formatUGX(receiptData.outstandingBalance), 70, 120);
    
    // Issued By
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Issued By:', 25, 135);
    doc.setFont(undefined, 'normal');
    doc.text(receiptData.issuedBy, 70, 135);
    
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
    const filename = `Receipt_${receiptData.clientName.replace(/\s+/g, '_')}_${receiptData.date.replace(/\//g, '-')}.pdf`;
    doc.save(filename);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Payment Receipt</DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Receipt for payment recorded
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Receipt Content */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="text-center pb-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">GITALA BRANCH</h3>
              <p className="text-sm text-gray-600">Uganda</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Date:</span>
                <span className="text-sm text-gray-900">{receiptData.date}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Client Name:</span>
                <span className="text-sm text-gray-900">{receiptData.clientName}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-semibold text-gray-700">Amount Paid:</span>
                <span className="text-lg font-bold text-green-600">{formatUGX(receiptData.amountPaid)}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-sm font-semibold text-gray-700">Outstanding Balance:</span>
                <span className="text-lg font-bold text-orange-600">{formatUGX(receiptData.outstandingBalance)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Issued By:</span>
                <span className="text-sm text-gray-900">{receiptData.issuedBy}</span>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 italic">Thank you for your payment!</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handlePrint}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              onClick={handleDownloadPDF}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}