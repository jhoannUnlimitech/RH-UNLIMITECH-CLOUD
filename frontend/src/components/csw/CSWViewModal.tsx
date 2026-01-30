import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import { cswStore, authStore } from "../../stores/views";
import { ICSWStore } from "../../stores/views/CSWStore.contract";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cswId: string;
  onApprove?: (cswId: string, comments: string) => void;
  onReject?: (cswId: string, comments: string) => void;
  showApprovalActions?: boolean;
}

const CSWViewModal = observer(({ isOpen, onClose, cswId, onApprove, onReject, showApprovalActions }: Props) => {
  const [approvalComments, setApprovalComments] = useState("");
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const csw = cswStore.selectedCSW;
  const currentUserId = authStore.user?.id;

  useEffect(() => {
    if (isOpen && cswId) {
      cswStore.fetchCSWById(cswId);
    }
  }, [isOpen, cswId]);

  // Verificar si el usuario actual es aprobador en el nivel actual
  const isCurrentUserApprover = csw?.approvalChain.some((approval) => {
    const approverId = typeof approval.approverId === 'string' 
      ? approval.approverId 
      : (approval.approverId as any)?._id;
    return approval.level === csw.currentLevel && 
           approverId === currentUserId && 
           approval.status === ICSWStore.ApprovalStatus.PENDING;
  });

  const validateRejectComments = (): boolean => {
    if (!approvalComments.trim()) {
      setCommentsError("Los comentarios son obligatorios para rechazar una solicitud");
      return false;
    }
    setCommentsError("");
    return true;
  };

  const handleApprove = async () => {
    if (!csw || !onApprove) return;
    setCommentsError("");
    setIsSubmittingApproval(true);
    try {
      await onApprove(csw._id, approvalComments);
      setApprovalComments("");
      onClose();
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleReject = async () => {
    if (!csw || !onReject) return;
    
    if (!validateRejectComments()) {
      setIsSubmittingApproval(false);
      return;
    }
    
    setIsSubmittingApproval(true);
    try {
      await onReject(csw._id, approvalComments);
      setApprovalComments("");
      onClose();
    } finally {
      setIsSubmittingApproval(false);
    }
  };

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
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl p-6 sm:p-8 max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="mb-6 border-b border-stroke pb-4 dark:border-dark-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Solicitud CSW-{csw._id}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Creada el {new Date(csw.createdAt).toLocaleString("es-ES")}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Badge color={statusBadge.color}>{statusBadge.text}</Badge>
          </div>
        </div>
      </div>

      <div className="space-y-6 overflow-y-auto flex-1 pr-4">
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

        {/* Approval Section - Show if user is current approver */}
        {isCurrentUserApprover && (
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 dark:border-warning/20 dark:bg-warning/10">
            <h3 className="mb-3 text-lg font-semibold text-warning dark:text-warning">
              Acciones de Aprobación
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Comentarios
                  <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                    (opcional para aprobación, obligatorio para rechazo)
                  </span>
                </label>
                <textarea
                  value={approvalComments}
                  onChange={(e) => {
                    setApprovalComments(e.target.value);
                    setCommentsError("");
                  }}
                  placeholder="Añade tus comentarios sobre esta solicitud..."
                  rows={4}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-dark outline-none transition focus:border-primary disabled:bg-gray-2 disabled:text-gray-4 dark:bg-dark-2 dark:text-white dark:disabled:bg-dark-3 ${
                    commentsError 
                      ? "border-red-500 dark:border-red-400" 
                      : "border-stroke dark:border-dark-3 bg-white dark:bg-dark-2"
                  }`}
                  disabled={isSubmittingApproval}
                />
                {commentsError && (
                  <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                    {commentsError}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  variant="outline"
                  type="button"
                  onClick={onClose}
                  disabled={isSubmittingApproval}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  type="button"
                  onClick={handleReject}
                  disabled={isSubmittingApproval}
                >
                  {isSubmittingApproval ? "Rechazando..." : "Rechazar"}
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  type="button"
                  onClick={handleApprove}
                  disabled={isSubmittingApproval}
                >
                  {isSubmittingApproval ? "Aprobando..." : "Aprobar"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
});

export default CSWViewModal;
