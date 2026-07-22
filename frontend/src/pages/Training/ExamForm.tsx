import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { Plus, ChevronUp, ChevronDown, Trash2, GripVertical } from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { trainingService } from "../../api/services/training";
import type { Exam, ExamQuestion, ExamOption, Level, Course } from "../../api/services/training";
import { notify } from "../../utils/toast";

/**
 * ExamForm — Crear/Editar examen con preguntas dinámicas y reorder.
 *
 * Permite agregar preguntas de selección múltiple u open_text,
 * reordenar con ↑↓, y gestionar opciones de cada pregunta.
 */

interface QuestionFormData extends Omit<ExamQuestion, '_id'> {
  tempId: string; // ID temporal para React keys
}

const generateTempId = () => Math.random().toString(36).slice(2, 10);

const ExamForm = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [levels, setLevels] = useState<Level[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    associationType: "level" as "level" | "course" | "document",
    level: "",
    course: "",
    libraryDocument: "",
    passingScore: 80,
    maxAttempts: 1,
  });

  const [questions, setQuestions] = useState<QuestionFormData[]>([]);

  // Cargar niveles y cursos disponibles
  useEffect(() => {
    trainingService.getLevels({ active: 'true' }).then(setLevels);
    trainingService.getCourses({ active: 'true' }).then(setCourses);
  }, []);

  // Cargar examen si es edición
  useEffect(() => {
    if (isEditing && id) {
      trainingService.getExamById(id).then(exam => {
        setFormData({
          title: exam.title,
          description: exam.description || "",
          level: typeof exam.level === 'object' ? exam.level._id : exam.level,
          passingScore: exam.passingScore,
          maxAttempts: exam.maxAttempts,
        });
        setQuestions(exam.questions.map(q => ({
          ...q,
          tempId: q._id || generateTempId(),
        })));
      }).catch(() => {
        notify.error("Error cargando examen");
        navigate('/training/manage');
      });
    }
  }, [id, isEditing, navigate]);

  // ─── Handlers de preguntas ────────────────────────────────────────────────

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      tempId: generateTempId(),
      question: "",
      type: "multiple_choice",
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
      ],
      points: 10,
      order: prev.length,
    }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((q, i) => ({ ...q, order: i }));
    });
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    setQuestions(prev => {
      const newArr = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newArr.length) return prev;
      [newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
      return newArr.map((q, i) => ({ ...q, order: i }));
    });
  };

  const moveQuestionDnD = useCallback((dragIndex: number, hoverIndex: number) => {
    setQuestions(prev => {
      const newArr = [...prev];
      const [dragged] = newArr.splice(dragIndex, 1);
      newArr.splice(hoverIndex, 0, dragged);
      return newArr.map((q, i) => ({ ...q, order: i }));
    });
  }, []);

  const updateQuestion = (index: number, field: string, value: any) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== index) return q;
      const updated = { ...q, [field]: value };
      // Si cambia tipo, resetear campos específicos
      if (field === 'type') {
        if (value === 'multiple_choice') {
          updated.options = [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
          ];
          updated.expectedAnswer = undefined;
        } else {
          updated.options = undefined;
          updated.expectedAnswer = "";
        }
      }
      return updated;
    }));
  };

  // ─── Handlers de opciones ─────────────────────────────────────────────────

  const addOption = (questionIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== questionIndex) return q;
      return { ...q, options: [...(q.options || []), { text: "", isCorrect: false }] };
    }));
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== questionIndex || !q.options) return q;
      return { ...q, options: q.options.filter((_, oi) => oi !== optionIndex) };
    }));
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: string, value: any) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== questionIndex || !q.options) return q;
      const newOptions = q.options.map((opt, oi) => {
        if (oi !== optionIndex) {
          // Si se está marcando como correcta, desmarcar las otras
          if (field === 'isCorrect' && value === true) return { ...opt, isCorrect: false };
          return opt;
        }
        return { ...opt, [field]: value };
      });
      return { ...q, options: newOptions };
    }));
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!formData.title.trim()) { notify.error("El título es requerido"); return; }
    if (formData.associationType === 'level' && !formData.level) { notify.error("Seleccione un nivel"); return; }
    if (formData.associationType === 'course' && !formData.course) { notify.error("Seleccione un curso"); return; }
    if (formData.associationType === 'document' && !formData.libraryDocument) { notify.error("Ingrese el ID del documento"); return; }
    if (questions.length === 0) { notify.error("Agregue al menos una pregunta"); return; }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) { notify.error(`Pregunta ${i + 1}: escriba el enunciado`); return; }
      if (q.type === 'multiple_choice') {
        if (!q.options || q.options.length < 2) { notify.error(`Pregunta ${i + 1}: necesita al menos 2 opciones`); return; }
        if (q.options.some(o => !o.text.trim())) { notify.error(`Pregunta ${i + 1}: todas las opciones deben tener texto`); return; }
        const correctCount = q.options.filter(o => o.isCorrect).length;
        if (correctCount !== 1) { notify.error(`Pregunta ${i + 1}: marque exactamente 1 opción correcta`); return; }
      }
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        passingScore: formData.passingScore,
        maxAttempts: formData.maxAttempts,
        questions: questions.map(({ tempId, ...q }) => q),
      };
      // Solo enviar el campo de asociación que corresponde
      if (formData.level) payload.level = formData.level;
      if (formData.course) payload.course = formData.course;
      if (formData.libraryDocument) payload.libraryDocument = formData.libraryDocument;

      if (isEditing && id) {
        await trainingService.updateExam(id, payload);
        notify.success("Examen actualizado");
      } else {
        await trainingService.createExam(payload);
        notify.success("Examen creado");
      }
      navigate('/training/manage');
    } catch (err: any) {
      notify.error(err.response?.data?.message || "Error al guardar examen");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle={isEditing ? "Editar Examen" : "Nuevo Examen"} />
      <div className="mx-auto max-w-4xl" data-test-context="exam-form-page">
        <div className="rounded-xl bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">

          {/* Datos Generales */}
          <div className="mb-8 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Datos Generales</h3>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Título *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Nombre del examen"
                data-test-key="title-input"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Descripción opcional del examen"
                rows={2}
                data-test-key="description-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Asociar a *</label>
                <select
                  value={formData.associationType}
                  onChange={(e) => setFormData(prev => ({ ...prev, associationType: e.target.value as any, level: '', course: '', libraryDocument: '' }))}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  data-test-key="association-type-select"
                >
                  <option value="level">Nivel</option>
                  <option value="course">Curso</option>
                  <option value="document">Documento</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formData.associationType === 'level' ? 'Nivel' : formData.associationType === 'course' ? 'Curso' : 'Documento'} *
                </label>
                {formData.associationType === 'level' && (
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    data-test-key="level-select"
                  >
                    <option value="">Seleccionar nivel</option>
                    {levels.map(l => (
                      <option key={l._id} value={l._id}>{l.name}</option>
                    ))}
                  </select>
                )}
                {formData.associationType === 'course' && (
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    data-test-key="course-select"
                  >
                    <option value="">Seleccionar curso</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                )}
                {formData.associationType === 'document' && (
                  <input
                    type="text"
                    value={formData.libraryDocument}
                    onChange={(e) => setFormData(prev => ({ ...prev, libraryDocument: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="ID del documento"
                    data-test-key="document-input"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">% Aprobación *</label>
                <input
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) => setFormData(prev => ({ ...prev, passingScore: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  min={1}
                  max={100}
                  data-test-key="passing-score-input"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Intentos máx.</label>
                <input
                  type="number"
                  value={formData.maxAttempts}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxAttempts: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  min={1}
                  max={10}
                  data-test-key="max-attempts-input"
                />
              </div>
            </div>
          </div>

          {/* Preguntas */}
          <div className="mb-6" data-test-context="questions-section">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Preguntas ({questions.length})
              </h3>
              <Button onClick={addQuestion} size="sm" data-test-key="add-question-btn">
                <Plus size={16} className="mr-1" /> Agregar Pregunta
              </Button>
            </div>

            {questions.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-400 dark:border-gray-600">
                No hay preguntas. Haz click en "Agregar Pregunta" para comenzar.
              </div>
            )}

            <DndProvider backend={HTML5Backend}>
              <div className="space-y-4">
                {questions.map((q, qIdx) => (
                  <QuestionCard
                    key={q.tempId}
                    question={q}
                    index={qIdx}
                    total={questions.length}
                    onUpdate={(field, value) => updateQuestion(qIdx, field, value)}
                    onMoveUp={() => moveQuestion(qIdx, 'up')}
                    onMoveDown={() => moveQuestion(qIdx, 'down')}
                    onMoveDnD={moveQuestionDnD}
                    onRemove={() => removeQuestion(qIdx)}
                    onAddOption={() => addOption(qIdx)}
                    onRemoveOption={(optIdx) => removeOption(qIdx, optIdx)}
                    onUpdateOption={(optIdx, field, value) => updateOption(qIdx, optIdx, field, value)}
                  />
                ))}
              </div>
            </DndProvider>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6 dark:border-gray-700" data-test-context="form-actions">
            <Button variant="outline" onClick={() => navigate('/training/manage')} data-test-key="cancel-btn">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} data-test-key="save-btn">
              {isSubmitting ? "Guardando..." : isEditing ? "Actualizar Examen" : "Crear Examen"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
});

// ─── Componente: QuestionCard ─────────────────────────────────────────────────

interface QuestionCardProps {
  question: QuestionFormData;
  index: number;
  total: number;
  onUpdate: (field: string, value: any) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveDnD: (dragIndex: number, hoverIndex: number) => void;
  onRemove: () => void;
  onAddOption: () => void;
  onRemoveOption: (optIdx: number) => void;
  onUpdateOption: (optIdx: number, field: string, value: any) => void;
}

const QUESTION_DND_TYPE = 'EXAM_QUESTION';

function QuestionCard({ question, index, total, onUpdate, onMoveUp, onMoveDown, onMoveDnD, onRemove, onAddOption, onRemoveOption, onUpdateOption }: QuestionCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: QUESTION_DND_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: QUESTION_DND_TYPE,
    hover: (item: { index: number }) => {
      if (item.index === index) return;
      onMoveDnD(item.index, index);
      item.index = index;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Combine drag preview and drop ref
  preview(drop(ref));

  return (
    <div
      ref={ref}
      className={`rounded-xl border p-4 transition-all ${
        isDragging
          ? 'opacity-40 border-brand-300 bg-brand-50/50 dark:bg-brand-500/5'
          : isOver
            ? 'border-brand-400 bg-brand-50/30 shadow-md dark:border-brand-500/50'
            : 'border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50'
      }`}
      data-test-key={`question-${index}`}
    >
      {/* Header: drag handle + número + acciones */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span ref={drag} className="cursor-grab active:cursor-grabbing rounded p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700" title="Arrastrar para reordenar">
            <GripVertical size={16} className="text-gray-400" />
          </span>
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            Pregunta {index + 1}
          </span>
          <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-700 dark:text-gray-400">
            {question.points} pts
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-200 disabled:opacity-30 dark:hover:bg-gray-700"
            title="Mover arriba"
            data-test-key="move-up-btn"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-200 disabled:opacity-30 dark:hover:bg-gray-700"
            title="Mover abajo"
            data-test-key="move-down-btn"
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={onRemove}
            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            title="Eliminar pregunta"
            data-test-key="delete-question-btn"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Tipo de pregunta */}
      <div className="mb-3 flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`type-${question.tempId}`}
            checked={question.type === 'multiple_choice'}
            onChange={() => onUpdate('type', 'multiple_choice')}
            className="accent-brand-500"
            data-test-key="type-radio-multiple"
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">Selección Múltiple</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`type-${question.tempId}`}
            checked={question.type === 'open_text'}
            onChange={() => onUpdate('type', 'open_text')}
            className="accent-brand-500"
            data-test-key="type-radio-open"
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">Respuesta Libre</span>
        </label>
      </div>

      {/* Enunciado */}
      <div className="mb-3">
        <textarea
          value={question.question}
          onChange={(e) => onUpdate('question', e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          placeholder="Escriba el enunciado de la pregunta..."
          rows={2}
          data-test-key="question-input"
        />
      </div>

      {/* Puntos */}
      <div className="mb-3 flex items-center gap-2">
        <label className="text-xs text-gray-500 dark:text-gray-400">Puntos:</label>
        <input
          type="number"
          value={question.points}
          onChange={(e) => onUpdate('points', Number(e.target.value))}
          className="w-16 rounded border border-gray-200 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          min={1}
          max={100}
          data-test-key="points-input"
        />
      </div>

      {/* Opciones (solo multiple_choice) */}
      {question.type === 'multiple_choice' && (
        <div className="mt-3 rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800" data-test-context="options-section">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Opciones</span>
            <button
              onClick={onAddOption}
              className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600"
              data-test-key="add-option-btn"
            >
              <Plus size={12} /> Opción
            </button>
          </div>
          <div className="space-y-2">
            {question.options?.map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center gap-2" data-test-key={`option-${optIdx}`}>
                <input
                  type="radio"
                  name={`correct-${question.tempId}`}
                  checked={opt.isCorrect}
                  onChange={() => onUpdateOption(optIdx, 'isCorrect', true)}
                  className="accent-green-500"
                  title="Marcar como correcta"
                  data-test-key="option-correct-radio"
                />
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => onUpdateOption(optIdx, 'text', e.target.value)}
                  className="flex-1 rounded border border-gray-200 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder={`Opción ${optIdx + 1}`}
                  data-test-key="option-text-input"
                />
                <button
                  onClick={() => onRemoveOption(optIdx)}
                  className="rounded p-1 text-gray-300 hover:text-red-500"
                  title="Eliminar opción"
                  disabled={(question.options?.length || 0) <= 2}
                  data-test-key="delete-option-btn"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Respuesta esperada (solo open_text) */}
      {question.type === 'open_text' && (
        <div className="mt-3">
          <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
            Respuesta esperada (guía para el evaluador)
          </label>
          <textarea
            value={question.expectedAnswer || ''}
            onChange={(e) => onUpdate('expectedAnswer', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Describe lo que el evaluador debería buscar en la respuesta..."
            rows={2}
            data-test-key="expected-answer-input"
          />
        </div>
      )}
    </div>
  );
}

export default ExamForm;
