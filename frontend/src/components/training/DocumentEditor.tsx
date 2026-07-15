import { useState, useCallback, useRef, useEffect } from "react";
import Switch from "../form/switch/Switch";

/**
 * DocumentEditor — Editor dual para contenido de la Biblioteca.
 *
 * Dos modos alternables con un switch toggle:
 * - Editor Visual: react-quill-new (WYSIWYG)
 * - Markdown Raw: textarea + preview en vivo
 *
 * Siempre guarda como Markdown (fuente única de verdad).
 * La conversión HTML ↔ MD se hace con turndown/marked.
 */

interface DocumentEditorProps {
  value: string; // Contenido en Markdown (source of truth)
  onChange: (markdown: string) => void;
  placeholder?: string;
  minHeight?: string;
  "data-test-context"?: string;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({
  value,
  onChange,
  placeholder = "Escribe el contenido del documento...",
  minHeight = "300px",
  ...props
}) => {
  const [mode, setMode] = useState<"visual" | "markdown">("visual");
  const [htmlContent, setHtmlContent] = useState("");
  const quillRef = useRef<any>(null);
  const [QuillComponent, setQuillComponent] = useState<any>(null);
  const [TurndownService, setTurndownService] = useState<any>(null);
  const [markedParse, setMarkedParse] = useState<any>(null);
  const [ReactMarkdown, setReactMarkdown] = useState<any>(null);
  const [remarkGfm, setRemarkGfm] = useState<any>(null);

  // Lazy load de dependencias pesadas (code splitting)
  useEffect(() => {
    Promise.all([
      import("react-quill-new"),
      import("turndown"),
      import("marked"),
      import("react-markdown"),
      import("remark-gfm"),
    ]).then(([quill, turndown, marked, reactMd, gfm]) => {
      setQuillComponent(() => quill.default);
      setTurndownService(() => new turndown.default({ headingStyle: "atx", codeBlockStyle: "fenced" }));
      setMarkedParse(() => marked.marked);
      setReactMarkdown(() => reactMd.default);
      setRemarkGfm(() => gfm.default);
    });
  }, []);

  // Inicializar htmlContent desde markdown cuando se carga
  useEffect(() => {
    if (markedParse && value && !htmlContent) {
      setHtmlContent(markedParse(value) as string);
    }
  }, [markedParse, value]);

  // Cambiar a modo Markdown: convertir HTML → MD
  const switchToMarkdown = useCallback(() => {
    if (TurndownService && htmlContent) {
      const md = TurndownService.turndown(htmlContent);
      onChange(md);
    }
    setMode("markdown");
  }, [TurndownService, htmlContent, onChange]);

  // Cambiar a modo Visual: cargar MD en el editor
  const switchToVisual = useCallback(() => {
    if (markedParse && value) {
      setHtmlContent(markedParse(value) as string);
    }
    setMode("visual");
  }, [markedParse, value]);

  // Toggle entre modos
  const handleModeToggle = useCallback((checked: boolean) => {
    if (checked) {
      switchToMarkdown();
    } else {
      switchToVisual();
    }
  }, [switchToMarkdown, switchToVisual]);

  // Cuando el editor visual cambia
  const handleQuillChange = useCallback((content: string) => {
    setHtmlContent(content);
    // Convertir a MD y notificar al padre
    if (TurndownService) {
      const md = TurndownService.turndown(content);
      onChange(md);
    }
  }, [TurndownService, onChange]);

  // Cuando el textarea markdown cambia
  const handleMarkdownChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  // Toolbar del editor visual
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link", "image"],
      [{ align: [] }],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header", "bold", "italic", "underline", "strike",
    "list", "blockquote", "code-block",
    "link", "image", "align",
  ];

  // Loading state mientras se cargan las dependencias
  if (!QuillComponent || !TurndownService || !markedParse || !ReactMarkdown) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
        style={{ minHeight }}
        data-test-context={props["data-test-context"]}
      >
        <div className="flex items-center gap-2 text-gray-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
          Cargando editor...
        </div>
      </div>
    );
  }

  return (
    <div data-test-context={props["data-test-context"] || "document-editor"}>
      {/* Toggle switch */}
      <div
        className="mb-3 flex items-center gap-3"
        data-test-context="editor-mode-toggle"
      >
        <span
          className={`text-sm font-medium ${mode === "visual" ? "text-gray-800 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}
          data-test-key="visual-label"
        >
          Editor Visual
        </span>
        <Switch
          defaultChecked={mode === "markdown"}
          onChange={handleModeToggle}
          color="blue"
        />
        <span
          className={`text-sm font-medium ${mode === "markdown" ? "text-gray-800 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}
          data-test-key="markdown-label"
        >
          Markdown
        </span>
      </div>

      {/* Editor Visual (react-quill-new) */}
      {mode === "visual" && (
        <div data-test-context="visual-editor" data-test-state="active">
          <QuillComponent
            ref={quillRef}
            theme="snow"
            value={htmlContent}
            onChange={handleQuillChange}
            modules={quillModules}
            formats={quillFormats}
            placeholder={placeholder}
            style={{ minHeight }}
          />
        </div>
      )}

      {/* Editor Markdown (textarea + preview) */}
      {mode === "markdown" && (
        <div
          className="grid grid-cols-2 gap-4"
          data-test-context="markdown-editor"
          data-test-state="active"
        >
          {/* Textarea raw */}
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              Editar Markdown
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              style={{ minHeight }}
              value={value}
              onChange={handleMarkdownChange}
              placeholder={placeholder}
              data-test-key="markdown-textarea"
            />
          </div>

          {/* Preview */}
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              Vista previa
            </label>
            <div
              className="w-full overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
              style={{ minHeight }}
              data-test-key="markdown-preview"
            >
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {value || "*Sin contenido*"}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentEditor;
