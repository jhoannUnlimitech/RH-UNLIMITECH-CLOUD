import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { IEmployee } from "../../api/services/employees";
import Badge from "../ui/badge/Badge";
import { getCountryName } from "../../utils/countries";

interface ViewEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: IEmployee | null;
}

const ViewEmployeeModal: React.FC<ViewEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  if (!employee) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="relative w-full max-w-[600px] m-5 sm:m-0 rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900"
    >
      <div>
        {/* Header */}
        <div className="mb-6 flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center gap-4">
            {employee.photo ? (
              <img
                src={employee.photo}
                alt={employee.name}
                className="object-cover w-16 h-16 rounded-full"
              />
            ) : (
              <div className="flex items-center justify-center w-16 h-16 text-xl font-semibold text-white rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
                {employee.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                {employee.name}
              </h4>
              <Badge color="info" className="mt-1.5">
                {employee.role?.name || 'Sin rol'}
              </Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors rounded-lg border border-[#D0D5DD] hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/[0.05] dark:hover:text-gray-300"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Correo Electrónico
            </label>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90 break-all">
              {employee.email}
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Teléfono
            </label>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {employee.phone}
            </p>
          </div>

          {/* National ID */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              Identificación Nacional
            </label>
            <p className="font-mono text-sm font-medium text-gray-800 dark:text-white/90">
              {employee.nationalId}
            </p>
          </div>

          {/* Nationality */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Nacionalidad
            </label>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {getCountryName(employee.nationality)}
            </p>
          </div>

          {/* Birth Date */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Fecha de Nacimiento
            </label>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {new Date(employee.birthDate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Division */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              División
            </label>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {employee.division?.name || 'Sin división'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-gray-100 pt-4 dark:border-gray-800">
          <Button onClick={onClose} variant="secondary">
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewEmployeeModal;
