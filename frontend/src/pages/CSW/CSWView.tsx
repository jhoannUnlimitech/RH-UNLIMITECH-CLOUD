import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { cswStore, authStore } from "../../stores/views";
import { ICSWStore } from "../../stores/views/CSWStore.contract";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { formatCSWTitle, cswStatusConfig } from "../../utils/csw";

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
      [ICSWStore.CSWStatus.DRAFT]: { text: "Borrador", color: "light" as const },
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
  const formattedTitle = formatCSWTitle(csw);

  return (
    <>
      <PageBreadcrumb pageTitle={formattedTitle} />

      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-dark-3 dark:bg-dark-2" data-test-context="csw-view">
        {/* Header */}
        <div className="border-b border-stroke px-6 py-4 dark:border-dark-3 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white" data-test-key="csw-title">
                Solicitud {formattedTitle}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Creada el {new Date(csw.createdAt).toLocaleString("es-ES")}
              </p>
            </div>
            <Badge color={statusBadge.color} data-test-key="status-badge" data-test-state={csw.status}>{statusBadge.text}</Badge>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8 sm:px-8">
          <div className="space-y-8">
            {/* Requester Information */}
            <div className="rounded-lg border border-stroke bg-gray-2 p-4 dark:border-dark-3 dark:bg-dark-2" data-test-context="requester-info">
              <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
                Información del Solicitante
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
                  <p className="font-medium text-dark dark:text-white" data-test-key="requester-name">{csw.requesterName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Posición</p>
                  <p className="font-medium text-dark dark:text-white" data-test-key="requester-position">{csw.requesterPosition}</p>
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
                      className={`h-full rounded-full transition-all ${
                        csw.status === ICSWStore.CSWStatus.APPROVED 
                          ? 'bg-green-500' 
                          : csw.status === ICSWStore.CSWStatus.REJECTED 
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${csw.approvalChain.length > 0 ? (csw.approvalChain.filter(a => a.status === ICSWStore.ApprovalStatus.APPROVED).length / csw.approvalChain.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Situation, Information, Solution */}
            <div className="space-y-6" data-test-context="csw-content">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-dark dark:text-white">
                  Situación
                </h3>
                <p className="whitespace-pre-wrap break-words text-base text-gray-700 dark:text-gray-300 leading-relaxed overflow-hidden" data-test-key="situation-text">
                  {csw.situation}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-dark dark:text-white">
                  Información
                </h3>
                <p className="whitespace-pre-wrap break-words text-base text-gray-700 dark:text-gray-300 leading-relaxed overflow-hidden" data-test-key="information-text">
                  {csw.information}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-dark dark:text-white">
                  Solución Propuesta
                </h3>
                <p className="whitespace-pre-wrap break-words text-base text-gray-700 dark:text-gray-300 leading-relaxed overflow-hidden" data-test-key="solution-text">
                  {csw.solution}
                </p>
              </div>
            </div>

            {/* Approval Chain */}
            <div data-test-context="approval-chain">
              <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
                Cadena de Aprobación
              </h3>
              <div className="space-y-3">
                {csw.approvalChain.map((approval) => {
                  const statusStyles = {
                    [ICSWStore.ApprovalStatus.PENDING]: {
                      border: "border-orange-200 dark:border-orange-800",
                      bg: "bg-orange-50 dark:bg-orange-900/10",
                      iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
                      badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                      label: "Pendiente",
                      icon: (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ),
                    },
                    [ICSWStore.ApprovalStatus.APPROVED]: {
                      border: "border-green-200 dark:border-green-800",
                      bg: "bg-green-50 dark:bg-green-900/10",
                      iconBg: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                      badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                      label: "Aprobado",
                      icon: (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ),
                    },
                    [ICSWStore.ApprovalStatus.REJECTED]: {
                      border: "border-red-200 dark:border-red-800",
                      bg: "bg-red-50 dark:bg-red-900/10",
                      iconBg: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                      badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                      label: "Rechazado",
                      icon: (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ),
                    },
                  };

                  const style = statusStyles[approval.status] || statusStyles[ICSWStore.ApprovalStatus.PENDING];

                  return (
                    <div
                      key={approval.level}
                      className={`rounded-lg border p-4 ${style.border} ${style.bg}`}
                      data-test-key={`approval-level-${approval.level}`}
                      data-test-state={approval.status}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${style.iconBg}`}>
                            {style.icon}
                          </div>
                          <div>
                            <p className="font-semibold text-dark dark:text-white">
                              {approval.approverName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {approval.name} • {approval.approverPosition}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
                          {style.label}
                        </span>
                      </div>
                      {approval.comments && (
                        <div className="mt-3 ml-12">
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            "{approval.comments}"
                          </p>
                        </div>
                      )}
                      {approval.approvedAt && (
                        <div className="mt-1 ml-12">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(approval.approvedAt).toLocaleString("es-ES")}
                          </p>
                        </div>
                      )}
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
                {csw.history?.map((entry, index) => {
                  // Traducción y config de cada acción
                  const actionConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
                    created: {
                      label: "Creada",
                      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                      icon: (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      ),
                    },
                    submitted: {
                      label: "Enviada",
                      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
                      icon: (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      ),
                    },
                    edited: {
                      label: "Editada",
                      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
                      icon: (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      ),
                    },
                    approved: {
                      label: "Aprobada",
                      color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                      icon: (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ),
                    },
                    rejected: {
                      label: "Rechazada",
                      color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                      icon: (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ),
                    },
                    cancelled: {
                      label: "Cancelada",
                      color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                      icon: (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      ),
                    },
                    status_changed: {
                      label: "Cambio de estado",
                      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
                      icon: (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ),
                    },
                    completed: {
                      label: "Completada",
                      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
                      icon: (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ),
                    },
                  };

                  const config = actionConfig[entry.action] || {
                    label: entry.action,
                    color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                    icon: (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                  };

                  return (
                    <div
                      key={index}
                      className="flex gap-3 rounded-lg border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-dark-2"
                    >
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${config.color}`}>
                        {config.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
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
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="border-t border-stroke px-6 py-4 dark:border-dark-3 sm:px-8">
          {isCurrentUserApprover && csw.status === ICSWStore.CSWStatus.PENDING ? (
            <div className="space-y-4" data-test-context="approval-actions">
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
                  data-test-key="comments-textarea"
                  className={`w-full rounded-lg border px-4 py-3 text-sm text-dark outline-none transition focus:border-primary disabled:bg-gray-2 disabled:text-gray-4 dark:bg-dark-2 dark:text-white dark:disabled:bg-dark-3 ${
                    commentsError 
                      ? "border-red-500 dark:border-red-400" 
                      : "border-stroke dark:border-dark-3 bg-white dark:bg-dark-2"
                  }`}
                  disabled={isSubmitting}
                />
                {commentsError && (
                  <p className="mt-2 text-sm text-red-500 dark:text-red-400" data-test-key="comments-error">
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
                  data-test-key="reject-button"
                  data-test-state={isSubmitting ? "loading" : "ready"}
                >
                  {isSubmitting ? "Rechazando..." : "Rechazar"}
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  data-test-key="approve-button"
                  data-test-state={isSubmitting ? "loading" : "ready"}
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
