import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionsSectionProps {
  transactions: any[];
  pagination?: { page: number; limit: number };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  selectedRows?: (string | number)[];
  onToggleSelection?: (id: string | number) => void;
  onSelectAll?: (ids: (string | number)[]) => void;
  totalItems?: number;
}

export const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  transactions = [],
  pagination = { page: 1, limit: 10 },
  onPageChange,
  onLimitChange,
  selectedRows = [],
  onToggleSelection,
  onSelectAll,
  totalItems = 0
}) => {
  const { t } = useLanguage();
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const totalPages = Math.ceil(totalItems / pagination.limit) || 1;

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            {t.dashboard?.transactions || "Transactions"}
          </h2>
          <p className="text-slate-500 mt-1">
            {t.dashboard?.viewAllFinancialTransactions || "View all financial transactions."}
          </p>
        </div>
        <Button variant="outline" className="gap-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 shadow-sm transition-all duration-300">
          <Download className="h-4 w-4" />
          {t.dashboard?.export || "Export"}
        </Button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-20 bg-white border border-slate-200 p-3 rounded-xl shadow-md flex items-center justify-between mb-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <Badge className="bg-slate-900 text-white border-none px-3 py-1 font-bold">
              {selectedRows.length} {t.dashboard?.selected || 'selected'}
            </Badge>
            <p className="text-sm font-medium text-slate-600 hidden sm:block">{t.dashboard?.performActionsTransactions || 'Perform actions on all selected transactions'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-slate-600 border-slate-200 font-bold hover:bg-slate-50"
              onClick={() => onSelectAll?.([])}
            >
              {t.dashboard?.clearSelection || 'Clear Selection'}
            </Button>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90 text-white font-bold shadow-sm"
              onClick={() => {
                alert(`Exporting ${selectedRows.length} selected transactions.`);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              {t.dashboard?.exportSelected || 'Export Selected'}
            </Button>
          </div>
        </div>
      )}

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
                        if (checked) onSelectAll?.(safeTransactions.map(t => t.id));
                        else onSelectAll?.([]);
                      }}
                    />
                  </TableHead>
                  <TableHead className="font-bold text-slate-600">{t.dashboard?.date || "Date"}</TableHead>
                  <TableHead className="font-bold text-slate-600">{t.dashboard?.description || "Description"}</TableHead>
                  <TableHead className="font-bold text-slate-600">{t.dashboard?.category || "Category"}</TableHead>
                  <TableHead className="text-right font-bold text-slate-600">{t.dashboard?.amount || "Amount"}</TableHead>
                  <TableHead className="font-bold pr-8 text-slate-600 text-right">{t.dashboard?.status || "Status"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                      {t.dashboard?.noTransactionsFound || "No transactions found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  safeTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className={`hover:bg-slate-50/50 transition-all duration-200 h-20 group ${selectedRows.includes(transaction.id) ? 'bg-blue-50/30' : ''}`}>
                      <TableCell className="px-8">
                        <Checkbox checked={selectedRows.includes(transaction.id)} onCheckedChange={() => onToggleSelection?.(transaction.id)} />
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-slate-500">{transaction.date}</TableCell>
                      <TableCell className="font-bold text-slate-800">{transaction.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
                          {transaction.type === 'income' ? (t.dashboard?.income || 'REVENUE') : (t.dashboard?.expense || 'EXPENSE')}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-black text-lg ${
                        transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}ETB {(transaction.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <Badge className={`${
                          transaction.status === 'Completed' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-amber-500 shadow-amber-500/20'
                        } text-white font-bold text-[10px] px-3 py-1 rounded-full shadow-lg`}>
                          {transaction.status === 'Completed' ? (t.dashboard?.completed || 'Completed') : (transaction.status || 'N/A')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Unified Pagination Footer */}
          <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="text-sm font-bold text-slate-500">
              {t.dashboard?.showingTransactions ? (
                t.dashboard.showingTransactions.replace('{count}', String(safeTransactions.length)).replace('{total}', String(totalItems))
              ) : (
                `Showing ${safeTransactions.length} of ${totalItems} transactions`
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Select value={String(pagination.limit)} onValueChange={(val) => onLimitChange?.(parseInt(val))}>
                  <SelectTrigger className="w-[130px] h-10 border-slate-200 rounded-lg text-slate-600 font-medium bg-white">
                    <div className="flex items-center"><span>{pagination.limit} {t.dashboard?.perPage || '/ page'}</span></div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 {t.dashboard?.perPage || '/ page'}</SelectItem>
                    <SelectItem value="10">10 {t.dashboard?.perPage || '/ page'}</SelectItem>
                    <SelectItem value="20">20 {t.dashboard?.perPage || '/ page'}</SelectItem>
                    <SelectItem value="50">50 {t.dashboard?.perPage || '/ page'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => onPageChange?.(pagination.page - 1)} disabled={pagination.page <= 1} className="h-10 w-10 border border-slate-100 rounded-xl hover:bg-slate-50 text-slate-400">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                {getPageNumbers().map(pageNum => (
                  <Button key={pageNum} variant={pagination.page === pageNum ? "default" : "ghost"} onClick={() => onPageChange?.(pageNum)} className={`h-10 w-10 rounded-xl font-bold text-sm transition-all duration-200 ${pagination.page === pageNum ? "bg-[#F29F1F] text-slate-900 hover:bg-[#F29F1F]/90 shadow-md shadow-orange-200" : "text-slate-500 hover:bg-slate-50"}`}>
                    {pageNum}
                  </Button>
                ))}
                <Button variant="ghost" size="icon" onClick={() => onPageChange?.(pagination.page + 1)} disabled={pagination.page >= totalPages} className="h-10 w-10 border border-slate-100 rounded-xl hover:bg-slate-50 text-slate-400">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
