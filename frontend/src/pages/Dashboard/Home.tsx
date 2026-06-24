import PageMeta from '../../utils/PageMeta';
import RHMetrics from '../../components/dashboard/RHMetrics';
import TopDivisions from '../../components/dashboard/TopDivisions';
import RecentEmployees from '../../components/dashboard/RecentEmployees';
import EmployeesByStatus from '../../components/dashboard/EmployeesByStatus';

export default function Home() {
  return (
    <>
      <PageMeta title="Dashboard - RH UNLIMITECH" description="Sistema de Gestión de Recursos Humanos" />
      
      <div className="space-y-6">
        {/* Métricas Principales */}
        <RHMetrics />

        {/* Grid de 2 Columnas */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Columna Izquierda - 2/3 del ancho */}
          <div className="xl:col-span-2 space-y-6">
            <TopDivisions />
            <RecentEmployees />
          </div>

          {/* Columna Derecha - 1/3 del ancho */}
          <div className="xl:col-span-1">
            <EmployeesByStatus />
          </div>
        </div>
      </div>
    </>
  );
}
