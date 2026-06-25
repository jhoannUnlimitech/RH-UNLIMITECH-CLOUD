import { Link } from "react-router";
import PageMeta from "../../utils/PageMeta";

export default function NotFound() {
  return (
    <>
      <PageMeta title="404 - Página no encontrada" description="La página que buscas no existe" />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden">
        <div className="mx-auto w-full max-w-[400px] text-center">
          <h1 className="mb-4 text-[120px] font-bold leading-none text-brand-500 dark:text-brand-400">
            404
          </h1>
          <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">
            Página no encontrada
          </h2>
          <p className="mb-8 text-base text-gray-600 dark:text-gray-400">
            La página que buscas no existe o no tienes acceso.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
        <p className="absolute text-sm text-center text-gray-400 bottom-6">
          &copy; {new Date().getFullYear()} Unlimitech Cloud
        </p>
      </div>
    </>
  );
}
