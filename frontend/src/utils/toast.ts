import { addToast } from '../components/ui/toast/ToastContainer';

/**
 * Servicio centralizado de notificaciones toast
 * Usa el componente Notification de TailAdmin Pro
 * 
 * Uso:
 *   import { notify } from '../utils/toast';
 *   notify.success('Empleado creado exitosamente');
 *   notify.error('Error al crear el empleado');
 */
export const notify = {
  success: (title: string, description?: string) =>
    addToast({ variant: 'success', title, description, duration: 4000 }),

  error: (title: string, description?: string) =>
    addToast({ variant: 'error', title, description, duration: 5000 }),

  info: (title: string, description?: string) =>
    addToast({ variant: 'info', title, description, duration: 4000 }),

  warning: (title: string, description?: string) =>
    addToast({ variant: 'warning', title, description, duration: 4500 }),
};

export default notify;
