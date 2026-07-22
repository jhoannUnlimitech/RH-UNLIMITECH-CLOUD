import type { LibraryDocument } from "../../api/services/library";
import { FileText, ExternalLink, Paperclip, Package, Star, Eye } from "lucide-react";

/**
 * DocumentCard — Card visual de un documento de la Biblioteca.
 *
 * Muestra: título, tipo (ícono), estado (publicado/borrador), categoría,
 * fecha, vistas. Click navega al documento.
 */

interface DocumentCardProps {
  document: LibraryDocument;
  onClick: (doc: LibraryDocument) => void;
  onPublish?: (doc: LibraryDocument) => void;
  onDelete?: (doc: LibraryDocument) => void;
  onRestore?: (doc: LibraryDocument) => void;
  onHardDelete?: (doc: LibraryDocument) => void;
  adminMode?: boolean;
  isDeletedView?: boolean;
  "data-test-key"?: string;
}

const TYPE_ICONS: Record<string, { icon: string; label: string }> = {
  article: { icon: "file-text", label: "Artículo" },
  link: { icon: "external-link", label: "Link" },
  file: { icon: "paperclip", label: "Archivo" },
  mixed: { icon: "package", label: "Mixto" },
};

const TYPE_ICON_COMPONENTS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  article: FileText,
  link: ExternalLink,
  file: Paperclip,
  mixed: Package,
};

function TypeIcon({ type }: { type: string }) {
  const Icon = TYPE_ICON_COMPONENTS[type] || FileText;
  return <Icon size={18} className="text-gray-400" />;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onClick,
  onPublish,
  onDelete,
  onRestore,
  onHardDelete,
  adminMode = false,
  isDeletedView = false,
  ...props
}) => {
  const typeInfo = TYPE_ICONS[document.type] || TYPE_ICONS.article;
  const categoryName = typeof document.category === 'object' ? document.category.name : '';

  return (
    <div
      className="group cursor-pointer rounded-xl border border-gray-100 bg-white p-3 transition-all hover:border-brand-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-500/30"
      onClick={() => onClick(document)}
      data-test-key={props["data-test-key"] || `doc-${document.slug}`}
    >
      {/* Header: tipo + estado */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TypeIcon type={document.type} />
          <span className="text-xs text-gray-400 dark:text-gray-500">{typeInfo.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {document.featured && (
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
          )}
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              document.published
                ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            }`}
            data-test-key="status-badge"
          >
            {document.published ? "Publicado" : "Borrador"}
          </span>
        </div>
      </div>

      {/* Título */}
      <h4
        className="mb-1 text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-brand-500 dark:text-white dark:group-hover:text-brand-400"
        data-test-key="doc-title"
      >
        {document.title}
      </h4>

      {/* Descripción */}
      {document.description && (
        <p className="mb-2 text-xs text-gray-500 line-clamp-1 dark:text-gray-400">
          {document.description}
        </p>
      )}

      {/* Tags */}
      {document.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {document.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
          {document.tags.length > 3 && (
            <span className="text-[10px] text-gray-400">+{document.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer: categoría + vistas + fecha */}
      <div className="flex items-center justify-between border-t border-gray-50 pt-2 text-[11px] text-gray-400 dark:border-gray-700 dark:text-gray-500">
        <span>{categoryName}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-0.5"><Eye size={11} /> {document.viewCount}</span>
          <span>{new Date(document.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</span>
        </div>
      </div>

      {/* Admin actions */}
      {adminMode && (
        <div
          className="mt-3 flex gap-2 border-t border-gray-100 pt-3 opacity-0 transition-opacity group-hover:opacity-100 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {isDeletedView ? (
            <>
              {onRestore && (
                <button
                  onClick={() => onRestore(document)}
                  className="text-xs text-green-600 hover:text-green-700"
                  data-test-key="restore-btn"
                >
                  Restaurar
                </button>
              )}
              {onHardDelete && (
                <button
                  onClick={() => onHardDelete(document)}
                  className="text-xs text-red-500 hover:text-red-600"
                  data-test-key="hard-delete-btn"
                >
                  Eliminar permanentemente
                </button>
              )}
            </>
          ) : (
            <>
              {onPublish && (
                <button
                  onClick={() => onPublish(document)}
                  className="text-xs text-brand-500 hover:text-brand-600"
                  data-test-key="publish-btn"
                >
                  {document.published ? "Despublicar" : "Publicar"}
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(document)}
                  className="text-xs text-red-500 hover:text-red-600"
                  data-test-key="delete-btn"
                >
                  Eliminar
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
