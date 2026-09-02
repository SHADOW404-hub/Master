import { useEffect } from 'react';
import { CheckCircle2, Lock, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'escrow' | 'warning' | 'info';
  title: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps) => {
  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    escrow: <Lock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />,
    warning: <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/40 bg-emerald-950/80',
    escrow: 'border-amber-500/40 bg-amber-950/80',
    warning: 'border-red-500/40 bg-red-950/80',
    info: 'border-blue-500/40 bg-blue-950/80',
  };

  return (
    <div 
      className={`pointer-events-auto glass-panel p-3.5 border ${borders[toast.type]} rounded-xl shadow-2xl flex items-start gap-3 transition-all duration-300 animate-slide-in`}
    >
      {icons[toast.type]}
      <div className="flex-1">
        <h4 className="font-bold text-white text-xs">{toast.title}</h4>
        <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">{toast.message}</p>
      </div>
      <button 
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-white p-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
