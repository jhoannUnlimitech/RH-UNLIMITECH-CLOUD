import { useEffect, useState } from "react";
import Toast, { ToastProps } from "./Toast";

export interface ToastItem {
  id: string;
  variant: "success" | "info" | "warning" | "error";
  title: string;
  description?: string;
  duration?: number;
}

// Global toast state
let toastListeners: Array<(toasts: ToastItem[]) => void> = [];
let toasts: ToastItem[] = [];
let idCounter = 0;

function emitChange() {
  for (const listener of toastListeners) {
    listener([...toasts]);
  }
}

export function addToast(toast: Omit<ToastItem, "id">) {
  const id = `toast-${++idCounter}-${Date.now()}`;
  toasts = [...toasts, { ...toast, id }];
  emitChange();
  return id;
}

export function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emitChange();
}

/**
 * ToastContainer - Se monta una vez en la app (main.tsx)
 * Los toasts aparecen arriba a la derecha con animación
 */
const ToastContainer: React.FC = () => {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    toastListeners.push(setItems);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setItems);
    };
  }, []);

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 pointer-events-none">
      {items.map((item) => (
        <div key={item.id} className="pointer-events-auto">
          <Toast
            id={item.id}
            variant={item.variant}
            title={item.title}
            description={item.description}
            duration={item.duration}
            onClose={removeToast}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
