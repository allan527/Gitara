import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { ChevronDown, ChevronUp, Calendar, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { CashbookEntry, formatUGX } from '../data/mockData';
import { Footer } from '../components/Footer';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TransactionHistoryProps {
  entries: CashbookEntry[];
}

export function TransactionHistory({ entries }: TransactionHistoryProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // Group entries by date
  const entriesByDate = entries.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = [];
    }
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, CashbookEntry[]>);

  // Calculate daily summaries
  const dailySummaries = Object.entries(entriesByDate).map(([date, dayEntries]) => {
    const totalIncome = dayEntries
      .filter(e => e.type === 'Income')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalExpenses = dayEntries
      .filter(e => e.type === 'Expense')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const netBalance = totalIncome - totalExpenses;

    return {
      date,
      totalIncome,
      totalExpenses,
      netBalance,
      entries: dayEntries,
      transactionCount: dayEntries.length,
    };
  });

  // Sort by date (most recent first)
  dailySummaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const toggleDate = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const exportDayToPDF = (summary: typeof dailySummaries[0]) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Daily Transaction Report', 14, 16);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(summary.date).toLocaleDateString('en-UG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`, 14, 24);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-UG')}`, 14, 31);

    // Add summary stats
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Summary', 14, 45);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Total Transactions: ${summary.transactionCount}`, 14, 53);
    doc.text(`Total Income: ${formatUGX(summary.totalIncome)}`, 14, 60);
    doc.text(`Total Expenses: ${formatUGX(summary.totalExpenses)}`, 14, 67);
    doc.text(`Net Balance: ${formatUGX(summary.netBalance)}`, 14, 74);

    // Add transaction details table
    autoTable(doc, {
      head: [['Time', 'Description', 'Type', 'Amount', 'Status']],
      body: summary.entries.map(entry => [
        entry.time,
        entry.description,
        entry.type,
        (entry.type === 'Income' ? '+' : '-') + formatUGX(entry.amount),
        entry.status,
      ]),
      startY: 85,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    const filename = `transactions_${summary.date}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600 mt-1">Archive of all daily transactions</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Days</p>
          <p className="text-3xl font-bold text-gray-900">{dailySummaries.length}</p>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
          <p className="text-3xl font-bold text-blue-600">{entries.length}</p>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Income</p>
          <p className="text-2xl font-bold text-green-600">
            {formatUGX(
              entries
                .filter(e => e.type === 'Income')
                .reduce((sum, e) => sum + e.amount, 0)
            )}
          </p>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">
            {formatUGX(
              entries
                .filter(e => e.type === 'Expense')
                .reduce((sum, e) => sum + e.amount, 0)
            )}
          </p>
        </Card>
      </div>

      {/* Transaction Archive */}
      <div className="space-y-4">
        {dailySummaries.map((summary) => {
          const isExpanded = expandedDates.has(summary.date);
          
          return (
            <Card key={summary.date} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* Date Card Header - Clickable */}
              <div className="p-5">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <button
                    onClick={() => toggleDate(summary.date)}
                    className="flex items-center gap-4 flex-1"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {new Date(summary.date).toLocaleDateString('en-UG', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {summary.transactionCount} transaction{summary.transactionCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </button>

                  <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 lg:gap-6 w-full lg:w-auto">
                    {/* Income */}
                    <div className="text-left lg:text-right flex-1 lg:flex-initial">
                      <p className="text-xs text-gray-600 mb-1">Income</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <p className="font-semibold text-green-600">
                          {formatUGX(summary.totalIncome)}
                        </p>
                      </div>
                    </div>

                    {/* Expenses */}
                    <div className="text-left lg:text-right flex-1 lg:flex-initial">
                      <p className="text-xs text-gray-600 mb-1">Expenses</p>
                      <div className="flex items-center gap-1">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        <p className="font-semibold text-red-600">
                          {formatUGX(summary.totalExpenses)}
                        </p>
                      </div>
                    </div>

                    {/* Net Balance */}
                    <div className="text-left lg:text-right flex-1 lg:flex-initial lg:min-w-[140px]">
                      <p className="text-xs text-gray-600 mb-1">Net Balance</p>
                      <p className={`text-lg font-bold ${
                        summary.netBalance >= 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {formatUGX(summary.netBalance)}
                      </p>
                    </div>

                    {/* Download PDF Button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportDayToPDF(summary);
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>

                    {/* Expand/Collapse Icon */}
                    <button
                      onClick={() => toggleDate(summary.date)}
                      className="ml-2"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Transaction List */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">Time</TableHead>
                          <TableHead className="font-semibold">Description</TableHead>
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="font-semibold text-right">Amount</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary.entries.map((entry) => (
                          <TableRow key={entry.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{entry.time}</TableCell>
                            <TableCell className="text-gray-600">{entry.description}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  entry.type === 'Income'
                                    ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                    : 'bg-red-100 text-red-700 hover:bg-red-100'
                                }
                              >
                                {entry.type}
                              </Badge>
                            </TableCell>
                            <TableCell className={`text-right font-semibold ${
                              entry.type === 'Income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {entry.type === 'Income' ? '+' : '-'}{formatUGX(entry.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  entry.type === 'Income'
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                                    : 'bg-orange-100 text-orange-700 hover:bg-orange-100'
                                }
                              >
                                {entry.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      <Footer />
    </div>
  );
}