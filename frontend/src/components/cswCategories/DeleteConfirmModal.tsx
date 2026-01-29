import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName: string;
  isDeleting: boolean;
}

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, categoryName, isDeleting }: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Confirmar eliminación
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          ¿Estás seguro de que deseas eliminar la categoría{" "}
          <span className="font-semibold text-gray-900 dark:text-white">"{categoryName}"</span>?
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Esta acción no se puede deshacer. La categoría será marcada como eliminada.
        </p>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={onConfirm} 
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
