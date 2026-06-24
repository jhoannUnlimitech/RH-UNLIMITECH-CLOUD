import { observer } from "mobx-react-lite";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  isDeleting?: boolean;
  warningMessage?: string;
}

const DeleteConfirmModal = observer(
  ({ isOpen, onClose, onConfirm, itemName, isDeleting = false, warningMessage }: DeleteConfirmModalProps) => {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="relative w-full max-w-[500px] m-5 sm:m-0 rounded-3xl bg-white p-6 lg:p-10 dark:bg-gray-900"
      >
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 text-center dark:text-white">
            Confirmar eliminación
          </h3>
        </div>
        <div className="space-y-4">
          {/* Warning Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-900/20">
            <svg
              className="w-6 h-6 text-red-600 dark:text-red-400"
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

          {/* Message */}
          <div className="text-center">
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
              ¿Estás seguro de que deseas eliminar
            </p>
            <p className="mb-3 text-base font-semibold text-gray-900 dark:text-white">{itemName}?</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {warningMessage || "Esta acción no se puede deshacer."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500/20 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
);

export default DeleteConfirmModal;
