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
  onExport?: () => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  transactions = [],
  pagination = { page: 1, limit: 10 },
  onPageChange,
  onLimitChange,
  selectedRows = [],
  onToggleSelection,
  onSelectAll,
  totalItems = 0,
  onExport,
  selectedCategory,
  onCategoryChange
}) => {
  const { t } = useLanguage();
  const safeTransactions = (Array.isArray(transactions) ? transactions : []).filter(t => {
    if (!selectedCategory || selectedCategory === 'all') return true;
    return t.type === selectedCategory;
  });
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
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={selectedCategory || "all"}
            onValueChange={onCategoryChange}
          >
            <SelectTrigger className="w-full sm:w-[180px] border-slate-200 bg-white h-11 font-bold text-slate-600 rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-bold">All Categories</SelectItem>
              <SelectItem value="income" className="font-bold">Income / Revenue</SelectItem>
              <SelectItem value="expense" className="font-bold">Expenses</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={onExport}
            className="flex-1 sm:flex-none h-11 px-6 gap-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 shadow-sm transition-all duration-300 rounded-xl"
          >
            <Download className="h-4 w-4" />
            {t.dashboard?.export || "Export"}
          </Button>
        </div>
      </div>

      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-20 bg-white border border-slate-200 p-3 rounded-xl shadow-md flex flex-col xs:flex-row items-center justify-between gap-3 mb-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3 w-full xs:w-auto">
            <Badge className="bg-slate-900 text-white border-none px-3 py-1 font-bold shrink-0">
              {selectedRows.length} {t.dashboard?.selected || 'selected'}
            </Badge>
            <p className="text-sm font-medium text-slate-600 hidden sm:block truncate">{t.dashboard?.performActionsTransactions || 'Perform actions on all selected transactions'}</p>
          </div>
          <div className="flex items-center gap-2 w-full xs:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="text-slate-600 border-slate-200 font-bold hover:bg-slate-50 flex-1 xs:flex-none h-10"
              onClick={() => onSelectAll?.([])}
            >
              <span>{t.dashboard?.clearSelection || 'Clear Selection'}</span>
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white font-bold shadow-sm flex-1 xs:flex-none h-10"
              onClick={() => {
                alert(`Exporting ${selectedRows.length} selected transactions.`);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              <span>{t.dashboard?.exportSelected || 'Export Selected'}</span>
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
                      <TableCell className={`text-right font-black text-lg ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                        {transaction.type === 'income' ? '+' : '-'}ETB {(transaction.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <Badge className={`${transaction.status === 'Completed' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-amber-500 shadow-amber-500/20'
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
          <div className="p-3 sm:p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30 gap-2 overflow-hidden">
            <div className="text-[10px] sm:text-sm font-bold text-slate-500 shrink-0">
              <span className="hidden sm:inline">
                {t.dashboard?.showingTransactions ? (
                  t.dashboard.showingTransactions.replace('{count}', String(safeTransactions.length)).replace('{total}', String(totalItems))
                ) : (
                  <>Showing <span className="text-slate-900">{safeTransactions.length}</span> of <span className="text-slate-900">{totalItems}</span></>
                )}
              </span>
              <span className="sm:hidden text-slate-900 font-extrabold">{safeTransactions.length}/{totalItems}</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <Select value={String(pagination.limit)} onValueChange={(val) => onLimitChange?.(parseInt(val))}>
                <SelectTrigger className="w-[65px] sm:w-[130px] h-8 sm:h-10 border-slate-200 rounded-lg text-slate-600 font-medium bg-white px-1 sm:px-3 text-[10px] sm:text-sm">
                  <div className="flex items-center justify-center w-full">
                    <span className="sm:hidden">{pagination.limit}/p</span>
                    <span className="hidden sm:inline">{pagination.limit} {t.dashboard?.perPage || '/ page'}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="icon" onClick={() => onPageChange?.(pagination.page - 1)} disabled={pagination.page <= 1} className="h-8 w-8 sm:h-10 sm:w-10 border border-slate-100 rounded-lg sm:rounded-xl hover:bg-slate-50 text-slate-400 p-0">
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <div className="flex items-center gap-1">
                  {getPageNumbers().map(pageNum => (
                    <Button key={pageNum} variant={pagination.page === pageNum ? "default" : "ghost"} onClick={() => onPageChange?.(pageNum)} className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-sm transition-all duration-200 p-0 ${pagination.page === pageNum ? "bg-[#F29F1F] text-slate-900 hover:bg-[#F29F1F]/90 shadow-md shadow-orange-200" : "text-slate-500 hover:bg-slate-50"}`}>
                      {pageNum}
                    </Button>
                  ))}
                </div>
                <Button variant="ghost" size="icon" onClick={() => onPageChange?.(pagination.page + 1)} disabled={pagination.page >= totalPages} className="h-8 w-8 sm:h-10 sm:w-10 border border-slate-100 rounded-lg sm:rounded-xl hover:bg-slate-50 text-slate-400 p-0">
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
