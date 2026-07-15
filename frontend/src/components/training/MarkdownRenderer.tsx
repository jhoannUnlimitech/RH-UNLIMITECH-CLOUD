import { useEffect, useState } from "react";

/**
 * MarkdownRenderer — Renderiza contenido Markdown con estilos prose.
 *
 * Lazy-loads react-markdown y remark-gfm para code splitting.
 * Soporta: headers, bold, italic, listas, tablas, código, links, imágenes.
 */

interface MarkdownRendererProps {
  content: string;
  className?: string;
  "data-test-key"?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
  ...props
}) => {
  const [ReactMarkdown, setReactMarkdown] = useState<any>(null);
  const [remarkGfm, setRemarkGfm] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      import("react-markdown"),
      import("remark-gfm"),
    ]).then(([reactMd, gfm]) => {
      setReactMarkdown(() => reactMd.default);
      setRemarkGfm(() => gfm.default);
    });
  }, []);

  if (!ReactMarkdown || !remarkGfm) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>
    );
  }

  return (
    <div
      className={`prose prose-sm dark:prose-invert max-w-none
        prose-headings:text-gray-800 dark:prose-headings:text-white
        prose-p:text-gray-600 dark:prose-p:text-gray-300
        prose-a:text-brand-500 hover:prose-a:text-brand-600
        prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5
        dark:prose-code:bg-gray-800
        prose-pre:bg-gray-900 prose-pre:text-gray-100
        prose-table:border prose-table:border-gray-200 dark:prose-table:border-gray-700
        prose-th:bg-gray-50 dark:prose-th:bg-gray-800
        prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700
        ${className}`}
      data-test-key={props["data-test-key"] || "markdown-content"}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content || ""}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
