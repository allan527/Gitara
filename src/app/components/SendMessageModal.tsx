import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Client, formatUGX } from '../data/mockData';
import { MessageSquare, Users, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { smsApi } from '../../services/localApi';

interface SendMessageModalProps {
  open: boolean;
  onClose: () => void;
  clients: Client[];
  selectedClients?: Client[];
}

const MESSAGE_TEMPLATES = {
  payment_reminder: {
    name: 'Payment Reminder',
    template: (client: Client) => 
      `Hello ${client.fullName}, this is a friendly reminder about your loan payment. Outstanding balance: ${formatUGX(client.balance)}. Daily payment: ${formatUGX(client.dailyPayment)}. Thank you - GITARA BRANCH`,
  },
  overdue_alert: {
    name: 'Overdue Alert',
    template: (client: Client) => 
      `Dear ${client.fullName}, your payment is overdue. Please make a payment of ${formatUGX(client.dailyPayment)} to avoid penalties. Outstanding: ${formatUGX(client.balance)}. Contact us if you need assistance. - GITARA BRANCH`,
  },
  thank_you: {
    name: 'Thank You Message',
    template: (client: Client) => 
      `Thank you ${client.fullName} for your recent payment! Your outstanding balance is now ${formatUGX(client.balance)}. We appreciate your commitment. - GITARA BRANCH`,
  },
  loan_approved: {
    name: 'Loan Approved',
    template: (client: Client) => 
      `Congratulations ${client.fullName}! Your loan of ${formatUGX(client.loanAmount)} has been approved. Total payable: ${formatUGX(client.totalPayable)}. Daily payment: ${formatUGX(client.dailyPayment)} over 30 days. - GITARA BRANCH`,
  },
};

export function SendMessageModal({ 
  open, 
  onClose, 
  clients,
  selectedClients = []
}: SendMessageModalProps) {
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ success: boolean; message: string } | null>(null);

  const recipientClients = selectedClients.length > 0 ? selectedClients : [];

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    
    if (recipientClients.length === 1) {
      // Single recipient: personalize the message
      const template = MESSAGE_TEMPLATES[templateKey as keyof typeof MESSAGE_TEMPLATES];
      setMessage(template.template(recipientClients[0]));
    } else {
      // Multiple recipients: use generic message
      const template = MESSAGE_TEMPLATES[templateKey as keyof typeof MESSAGE_TEMPLATES];
      const sampleClient = recipientClients[0] || clients[0];
      setMessage(template.template(sampleClient).replace(sampleClient.fullName, '[Client Name]'));
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || recipientClients.length === 0) {
      return;
    }

    setIsSending(true);
    setSendStatus(null);

    try {
      // Prepare recipients
      const recipients = recipientClients.map(client => client.phoneNumber);
      const clientIds = recipientClients.map(client => client.id);

      // Send via local API (saves to history, doesn't actually send)
      const result = await smsApi.send({
        recipients,
        message: message.trim(),
        type: selectedTemplate || 'custom',
        clientIds,
      });

      // Always show success since local API saves to history
      setSendStatus({
        success: true,
        message: `Messages saved to history (${recipients.length} recipients). Note: SMS not actually sent - backend SMS service not configured.`,
      });
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setMessage('');
        setSelectedTemplate('');
        setSendStatus(null);
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error sending messages:', error);
      setSendStatus({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Failed to send messages'}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  const charCount = message.length;
  const smsCount = Math.ceil(charCount / 160);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Send SMS Message
          </DialogTitle>
          <DialogDescription>
            Send SMS messages to your clients via Africa's Talking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Recipients */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">
                Recipients ({recipientClients.length})
              </span>
            </div>
            
            {recipientClients.length > 0 ? (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {recipientClients.map(client => (
                  <div key={client.id} className="text-sm text-blue-800 flex justify-between">
                    <span className="font-medium">{client.fullName}</span>
                    <span className="text-blue-600">{client.phoneNumber}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-orange-600">
                No clients selected. Please select clients from the Clients page.
              </p>
            )}
          </div>

          {/* Message Templates */}
          <div>
            <Label className="mb-2 block">Quick Templates</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(MESSAGE_TEMPLATES).map(([key, template]) => (
                <Button
                  key={key}
                  type="button"
                  variant={selectedTemplate === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTemplateSelect(key)}
                  className="justify-start text-sm"
                  disabled={recipientClients.length === 0}
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="mt-1 resize-none"
              disabled={recipientClients.length === 0}
            />
            <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
              <span>
                {charCount} characters | ~{smsCount} SMS {smsCount > 1 ? 'messages' : 'message'}
              </span>
              <span className={charCount > 160 ? 'text-orange-600 font-medium' : ''}>
                {charCount > 160 && 'Multiple SMS will be charged'}
              </span>
            </div>
          </div>

          {/* Send Status */}
          {sendStatus && (
            <div className={`flex items-start gap-2 p-3 rounded-lg border ${
              sendStatus.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {sendStatus.success ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm">{sendStatus.message}</p>
            </div>
          )}

          {/* Info Notice */}
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
            <p className="text-xs text-gray-700">
              <strong>Note:</strong> SMS will be sent via Africa's Talking. Standard SMS rates apply. 
              Phone numbers will be automatically formatted for Uganda (+256). Each SMS is ~160 characters.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!message.trim() || recipientClients.length === 0 || isSending}
            >
              {isSending ? (
                <>
                  <span className="animate-pulse">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send to {recipientClients.length} {recipientClients.length === 1 ? 'Client' : 'Clients'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}