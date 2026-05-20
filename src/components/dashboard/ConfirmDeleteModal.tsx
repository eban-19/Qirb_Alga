import React from 'react';
import ReactDOM from 'react-dom';
import { AlertCircle, Trash2, X } from 'lucide-react';
import { Button } from '../ui/button';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemCount?: number;
  itemName?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemCount = 1,
  itemName = 'item'
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-white rounded-[2rem] shadow-none w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8 text-center">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mb-6 border border-red-100/50">
            <Trash2 className="h-10 w-10 text-red-500" />
          </div>

          <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
            {title}
          </h3>
          
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            {description}
          </p>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 h-14 rounded-2xl border-2 font-bold text-slate-600 hover:bg-slate-50"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all hover:scale-[1.02] active:scale-95"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {itemCount > 0 ? (itemCount === 1 ? '' : itemCount) : ''}
            </Button>
          </div>
        </div>
        
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex items-center gap-2 justify-center">
          <AlertCircle className="h-4 w-4 text-slate-400" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">This action cannot be undone</p>
        </div>
      </div>
    </div>,
    document.body
  );
};
