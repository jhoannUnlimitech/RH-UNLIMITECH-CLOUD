import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Alert from "../ui/alert/Alert";
import { cswStore } from "../../stores/views";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cswId: string;
  cswNumber: string; // Nombre del solicitante
}

const DeleteConfirmModal = observer(({ isOpen, onClose, cswId, cswNumber }: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    try {
      await cswStore.deleteCSW(cswId);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar la solicitud");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Confirmar Eliminación
        </h2>
      </div>

      {error && (
        <Alert
          variant="error"
          title="Error"
          message={error}
        />
      )}

      <p className="mb-6 text-gray-600 dark:text-gray-400">
        ¿Está seguro que desea eliminar la solicitud de <strong>{cswNumber}</strong>?
        Esta acción no se puede deshacer.
      </p>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isDeleting}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="!bg-error-500 hover:!bg-error-600"
        >
          {isDeleting ? "Eliminando..." : "Eliminar"}
        </Button>
      </div>
    </Modal>
  );
});

export default DeleteConfirmModal;
