import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { divisionsStore } from "../../stores/views";
import { Modal } from "../../components/ui/modal";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";

interface DivisionViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  divisionId?: string;
}

const DivisionViewModal = observer(
  ({ isOpen, onClose, divisionId }: DivisionViewModalProps) => {
    // Load division data when modal opens
    useEffect(() => {
      if (isOpen && divisionId) {
        divisionsStore.fetchDivisionById(divisionId);
      }
    }, [isOpen, divisionId]);

    const division = divisionsStore.selectedDivision;

    if (!division) {
      return null;
    }

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="relative w-full max-w-[640px] m-5 sm:m-0 rounded-3xl bg-white p-6 lg:p-10 dark:bg-gray-900"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <h4 className="text-title-sm mb-1 font-semibold text-gray-800 dark:text-white/90">
                {division.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Código: <span className="font-mono font-medium">{division.code}</span>
              </p>
            </div>
            <div className="flex-shrink-0 mt-0.5">
              <Badge color={division.status === "active" ? "success" : "light"}>
                {division.status === "active" ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>

          <div className="space-y-6">
            {/* Manager Information */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                Representante
              </p>
              {division.manager ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/[0.05]">
                  {division.manager.photo ? (
                    <img
                      src={division.manager.photo}
                      alt={division.manager.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                        {division.manager.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-theme-sm font-medium text-gray-900 dark:text-white">
                      {division.manager.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {division.manager.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                  Sin asignar
                </p>
              )}
            </div>

            {/* Description */}
            {division.description && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                  Descripción
                </p>
                <p className="text-theme-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {division.description}
                </p>
              </div>
            )}

            {/* Approval Flow */}
            {division.approvalFlow && division.approvalFlow.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                  Flujo de Aprobación
                </p>
                <div className="space-y-2">
                  {division.approvalFlow.map((level, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/[0.05]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/20">
                          <span className="text-xs font-semibold text-brand-700 dark:text-brand-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-theme-xs font-medium text-gray-700 dark:text-gray-300">
                            Nivel {index + 1}: Aprobación
                          </p>
                          {level.employeeId && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {typeof level.employeeId === "object" && "name" in level.employeeId
                                ? (level.employeeId as any).name
                                : level.employeeName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 space-y-1">
              {division.createdAt && (
                <p>
                  Creado:{" "}
                  {new Date(division.createdAt).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              {division.updatedAt && (
                <p>
                  Actualizado:{" "}
                  {new Date(division.updatedAt).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={onClose}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
);

export default DivisionViewModal;
