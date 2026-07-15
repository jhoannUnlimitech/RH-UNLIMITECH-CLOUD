import { observer } from "mobx-react-lite";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

/**
 * Library — Página principal de la Biblioteca documental.
 *
 * Vista empleado: categorías como árbol navegable, documentos por categoría,
 * búsqueda por título y tags, docs destacados arriba.
 */

const Library = observer(() => {
  return (
    <>
      <PageBreadcrumb pageTitle="Biblioteca" />
      <div className="rounded-xl bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card" data-test-context="library-page">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white" data-test-key="page-title">
            📚 Biblioteca
          </h2>
        </div>

        <p className="text-gray-500 dark:text-gray-400">
          Repositorio documental central — Cursos, Políticas, Whitepapers y más.
        </p>

        {/* TODO: Implementar CategoryTree + DocumentCards + SearchBar en slice 08 completo */}
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-400 dark:border-gray-600">
          <p>Próximamente: Árbol de categorías + Documentos + Búsqueda</p>
        </div>
      </div>
    </>
  );
});

export default Library;
