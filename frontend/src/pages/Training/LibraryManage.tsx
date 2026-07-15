import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import CategoryTree from "../../components/training/CategoryTree";
import DocumentCard from "../../components/training/DocumentCard";
import { libraryStore } from "../../stores/views/LibraryStore";
import type { LibraryCategory, LibraryDocument } from "../../api/services/library";

/**
 * LibraryManage — Vista admin de la Biblioteca.
 *
 * Layout 2 columnas: sidebar con árbol de categorías (CRUD),
 * panel derecho con tabla/grid de documentos de la categoría seleccionada.
 */

const LibraryManage = observer(() => {
  const navigate = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();

  useEffect(() => {
    libraryStore.fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      libraryStore.fetchDocuments({ category: selectedCategoryId });
    } else {
      libraryStore.fetchDocuments();
    }
  }, [selectedCategoryId]);

  const handleSelectCategory = (cat: LibraryCategory) => {
    setSelectedCategoryId(cat._id);
  };

  const handleDocumentClick = (doc: LibraryDocument) => {
    navigate(`/library/documents/edit/${doc._id}`);
  };

  const handlePublish = (doc: LibraryDocument) => {
    libraryStore.publishDocument(doc._id, !doc.published);
  };

  const handleDelete = (doc: LibraryDocument) => {
    if (confirm(`¿Eliminar "${doc.title}"?`)) {
      libraryStore.deleteDocument(doc._id);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Gestión Biblioteca" />
      <div className="flex gap-6" data-test-context="library-manage-page">
        {/* Sidebar: Categorías */}
        <div className="w-64 shrink-0 rounded-xl bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card" data-test-context="categories-sidebar">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Categorías</h3>
            <Button
              size="sm"
              onClick={() => {/* TODO: modal crear categoría */}}
              data-test-key="create-category-btn"
            >
              +
            </Button>
          </div>
          <CategoryTree
            categories={libraryStore.categories}
            selectedId={selectedCategoryId}
            onSelect={handleSelectCategory}
            adminMode={true}
            onEdit={() => {/* TODO: modal editar */}}
            onDelete={(cat) => {
              if (confirm(`¿Eliminar categoría "${cat.name}"?`)) {
                libraryStore.deleteCategory(cat._id);
              }
            }}
          />
        </div>

        {/* Panel derecho: Documentos */}
        <div className="flex-1 rounded-xl bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card" data-test-context="documents-panel">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white" data-test-key="panel-title">
              {selectedCategoryId
                ? `Documentos (${libraryStore.pagination.total})`
                : "Todos los documentos"
              }
            </h2>
            <Button onClick={() => navigate('/library/documents/new')} data-test-key="create-document-btn">
              + Nuevo Documento
            </Button>
          </div>

          {libraryStore.isLoading ? (
            <div className="flex justify-center py-12">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : libraryStore.documents.length === 0 ? (
            <div className="py-12 text-center text-gray-400" data-test-key="empty-state">
              <p>No hay documentos en esta categoría</p>
              <Button className="mt-4" onClick={() => navigate('/library/documents/new')}>
                Crear primer documento
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-test-context="documents-grid">
              {libraryStore.documents.map((doc) => (
                <DocumentCard
                  key={doc._id}
                  document={doc}
                  onClick={handleDocumentClick}
                  onPublish={handlePublish}
                  onDelete={handleDelete}
                  adminMode={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default LibraryManage;
