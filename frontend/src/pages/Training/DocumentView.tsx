import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import MarkdownRenderer from "../../components/training/MarkdownRenderer";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { libraryStore } from "../../stores/views/LibraryStore";

/**
 * DocumentView — Vista de lectura de un documento de la Biblioteca.
 *
 * Renderiza el contenido Markdown con estilos prose.
 * Muestra: título, autor, fecha, versión, tags, link externo, archivo.
 */

const DocumentView = observer(() => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      libraryStore.fetchDocumentBySlug(slug);
    }
  }, [slug]);

  const doc = libraryStore.selectedDocument;

  if (libraryStore.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <span className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-400">Documento no encontrado</p>
        <Button className="mt-4" onClick={() => navigate('/library')}>Volver a Biblioteca</Button>
      </div>
    );
  }

  const authorName = typeof doc.author === 'object' ? doc.author.name : '';
  const categoryName = typeof doc.category === 'object' ? doc.category.name : '';

  return (
    <>
      <PageBreadcrumb pageTitle={doc.title} />
      <div className="mx-auto max-w-4xl" data-test-context="document-view-page">
        {/* Botón volver */}
        <button
          onClick={() => navigate('/library')}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
          data-test-key="back-to-library"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Volver a Biblioteca
        </button>

        <div className="rounded-xl bg-white p-8 shadow-1 dark:bg-gray-dark dark:shadow-card">
          {/* Header */}
          <div className="mb-6 border-b border-gray-200 pb-6 dark:border-gray-700" data-test-context="document-header">
            <div className="mb-3 flex items-center gap-2">
              <Badge color="light" data-test-key="category-badge">{categoryName}</Badge>
              <Badge color={doc.published ? "success" : "light"} data-test-key="status-badge">
                {doc.published ? "Publicado" : "Borrador"}
              </Badge>
              {doc.featured && <span className="text-yellow-500">⭐ Destacado</span>}
            </div>

            <h1 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white" data-test-key="doc-title">
              {doc.title}
            </h1>

            {doc.description && (
              <p className="mb-4 text-gray-500 dark:text-gray-400" data-test-key="doc-description">
                {doc.description}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 dark:text-gray-500" data-test-context="document-meta">
              <span data-test-key="author">✍️ {authorName}</span>
              <span data-test-key="version">v{doc.version}</span>
              <span data-test-key="views">👁 {doc.viewCount} vistas</span>
              <span data-test-key="date">
                {new Date(doc.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>

            {/* Tags */}
            {doc.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2" data-test-key="tags">
                {doc.tags.map(tag => (
                  <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* External link */}
          {doc.externalLink && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-500/10" data-test-key="external-link">
              <a href={doc.externalLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-500 hover:text-brand-600">
                🔗 <span className="underline">{doc.externalLink}</span>
              </a>
            </div>
          )}

          {/* File */}
          {doc.fileUrl && (
            <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800" data-test-key="file-attachment">
              <a href={doc.fileUrl} download={doc.fileName} className="flex items-center gap-2 text-brand-500 hover:text-brand-600">
                📎 <span className="underline">{doc.fileName || 'Descargar archivo'}</span>
              </a>
            </div>
          )}

          {/* Content (Markdown) */}
          {doc.content && (
            <div data-test-context="document-content">
              <MarkdownRenderer content={doc.content} />
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default DocumentView;
