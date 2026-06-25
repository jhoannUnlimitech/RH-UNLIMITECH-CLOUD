import toast from 'react-hot-toast';

/**
 * Servicio centralizado de notificaciones toast
 * 
 * Uso:
 *   import { notify } from '../utils/toast';
 *   notify.success('Usuario creado exitosamente');
 *   notify.error('Error al crear el usuario');
 */
export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast(message, { icon: 'ℹ️' }),
  warning: (message: string) => toast(message, { icon: '⚠️', style: { background: '#F59E0B', color: '#fff' } }),
  
  /** Toast con promesa (loading → success/error) */
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => toast.promise(promise, messages),
};

export default notify;
