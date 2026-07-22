import { useState } from "react";
import { Modal } from "./index";
import Button from "../button/Button";

/**
 * HardDeleteModal — Modal de eliminación permanente con confirmación por nombre.
 *
 * Basado en el patrón ModalBasedAlerts del template TailAdmin Pro.
 * Requiere que el usuario escriba el nombre exacto del item para confirmar.
 */

interface HardDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
  isLoading?: boolean;
}

const HardDeleteModal: React.FC<HardDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
  isLoading = false,
}) => {
  const [confirmText, setConfirmText] = useState("");
  const isValid = confirmText === itemName;

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  const handleConfirm = () => {
    if (isValid) {
      onConfirm();
      setConfirmText("");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[500px] p-5 lg:p-10">
      <div className="text-center" data-test-context="hard-delete-modal">
        {/* Danger Icon */}
        <div className="relative flex items-center justify-center z-1 mb-7">
          <svg
            className="fill-error-50 dark:fill-error-500/15"
            width="90"
            height="90"
            viewBox="0 0 90 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M34.364 6.85053C38.6205 -2.28351 51.3795 -2.28351 55.636 6.85053C58.0129 11.951 63.5594 14.6722 68.9556 13.3853C78.6192 11.0807 86.5743 21.2433 82.2185 30.3287C79.7862 35.402 81.1561 41.5165 85.5082 45.0122C93.3019 51.2725 90.4628 63.9451 80.7747 66.1403C75.3648 67.3661 71.5265 72.2695 71.5572 77.9156C71.6123 88.0265 60.1169 93.6664 52.3918 87.3184C48.0781 83.7737 41.9219 83.7737 37.6082 87.3184C29.8831 93.6664 18.3877 88.0266 18.4428 77.9156C18.4735 72.2695 14.6352 67.3661 9.22531 66.1403C-0.462787 63.9451 -3.30193 51.2725 4.49185 45.0122C8.84391 41.5165 10.2138 35.402 7.78151 30.3287C3.42572 21.2433 11.3808 11.0807 21.0444 13.3853C26.4406 14.6722 31.9871 11.951 34.364 6.85053Z"
              fill=""
              fillOpacity=""
            />
          </svg>
          <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
            <svg
              className="fill-error-600 dark:fill-error-500"
              width="38"
              height="38"
              viewBox="0 0 38 38"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.62684 11.7496C9.04105 11.1638 9.04105 10.2141 9.62684 9.6283C10.2126 9.04252 11.1624 9.04252 11.7482 9.6283L18.9985 16.8786L26.2485 9.62851C26.8343 9.04273 27.7841 9.04273 28.3699 9.62851C28.9556 10.2143 28.9556 11.164 28.3699 11.7498L21.1198 18.9999L28.3699 26.25C28.9556 26.8358 28.9556 27.7855 28.3699 28.3713C27.7841 28.9571 26.8343 28.9571 26.2485 28.3713L18.9985 21.1212L11.7482 28.3715C11.1624 28.9573 10.2126 28.9573 9.62684 28.3715C9.04105 27.7857 9.04105 26.836 9.62684 26.2502L16.8771 18.9999L9.62684 11.7496Z"
                fill=""
              />
            </svg>
          </span>
        </div>

        {/* Title */}
        <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
          Eliminación Permanente
        </h4>

        {/* Message */}
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          Esta acción es <span className="font-bold text-error-600 dark:text-error-400">IRREVERSIBLE</span>.
          El {itemType} se eliminará de la base de datos permanentemente.
        </p>

        <p className="mb-5 text-sm text-gray-700 dark:text-gray-300">
          {itemType.charAt(0).toUpperCase() + itemType.slice(1)}: <span className="font-semibold">"{itemName}"</span>
        </p>

        {/* Confirmation input */}
        <div className="mb-6 text-left">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Escriba <span className="font-bold text-error-600">"{itemName}"</span> para confirmar:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={itemName}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none dark:bg-gray-800 dark:text-white ${
              confirmText && !isValid
                ? 'border-error-300 focus:border-error-500'
                : 'border-gray-200 focus:border-brand-500 dark:border-gray-700'
            }`}
            data-test-key="confirm-name-input"
          />
          {confirmText && !isValid && (
            <p className="mt-1 text-xs text-error-500">El nombre no coincide</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center w-full gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Eliminando...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M3.75 4.5H14.25M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5M13.5 4.5V15C13.5 15.3978 13.342 15.7794 13.0607 16.0607C12.7794 16.342 12.3978 16.5 12 16.5H6C5.60218 16.5 5.22064 16.342 4.93934 16.0607C4.65804 15.7794 4.5 15.3978 4.5 15V4.5H13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Eliminar Permanentemente
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default HardDeleteModal;
