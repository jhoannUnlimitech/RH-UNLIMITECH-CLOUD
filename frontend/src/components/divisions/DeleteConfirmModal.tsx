import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  divisionName: string;
  isDeleting: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  divisionName,
  isDeleting,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="relative w-full max-w-[500px] m-5 sm:m-0 rounded-3xl bg-white p-6 lg:p-10 dark:bg-gray-900"
    >
      <div className="text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <svg
            className="h-7 w-7 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h4 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
          ¿Está seguro de eliminar esta división?
        </h4>

        {/* Message */}
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
          Está a punto de eliminar la división:
        </p>
        <p className="mb-6 text-base font-semibold text-gray-900 dark:text-white">
          "{divisionName}"
        </p>
        <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          La división será marcada como eliminada pero podrá ser restaurada posteriormente.
          Esta acción no se puede deshacer fácilmente.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isDeleting}
            className="order-2 sm:order-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="order-1 sm:order-2 bg-red-600 hover:bg-red-700 focus:ring-red-500/10 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Eliminando...</span>
              </div>
            ) : (
              "Sí, eliminar"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
