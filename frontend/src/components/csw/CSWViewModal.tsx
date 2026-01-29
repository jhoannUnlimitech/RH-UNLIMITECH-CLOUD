import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Modal } from "../ui/modal";
import Badge from "../ui/badge/Badge";
import { cswStore } from "../../stores/views";
import { ICSWStore } from "../../stores/views/CSWStore.contract";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cswId: string;
}

const CSWViewModal = observer(({ isOpen, onClose, cswId }: Props) => {
  useEffect(() => {
    if (isOpen && cswId) {
      cswStore.fetchCSWById(cswId);
    }
  }, [isOpen, cswId]);

  const csw = cswStore.selectedCSW;

  if (!csw) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-6 sm:p-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </Modal>
    );
  }

  const getStatusBadge = (status: ICSWStore.CSWStatus) => {
    const statusConfig = {
      [ICSWStore.CSWStatus.PENDING]: { text: "Pendiente", color: "warning" as const },
      [ICSWStore.CSWStatus.APPROVED]: { text: "Aprobada", color: "success" as const },
      [ICSWStore.CSWStatus.REJECTED]: { text: "Rechazada", color: "error" as const },
      [ICSWStore.CSWStatus.CANCELLED]: { text: "Cancelada", color: "light" as const },
    };
    return statusConfig[status] || { text: status, color: "light" as const };
  };

  const getApprovalStatusBadge = (status: ICSWStore.ApprovalStatus) => {
    const statusConfig = {
      [ICSWStore.ApprovalStatus.PENDING]: { text: "Pendiente", color: "warning" as const },
      [ICSWStore.ApprovalStatus.APPROVED]: { text: "Aprobado", color: "success" as const },
      [ICSWStore.ApprovalStatus.REJECTED]: { text: "Rechazado", color: "error" as const },
    };
    return statusConfig[status] || { text: status, color: "light" as const };
  };

  const statusBadge = getStatusBadge(csw.status);
  const categoryName = typeof csw.category === 'object' ? csw.category.name : 'Sin categoría';

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 border-b border-stroke pb-4 dark:border-dark-3">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Solicitud CSW-{csw._id}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Creada el {new Date(csw.createdAt).toLocaleString("es-ES")}
            </p>
          </div>
          <Badge color={statusBadge.color}>{statusBadge.text}</Badge>
        </div>
      </div>

      <div className="space-y-6">
        {/* Requester Information */}
        <div className="rounded-lg border border-stroke bg-gray-2 p-4 dark:border-dark-3 dark:bg-dark-2">
          <h3 className="mb-3 text-lg font-semibold text-dark dark:text-white">
            Información del Solicitante
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
              <p className="font-medium text-dark dark:text-white">{csw.requesterName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Posición</p>
              <p className="font-medium text-dark dark:text-white">{csw.requesterPosition}</p>
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            Categoría
          </h3>
          <p className="text-base text-dark dark:text-white">{categoryName}</p>
        </div>

        {/* Situation */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            Situación
          </h3>
          <p className="whitespace-pre-wrap text-base text-dark dark:text-white">
            {csw.situation}
          </p>
        </div>

        {/* Information */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            Información
          </h3>
          <p className="whitespace-pre-wrap text-base text-dark dark:text-white">
            {csw.information}
          </p>
        </div>

        {/* Solution */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            Solución Propuesta
          </h3>
          <p className="whitespace-pre-wrap text-base text-dark dark:text-white">
            {csw.solution}
          </p>
        </div>

        {/* Approval Chain */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
            Cadena de Aprobación
          </h3>
          <div className="space-y-3">
            {csw.approvalChain.map((approval) => {
              const badge = getApprovalStatusBadge(approval.status);
              return (
                <div
                  key={approval.level}
                  className="rounded-lg border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-dark-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                          {approval.level}
                        </div>
                        <div>
                          <p className="font-semibold text-dark dark:text-white">
                            {approval.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {approval.approverName} - {approval.approverPosition}
                          </p>
                        </div>
                      </div>
                      {approval.comments && (
                        <div className="mt-3 ml-11">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Comentarios:</span> {approval.comments}
                          </p>
                        </div>
                      )}
                      {approval.approvedAt && (
                        <div className="mt-2 ml-11">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(approval.approvedAt).toLocaleString("es-ES")}
                          </p>
                        </div>
                      )}
                    </div>
                    <Badge color={badge.color}>{badge.text}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* History */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
            Historial de Acciones
          </h3>
          <div className="space-y-3">
            {csw.history.map((entry, index) => (
              <div
                key={index}
                className="flex gap-3 rounded-lg border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-dark-2"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-dark dark:text-white">{entry.action}</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Por {entry.performedByName}
                  </p>
                  {entry.comments && (
                    <p className="mt-2 text-sm italic text-gray-600 dark:text-gray-400">
                      "{entry.comments}"
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(entry.performedAt).toLocaleString("es-ES")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
});

export default CSWViewModal;
