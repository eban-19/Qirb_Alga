import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { TranslationText } from "@/components/TranslationText";

import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TransactionsSectionProps {
  transactions: any[];
  pagination?: { page: number; limit: number };
  onPageChange?: (page: number) => void;
  selectedRows?: (string | number)[];
  onToggleSelection?: (id: string | number) => void;
  onSelectAll?: (ids: (string | number)[]) => void;
  totalItems?: number;
  language?: any;
}

export const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  transactions = [],
  pagination = { page: 1, limit: 10 },
  onPageChange,
  selectedRows = [],
  onToggleSelection,
  onSelectAll,
  totalItems = 0,
  language
}) => {
  // Ensure transactions is always an array
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            <TranslationText text="Transactions" language={language} />
          </h2>
          <p className="text-slate-500 mt-1">
            <TranslationText text="View all financial transactions." language={language} />
          </p>
        </div>
        <Button variant="outline" className="gap-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 shadow-sm transition-all duration-300">
          <Download className="h-4 w-4" />
          <TranslationText text="Export" language={language} />
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100 h-16">
                  <TableHead className="w-[50px] px-8">
                    <Checkbox 
                      checked={safeTransactions.length > 0 && selectedRows.length === safeTransactions.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onSelectAll?.(safeTransactions.map(t => t.id));
                        } else {
                          onSelectAll?.([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="font-bold text-slate-600">
                    <TranslationText text="Date" language={language} />
                  </TableHead>
                  <TableHead className="font-bold text-slate-600">
                    <TranslationText text="Description" language={language} />
                  </TableHead>
                  <TableHead className="font-bold text-slate-600">
                    <TranslationText text="Category" language={language} />
                  </TableHead>
                  <TableHead className="text-right font-bold text-slate-600">
                    <TranslationText text="Amount" language={language} />
                  </TableHead>
                  <TableHead className="font-bold pr-8 text-slate-600">
                    <TranslationText text="Status" language={language} />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                      <TranslationText text="No transactions found." language={language} />
                    </TableCell>
                  </TableRow>
                ) : (
                  safeTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className={`hover:bg-slate-50/50 transition-all duration-200 h-20 group ${selectedRows.includes(transaction.id) ? 'bg-blue-50/30' : ''}`}>
                      <TableCell className="px-8">
                        <Checkbox 
                          checked={selectedRows.includes(transaction.id)}
                          onCheckedChange={() => onToggleSelection?.(transaction.id)}
                        />
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-slate-500">
                        {transaction.date}
                      </TableCell>
                      <TableCell className="font-bold text-slate-800">
                        {transaction.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
                          {transaction.type === 'income' ? 'REVENUE' : 'EXPENSE'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-black text-lg ${
                        transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}ETB {(transaction.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="pr-8">
                        <Badge className={`${
                          transaction.status === 'Completed' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-amber-500 shadow-amber-500/20'
                        } text-white font-bold text-[10px] px-3 py-1 rounded-full shadow-lg`}>
                          <TranslationText text={transaction.status} language={language} />
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-900">{safeTransactions.length}</span> of <span className="font-semibold text-slate-900">{totalItems}</span> transactions
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="h-9 px-3 rounded-xl border-slate-200 hover:bg-white transition-all shadow-sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <div className="flex items-center px-4 h-9 bg-white border border-slate-200 rounded-xl text-sm font-medium shadow-sm">
                Page {pagination.page} of {Math.ceil(totalItems / pagination.limit) || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page >= (Math.ceil(totalItems / pagination.limit) || 1)}
                className="h-9 px-3 rounded-xl border-slate-200 hover:bg-white transition-all shadow-sm"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
