import { observer } from "mobx-react-lite";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

/**
 * TrainingManage — Gestión de Cursos, Niveles e Insignias (admin).
 *
 * 3 tabs: Insignias (grid BadgeIcon), Niveles (tabla), Cursos (tabla).
 * CRUD modal en cada tab. Reordenar con drag & drop.
 */

const TrainingManage = observer(() => {
  return (
    <>
      <PageBreadcrumb pageTitle="Gestión Training" />
      <div className="rounded-xl bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card" data-test-context="training-manage-page">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white" data-test-key="page-title">
            ⚙️ Gestión de Training
          </h2>
        </div>

        <p className="text-gray-500 dark:text-gray-400">
          Administra Insignias, Niveles y Cursos del sistema de capacitación.
        </p>

        {/* TODO: Implementar Tabs (Insignias/Niveles/Cursos) + CRUD modals */}
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-400 dark:border-gray-600">
          <p>Próximamente: Tabs con BadgeGrid + LevelsTable + CoursesTable</p>
        </div>
      </div>
    </>
  );
});

export default TrainingManage;
