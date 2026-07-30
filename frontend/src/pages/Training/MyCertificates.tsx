import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Award, Download, FileText, Calendar } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import apiClient from "../../api/client";

/**
 * MyCertificates — Página del empleado para ver sus certificados obtenidos.
 */

interface Certificate {
  _id: string;
  type: 'level' | 'badge';
  title: string;
  referenceName: string;
  variables: {
    employeeName: string;
    completedDate: string;
    totalHours: number;
    levelName?: string;
    badgeName?: string;
    examScore?: number;
  };
  issuedAt: string;
}

const MyCertificates = observer(() => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<{ success: boolean; data: Certificate[] }>('/training/certificates/me')
      .then(res => setCertificates(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <PageBreadcrumb pageTitle="Mis Certificados" />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Mis Certificados" />
      <div data-test-context="my-certificates-page">
        {certificates.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-1 dark:bg-gray-dark">
            <Award size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-sm text-gray-400">Aún no tienes certificados. Completa niveles y aprueba exámenes para obtenerlos.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map(cert => (
              <div key={cert._id} className="rounded-xl bg-white p-5 shadow-1 dark:bg-gray-dark" data-test-key={`certificate-${cert._id}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cert.type === 'badge' ? 'bg-yellow-50 text-yellow-600' : 'bg-brand-50 text-brand-600'}`}>
                    {cert.type === 'badge' ? <Award size={20} /> : <FileText size={20} />}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cert.type === 'badge' ? 'bg-yellow-100 text-yellow-700' : 'bg-brand-100 text-brand-700'}`}>
                    {cert.type === 'badge' ? 'Insignia' : 'Nivel'}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">{cert.title}</h4>
                <p className="text-xs text-gray-500 mb-3">{cert.referenceName}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(cert.issuedAt).toLocaleDateString('es-ES')}</span>
                  {cert.variables.examScore && <span>{cert.variables.examScore}%</span>}
                </div>
                <button
                  onClick={() => window.open(`/api/v1/training/certificates/${cert._id}/download`, '_blank')}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  data-test-key="download-btn"
                >
                  <Download size={14} /> Descargar Certificado
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
});

export default MyCertificates;
