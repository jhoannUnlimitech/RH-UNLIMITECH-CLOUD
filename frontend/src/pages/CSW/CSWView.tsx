import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { cswStore, authStore } from "../../stores/views";
import { ICSWStore } from "../../stores/views/CSWStore.contract";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const CSWView = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [approvalComments, setApprovalComments] = useState("");
  const [commentsError, setCommentsError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      cswStore.fetchCSWById(id);
    }
  }, [id]);

  const csw = cswStore.selectedCSW;
  const currentUserId = authStore.user?._id;

  const validateRejectComments = (): boolean => {
    if (!approvalComments.trim()) {
      setCommentsError("Los comentarios son obligatorios para rechazar una solicitud");
      return false;
    }
    setCommentsError("");
    return true;
  };

  const handleApprove = async () => {
    if (!csw || !id) return;
    setCommentsError("");
    setIsSubmitting(true);
    try {
      await cswStore.approveCSW(id, csw.currentLevel, approvalComments || undefined);
      navigate("/csw/pending");
    } catch (error) {
      console.error("Error al aprobar solicitud:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!csw || !id) return;
    
    if (!validateRejectComments()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await cswStore.rejectCSW(id, csw.currentLevel, approvalComments);
      navigate("/csw/pending");
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!csw) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  // Verificar si el usuario actual es aprobador en el nivel actual
  const isCurrentUserApprover = csw.approvalChain.some((approval) => {
    const approverId = typeof approval.approverId === 'string' 
      ? approval.approverId 
      : (approval.approverId as any)?._id;
    return approval.level === csw.currentLevel && 
           approverId === currentUserId && 
           approval.status === ICSWStore.ApprovalStatus.PENDING;
  });

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
    <>
      <PageBreadcrumb pageTitle={`CSW-${csw._id}`} />

      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-dark-3 dark:bg-dark-2">
        {/* Header */}
        <div className="border-b border-stroke px-6 py-4 dark:border-dark-3 sm:px-8">
          <div className="flex items-start justify-between gap-4">
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

        {/* Content */}
        <div className="px-6 py-8 sm:px-8">
          <div className="space-y-8">
            {/* Requester Information */}
            <div className="rounded-lg border border-stroke bg-gray-2 p-4 dark:border-dark-3 dark:bg-dark-2">
              <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
                Información del Solicitante
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

            {/* Details */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Categoría
                </h3>
                <p className="text-base font-medium text-dark dark:text-white">{categoryName}</p>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Progreso
                </h3>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {csw.approvalChain.filter(a => a.status === ICSWStore.ApprovalStatus.APPROVED).length}/{csw.approvalChain.length}
                  </div>
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-full transition-all ${
                        csw.status === ICSWStore.CSWStatus.APPROVED 
                          ? 'bg-green-500' 
                          : csw.status === ICSWStore.CSWStatus.REJECTED 
                          ? 'bg-red-500'
                          : 'bg-primary'
                      }`}
                      style={{ width: `${(csw.approvalChain.filter(a => a.status === ICSWStore.ApprovalStatus.APPROVED).length / csw.approvalChain.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Situation, Information, Solution */}
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-dark dark:text-white">
                  Situación
                </h3>
                <p className="whitespace-pre-wrap text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  {csw.situation}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-dark dark:text-white">
                  Información
                </h3>
                <p className="whitespace-pre-wrap text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  {csw.information}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-dark dark:text-white">
                  Solución Propuesta
                </h3>
                <p className="whitespace-pre-wrap text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  {csw.solution}
                </p>
              </div>
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
                      <div className="flex items-start justify-between gap-4">
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
                {csw.history?.map((entry, index) => (
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
        </div>

        {/* Footer with Actions */}
        <div className="border-t border-stroke px-6 py-4 dark:border-dark-3 sm:px-8">
          {isCurrentUserApprover && csw.status === ICSWStore.CSWStatus.PENDING ? (
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
                  className={`w-full rounded-lg border px-4 py-3 text-sm text-dark outline-none transition focus:border-primary disabled:bg-gray-2 disabled:text-gray-4 dark:bg-dark-2 dark:text-white dark:disabled:bg-dark-3 ${
                    commentsError 
                      ? "border-red-500 dark:border-red-400" 
                      : "border-stroke dark:border-dark-3 bg-white dark:bg-dark-2"
                  }`}
                  disabled={isSubmitting}
                />
                {commentsError && (
                  <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                    {commentsError}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  Volver
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleReject}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Rechazando..." : "Rechazar"}
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Aprobando..." : "Aprobar"}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Volver
            </Button>
          )}
        </div>
      </div>
    </>
  );
});

export default CSWView;
