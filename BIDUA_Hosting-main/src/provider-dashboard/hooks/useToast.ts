import { useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '../components/Toast';

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((
    type: ToastType,
    title: string,
    message: string,
    duration?: number
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration: duration ?? (type === 'error' ? 6000 : 5000),
    };

    setToasts(prev => [...prev, toast]);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((title: string, message: string, duration?: number) => {
    return addToast('success', title, message, duration);
  }, [addToast]);

  const error = useCallback((title: string, message: string, duration?: number) => {
    return addToast('error', title, message, duration);
  }, [addToast]);

  const warning = useCallback((title: string, message: string, duration?: number) => {
    return addToast('warning', title, message, duration);
  }, [addToast]);

  const info = useCallback((title: string, message: string, duration?: number) => {
    return addToast('info', title, message, duration);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
