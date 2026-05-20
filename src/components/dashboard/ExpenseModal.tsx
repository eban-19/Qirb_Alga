import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { CreditCard, Trash2 } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit';
  expense: any;
  onUpdate: (expenseId: number, data: any) => Promise<boolean>;
  onDelete: (expenseId: number) => Promise<boolean>;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  mode,
  expense,
  onUpdate,
  onDelete,
}) => {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (expense) {
      setCategory(expense.category || expense.rawExpense?.category || '');
      setDescription(expense.description || expense.rawExpense?.description || '');
      setAmount(String(expense.amount || expense.rawExpense?.amount || ''));
      
      const rawDate = expense.rawExpense?.expense_date || expense.date;
      if (rawDate) {
        setDate(new Date(rawDate).toISOString().split('T')[0]);
      } else {
        setDate('');
      }
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const expenseId = expense?.rawExpense?.expense_id || expense?.expense_id || expense?.id;
    if (!expenseId) return;

    const success = await onUpdate(expenseId, {
      category,
      description,
      amount: parseFloat(amount),
      expense_date: date,
    });

    if (success) {
      onClose();
    }
  };

  const handleDelete = async () => {
    const expenseId = expense?.rawExpense?.expense_id || expense?.expense_id || expense?.id;
    if (!expenseId) return;
    
    if (confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      setIsDeleting(true);
      const success = await onDelete(expenseId);
      setIsDeleting(false);
      if (success) {
        onClose();
      }
    }
  };

  if (!expense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] border border-slate-200 shadow-none bg-white rounded-3xl overflow-hidden p-0 gap-0">
        <DialogHeader className="p-6 pb-0 flex flex-row items-center justify-between mt-2">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-200">
              <CreditCard className="h-5 w-5" />
            </div>
            <span>{mode === 'view' ? 'Expense Details' : 'Edit Expense'}</span>
          </DialogTitle>
        </DialogHeader>

        {mode === 'view' ? (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category</p>
                <p className="text-sm font-bold text-slate-800 capitalize">{category}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                <p className="text-sm font-bold text-slate-800">{date}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amount</p>
              <p className="text-2xl font-black text-red-600">ETB {parseFloat(amount || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-slate-700 font-medium leading-relaxed">{description || 'No description provided.'}</p>
            </div>

            <DialogFooter className="flex gap-2 sm:justify-between items-center pt-4 border-t border-slate-100">
              <Button
                variant="ghost"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold gap-2 rounded-xl"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
              <Button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl px-6">
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="Staff Salaries">Staff Salaries</option>
                <option value="Utilities">Utilities</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Supplies">Supplies</option>
                <option value="Marketing">Marketing</option>
                <option value="Rent">Rent</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Amount (ETB)</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Date</Label>
              <Input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of this expense..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none resize-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
              />
            </div>

            <DialogFooter className="flex gap-2 justify-end pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl font-bold">
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
