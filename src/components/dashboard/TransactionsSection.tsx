import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, ChevronLeft, ChevronRight, ChevronDown, MoreVertical, Eye, Edit2, Trash2 } from "lucide-react";
import { TranslationText } from "@/components/TranslationText";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExpenseModal } from "./ExpenseModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

interface TransactionsSectionProps {
  transactions: any[];
  pagination?: { page: number; limit: number };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  selectedRows?: (string | number)[];
  onToggleSelection?: (id: string | number) => void;
  onSelectAll?: (ids: (string | number)[]) => void;
  totalItems?: number;
  language?: any;
  onUpdateExpense?: (expenseId: number, data: any) => Promise<boolean>;
  onDeleteExpense?: (expenseId: number) => Promise<boolean>;
  transactionFilter?: 'all' | 'income' | 'expense';
  onTransactionFilterChange?: (filter: 'all' | 'income' | 'expense') => void;
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
  language,
  onUpdateExpense,
  onDeleteExpense,
  transactionFilter = 'all',
  onTransactionFilterChange,
}) => {
  // Ensure transactions is always an array
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const totalPages = Math.ceil(totalItems / pagination.limit) || 1;

  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  const [deleteTransaction, setDeleteTransaction] = useState<any | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

  const handleViewExpense = (transaction: any) => {
    setSelectedExpense(transaction);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditExpense = (transaction: any) => {
    setSelectedExpense(transaction);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteExpenseClick = (transaction: any) => {
    setDeleteTransaction(transaction);
  };

  const handleExportCSV = () => {
    const txData = safeTransactions;
    if (txData.length === 0) {
      alert("No transactions to export.");
      return;
    }

    const headers = ["Date", "Description", "Type", "Amount (ETB)", "Status", "Method"];
    const rows = txData.map(t => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.type.toUpperCase(),
      t.amount,
      t.status,
      t.method
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_${transactionFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-6">
      {/* Filters & Actions Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-2 animate-in fade-in duration-300">
        <div className="w-full sm:w-[260px]">
          <Select 
            value={transactionFilter} 
            onValueChange={(val) => onTransactionFilterChange?.(val as 'all' | 'income' | 'expense')}
          >
            <SelectTrigger className="w-full h-11 border-slate-200 rounded-xl bg-white font-bold text-slate-800 shadow-sm transition-all focus:ring-amber-500/20 focus:border-amber-500">
              <SelectValue placeholder="Filter Transactions" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-100 rounded-xl shadow-lg z-50">
              <SelectItem value="all" className="font-semibold text-slate-700 hover:text-slate-900 cursor-pointer focus:bg-slate-50 focus:text-slate-900">
                All Transactions
              </SelectItem>
              <SelectItem value="income" className="font-semibold text-slate-700 hover:text-slate-900 cursor-pointer focus:bg-slate-50 focus:text-slate-900">
                Revenue
              </SelectItem>
              <SelectItem value="expense" className="font-semibold text-slate-700 hover:text-slate-900 cursor-pointer focus:bg-slate-50 focus:text-slate-900">
                Expenses
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleExportCSV}
          variant="outline" 
          className="gap-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 shadow-sm transition-all duration-300 h-11 px-5 rounded-xl self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <TranslationText text="Export CSV" language={language} />
        </Button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-20 bg-white border border-slate-200 p-3 rounded-xl shadow-md flex items-center justify-between mb-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <Badge className="bg-slate-900 text-white border-none px-3 py-1 font-bold">
              {selectedRows.length} selected
            </Badge>
            <p className="text-sm font-medium text-slate-600 hidden sm:block">Perform actions on selected transactions</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedRows.length === 1 && (
              (() => {
                const selectedTx = safeTransactions.find(t => String(t.id) === String(selectedRows[0]));
                if (selectedTx && selectedTx.type === 'expense') {
                  return (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="font-bold text-amber-600 border-amber-100 bg-amber-50 hover:bg-amber-100 shadow-sm"
                      onClick={() => handleEditExpense(selectedTx)}
                    >
                      <Edit2 className="h-4 w-4 mr-1.5" />
                      Edit Expense
                    </Button>
                  );
                }
                return null;
              })()
            )}

            {(() => {
              const selectedExpenses = safeTransactions.filter(t => selectedRows.includes(t.id) && t.type === 'expense');
              if (selectedExpenses.length > 0) {
                return (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="font-bold text-red-600 border-red-100 bg-red-50 hover:bg-red-100 shadow-sm"
                    onClick={() => setBulkDeleteOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete {selectedExpenses.length > 1 ? `(${selectedExpenses.length})` : ''}
                  </Button>
                );
              }
              return null;
            })()}

            <Button 
              size="sm" 
              variant="outline" 
              className="text-slate-600 border-slate-200 font-bold hover:bg-slate-50"
              onClick={() => onSelectAll?.([])}
            >
              Clear
            </Button>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90 text-white font-bold shadow-sm"
              onClick={() => {
                const selectedTx = safeTransactions.filter(t => selectedRows.includes(t.id));
                if (selectedTx.length === 0) return;
                
                const headers = ["Date", "Description", "Type", "Amount (ETB)", "Status", "Method"];
                const rows = selectedTx.map(t => [
                  t.date,
                  `"${t.description.replace(/"/g, '""')}"`,
                  t.type.toUpperCase(),
                  t.amount,
                  t.status,
                  t.method
                ]);
                
                const csvContent = "data:text/csv;charset=utf-8," 
                  + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                  
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `selected_transactions_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Selected
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
                  <TableHead className="font-bold text-slate-600"><TranslationText text="Date" language={language} /></TableHead>
                  <TableHead className="font-bold text-slate-600"><TranslationText text="Description" language={language} /></TableHead>
                  <TableHead className="font-bold text-slate-600"><TranslationText text="Category" language={language} /></TableHead>
                  <TableHead className="text-right font-bold text-slate-600"><TranslationText text="Amount" language={language} /></TableHead>
                  <TableHead className="font-bold text-slate-600 text-right"><TranslationText text="Status" language={language} /></TableHead>
                  <TableHead className="font-bold pr-8 text-slate-600 text-center w-[120px]"><TranslationText text="Actions" language={language} /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                      <TranslationText text="No transactions found." language={language} />
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
                          {transaction.type === 'income' ? 'REVENUE' : 'EXPENSE'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-black text-lg ${
                        transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}ETB {(transaction.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={`${
                          transaction.status === 'Completed' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-amber-500 shadow-amber-500/20'
                        } text-white font-bold text-[10px] px-3 py-1 rounded-full shadow-lg`}>
                          <TranslationText text={transaction.status} language={language} />
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-8 text-center">
                        {transaction.type === 'expense' ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-7 sm:h-9 px-1.5 sm:px-3 gap-1 sm:gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all duration-300 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold shrink-0"
                              >
                                <span className="text-[10px] sm:text-xs font-bold"><TranslationText text="Actions" language={language} /></span>
                                <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-50 shrink-0" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-slate-100 rounded-xl shadow-lg ring-1 ring-slate-100 min-w-[140px] z-50">
                              <DropdownMenuItem 
                                onClick={() => handleViewExpense(transaction)} 
                                className="flex items-center gap-2 cursor-pointer text-slate-700 hover:bg-slate-50 py-2 px-3 rounded-lg"
                              >
                                <Eye className="h-4 w-4 text-slate-500" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleEditExpense(transaction)}
                                className="flex items-center gap-2 cursor-pointer text-slate-700 hover:bg-slate-50 py-2 px-3 rounded-lg"
                              >
                                <Edit2 className="h-4 w-4 text-amber-500" />
                                <span>Edit Expense</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteExpenseClick(transaction)}
                                className="flex items-center gap-2 cursor-pointer text-red-600 hover:bg-red-50 py-2 px-3 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                                <span>Delete Expense</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Unified Pagination Footer */}
          <div className="p-3 sm:p-8 border-t border-slate-50 flex flex-row items-center justify-between gap-1.5 sm:gap-4 bg-slate-50/30 overflow-hidden">
            <div className="text-[10px] sm:text-sm font-bold text-slate-500 shrink-0">
              <span className="hidden xs:inline sm:inline">Showing </span>
              <span className="text-slate-900">{safeTransactions.length}</span> of <span className="text-slate-900">{totalItems}</span>
              <span className="hidden xs:inline sm:inline"> transactions</span>
            </div>

            <div className="flex flex-row items-center gap-1.5 sm:gap-3 shrink-0">
              <div className="flex items-center gap-1 shrink-0">
                <Select value={String(pagination.limit)} onValueChange={(val) => onLimitChange?.(parseInt(val))}>
                  <SelectTrigger className="w-[70px] sm:w-[125px] h-8 sm:h-10 border-slate-200 rounded-lg text-slate-600 font-medium bg-white px-1 sm:px-3 text-[10px] sm:text-sm">
                    <div className="flex items-center">
                      <span className="sm:hidden">{pagination.limit}/p</span>
                      <span className="hidden sm:inline">{pagination.limit} / page</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 / page</SelectItem>
                    <SelectItem value="10">10 / page</SelectItem>
                    <SelectItem value="20">20 / page</SelectItem>
                    <SelectItem value="50">50 / page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => onPageChange?.(pagination.page - 1)} disabled={pagination.page <= 1} className="h-8 w-8 sm:h-10 sm:w-10 border border-slate-100 rounded-lg sm:rounded-xl hover:bg-slate-50 text-slate-400 p-0">
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                {getPageNumbers().map(pageNum => (
                  <Button key={pageNum} variant={pagination.page === pageNum ? "default" : "ghost"} onClick={() => onPageChange?.(pageNum)} className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 p-0 ${pagination.page === pageNum ? "bg-[#F29F1F] text-slate-900 hover:bg-[#F29F1F]/90 shadow-md shadow-orange-200" : "text-slate-500 hover:bg-slate-50"}`}>
                    {pageNum}
                  </Button>
                ))}
                <Button variant="ghost" size="icon" onClick={() => onPageChange?.(pagination.page + 1)} disabled={pagination.page >= totalPages} className="h-8 w-8 sm:h-10 sm:w-10 border border-slate-100 rounded-lg sm:rounded-xl hover:bg-slate-50 text-slate-400 p-0">
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 rotate-180" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedExpense && (
        <ExpenseModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedExpense(null);
          }}
          mode={modalMode}
          expense={selectedExpense}
          onUpdate={async (id, data) => {
            if (onUpdateExpense) {
              const success = await onUpdateExpense(id, data);
              return success;
            }
            return false;
          }}
          onDelete={async (id) => {
            if (onDeleteExpense) {
              const success = await onDeleteExpense(id);
              return success;
            }
            return false;
          }}
        />
      )}

      {/* Single Expense Custom Delete Confirmation Modal */}
      <ConfirmDeleteModal 
        isOpen={!!deleteTransaction}
        onClose={() => setDeleteTransaction(null)}
        onConfirm={async () => {
          if (deleteTransaction) {
            const expenseId = deleteTransaction.rawExpense?.expense_id || deleteTransaction.rawExpense?.id || deleteTransaction.id.replace('t-exp-', '');
            if (expenseId && onDeleteExpense) {
              await onDeleteExpense(parseInt(expenseId));
            }
          }
        }}
        title="Delete Expense"
        description="Are you sure you want to permanently delete this expense? This action cannot be undone."
        itemCount={1}
      />

      {/* Bulk Expenses Custom Delete Confirmation Modal */}
      {(() => {
        const selectedExpenses = safeTransactions.filter(t => selectedRows.includes(t.id) && t.type === 'expense');
        return (
          <ConfirmDeleteModal 
            isOpen={bulkDeleteOpen}
            onClose={() => setBulkDeleteOpen(false)}
            onConfirm={async () => {
              selectedExpenses.forEach(async (t) => {
                const expenseId = t.rawExpense?.expense_id || t.rawExpense?.id || t.id.replace('t-exp-', '');
                if (expenseId && onDeleteExpense) {
                  await onDeleteExpense(parseInt(expenseId));
                }
              });
              onSelectAll?.([]);
            }}
            title="Delete Selected Expenses"
            description={`Are you sure you want to permanently delete these ${selectedExpenses.length} selected expense(s)? This action cannot be undone.`}
            itemCount={selectedExpenses.length}
          />
        );
      })()}
    </div>
  );
};

