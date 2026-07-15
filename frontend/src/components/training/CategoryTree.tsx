import { useState } from "react";
import { observer } from "mobx-react-lite";
import type { LibraryCategory } from "../../api/services/library";

/**
 * CategoryTree — Árbol de categorías navegable con expand/collapse.
 *
 * Cada nodo: ícono + nombre + contador docs.
 * Click navega a la categoría. Admin mode: botones editar/eliminar.
 */

interface CategoryTreeProps {
  categories: LibraryCategory[];
  selectedId?: string;
  onSelect: (category: LibraryCategory) => void;
  onEdit?: (category: LibraryCategory) => void;
  onDelete?: (category: LibraryCategory) => void;
  adminMode?: boolean;
  "data-test-context"?: string;
}

interface TreeNodeProps {
  category: LibraryCategory;
  children: LibraryCategory[];
  allCategories: LibraryCategory[];
  selectedId?: string;
  onSelect: (category: LibraryCategory) => void;
  onEdit?: (category: LibraryCategory) => void;
  onDelete?: (category: LibraryCategory) => void;
  adminMode?: boolean;
  depth: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  category,
  children,
  allCategories,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  adminMode,
  depth,
}) => {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = children.length > 0;
  const isSelected = selectedId === category._id;

  return (
    <div data-test-key={`category-${category.slug}`}>
      <div
        className={`flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
          isSelected
            ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        }`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
        onClick={() => onSelect(category)}
      >
        {/* Expand/collapse arrow */}
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            data-test-key="expand-toggle"
          >
            <svg
              className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`}
              viewBox="0 0 6 10" fill="currentColor"
            >
              <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* Icon */}
        <span className="text-sm">{category.icon || "📁"}</span>

        {/* Name */}
        <span className="flex-1 truncate text-sm font-medium">
          {category.name}
        </span>

        {/* Documents count */}
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {category.documentsCount}
        </span>

        {/* Admin actions */}
        {adminMode && !category.isSystem && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <button
                onClick={() => onEdit(category)}
                className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700"
                data-test-key="edit-btn"
                title="Editar"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(category)}
                className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-500/10"
                data-test-key="delete-btn"
                title="Eliminar"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {children
            .sort((a, b) => a.order - b.order)
            .map((child) => (
              <TreeNode
                key={child._id}
                category={child}
                children={allCategories.filter(c => 
                  (typeof c.parent === 'string' ? c.parent : c.parent?._id) === child._id
                )}
                allCategories={allCategories}
                selectedId={selectedId}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                adminMode={adminMode}
                depth={depth + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
};

const CategoryTree: React.FC<CategoryTreeProps> = observer(({
  categories,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  adminMode = false,
  ...props
}) => {
  // Obtener categorías raíz (sin parent)
  const roots = categories
    .filter(c => !c.parent)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      className="space-y-0.5"
      data-test-context={props["data-test-context"] || "category-tree"}
    >
      {roots.length === 0 && (
        <p className="px-3 py-4 text-center text-sm text-gray-400">
          No hay categorías
        </p>
      )}
      {roots.map((root) => (
        <TreeNode
          key={root._id}
          category={root}
          children={categories.filter(c =>
            (typeof c.parent === 'string' ? c.parent : c.parent?._id) === root._id
          )}
          allCategories={categories}
          selectedId={selectedId}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          adminMode={adminMode}
          depth={0}
        />
      ))}
    </div>
  );
});

export default CategoryTree;
