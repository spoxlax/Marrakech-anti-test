import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-[#222222] text-white px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-3 min-w-[300px] max-w-md">
                {type === 'success' ? (
                    <CheckCircle size={20} className="text-green-400 shrink-0" />
                ) : (
                    <XCircle size={20} className="text-red-400 shrink-0" />
                )}

                <p className="text-sm font-medium flex-1">{message}</p>

                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors shrink-0"
                >
                    <X size={16} className="text-gray-400" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
