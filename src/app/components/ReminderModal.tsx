import { useState } from 'react';
import { X, Send, Bell, Clock } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
import { Client, formatUGX } from '../data/mockData';
import { smsApi } from '@/services/localApi';

interface ReminderModalProps {
  client: Client;
  onClose: () => void;
}

export function ReminderModal({ client, onClose }: ReminderModalProps) {
  const [sending, setSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'payment' | 'overdue' | 'custom'>('payment');
  const [customMessage, setCustomMessage] = useState('');

  // Calculate days until deadline
  const startDate = new Date(client.startDate);
  const deadline = new Date(startDate);
  deadline.setDate(deadline.getDate() + 30);
  const today = new Date();
  const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Template messages
  const templates = {
    payment: `Dear ${client.fullName},

📋 PAYMENT REMINDER - GITALA BRANCH

Outstanding Balance: ${formatUGX(client.outstandingBalance)}
Daily Payment: ${formatUGX(client.dailyPayment)}
Deadline: ${formatDate(deadline)}
${isOverdue ? '⚠️ Your payment is OVERDUE!' : `⏰ ${daysRemaining} days remaining`}

Please make your payment today.
Thank you!
Call: +256709907775`,

    overdue: `URGENT REMINDER - ${client.fullName}

⚠️ Your loan payment is OVERDUE!

Outstanding Balance: ${formatUGX(client.outstandingBalance)}
Deadline: ${formatDate(deadline)} (${Math.abs(daysRemaining)} days ago)

Please contact us immediately to avoid penalties.

GITALA BRANCH
Call: +256709907775`,

    custom: customMessage,
  };

  const handleSendReminder = async () => {
    try {
      setSending(true);

      const message = selectedTemplate === 'custom' ? customMessage : templates[selectedTemplate];

      if (!message.trim()) {
        toast.error('Please enter a message');
        return;
      }

      // Send SMS
      const response = await smsApi.send({
        recipients: [client.phoneNumber],
        message,
        type: 'reminder',
        clientIds: [client.id],
      });

      console.log('📱 Reminder SMS sent:', response);
      
      toast.success(`✅ Reminder sent to ${client.fullName}!`, {
        duration: 5000,
      });

      onClose();
    } catch (error: any) {
      console.error('Error sending reminder:', error);
      const errorMessage = error?.message || 'Failed to send reminder';
      
      // Provide user-friendly error messages
      if (errorMessage.includes('Invalid phone number')) {
        toast.error(`❌ Invalid phone number: ${client.phoneNumber}\n\nPlease update the client's phone number to send SMS.`, {
          duration: 8000,
        });
      } else if (errorMessage.includes('InsufficientBalance')) {
        toast.error('⚠️ Insufficient SMS balance. Please top up your Africa\'s Talking account.', {
          duration: 8000,
        });
      } else if (errorMessage.includes('credentials not configured')) {
        toast.error('⚠️ Africa\'s Talking credentials not configured.', {
          duration: 8000,
        });
      } else {
        toast.error(`Failed to send reminder: ${errorMessage}`, {
          duration: 7000,
        });
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Send Reminder</h2>
              <p className="text-sm text-gray-600">{client.fullName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Client Info Summary */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Outstanding Balance</p>
                <p className="text-xl font-bold text-orange-700">{formatUGX(client.outstandingBalance)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Deadline Status</p>
                <p className={`text-xl font-bold ${isOverdue ? 'text-red-700' : 'text-green-700'}`}>
                  {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                </p>
              </div>
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Message Template
            </label>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setSelectedTemplate('payment')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedTemplate === 'payment'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-900">Payment Reminder</span>
                </div>
                <p className="text-sm text-gray-600">Friendly reminder about upcoming payment</p>
              </button>

              <button
                onClick={() => setSelectedTemplate('overdue')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedTemplate === 'overdue'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-4 h-4 text-red-600" />
                  <span className="font-semibold text-gray-900">Overdue Notice</span>
                </div>
                <p className="text-sm text-gray-600">Urgent reminder for overdue payments</p>
              </button>

              <button
                onClick={() => setSelectedTemplate('custom')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedTemplate === 'custom'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Send className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-gray-900">Custom Message</span>
                </div>
                <p className="text-sm text-gray-600">Write your own custom message</p>
              </button>
            </div>
          </div>

          {/* Message Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Preview
            </label>
            {selectedTemplate === 'custom' ? (
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter your custom message here..."
                className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 whitespace-pre-wrap font-mono text-sm">
                {templates[selectedTemplate]}
              </div>
            )}
          </div>

          {/* Recipient Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-800">
              📱 <strong>Sending to:</strong> {client.phoneNumber}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendReminder}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={sending || (selectedTemplate === 'custom' && !customMessage.trim())}
          >
            {sending ? (
              <>
                <Send className="w-4 h-4 mr-2 animate-pulse" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Reminder
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
