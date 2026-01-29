import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
  isLoading: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
  isLoading,
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
          ¿Está seguro de eliminar este {itemType}?
        </h4>

        {/* Message */}
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
          Está a punto de eliminar el {itemType}:
        </p>
        <p className="mb-6 text-base font-semibold text-gray-900 dark:text-white">
          "{itemName}"
        </p>
        <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          El {itemType} será marcado como eliminado pero podrá ser restaurado posteriormente.
          Esta acción no se puede deshacer fácilmente.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isLoading}
            className="order-2 sm:order-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="order-1 sm:order-2 bg-red-600 hover:bg-red-700 focus:ring-red-500/10 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Eliminando...</span>
              </div>
            ) : (
              <>
                <svg
                  className="mr-2"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.75 4.5H14.25M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5M13.5 4.5V15C13.5 15.3978 13.342 15.7794 13.0607 16.0607C12.7794 16.342 12.3978 16.5 12 16.5H6C5.60218 16.5 5.22064 16.342 4.93934 16.0607C4.65804 15.7794 4.5 15.3978 4.5 15V4.5H13.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Eliminar
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
