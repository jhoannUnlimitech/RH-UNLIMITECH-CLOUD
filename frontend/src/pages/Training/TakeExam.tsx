import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { Clock, CheckCircle2, AlertCircle, Send } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { trainingService } from "../../api/services/training";
import { progressApiService } from "../../api/services/progress";
import type { Exam, ExamQuestion } from "../../api/services/training";
import type { ExamAttempt } from "../../api/services/progress";
import { notify } from "../../utils/toast";

/**
 * TakeExam — Página para que el empleado tome un examen.
 *
 * Flujo: start → responder preguntas → cache periódico → confirmar envío → resultado
 */

const TakeExam = observer(() => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [result, setResult] = useState<ExamAttempt | null>(null);

  // Cargar examen e iniciar intento
  useEffect(() => {
    if (!examId) return;
    loadExam();
  }, [examId]);

  const loadExam = async () => {
    setIsLoading(true);
    try {
      const examData = await trainingService.getExamById(examId!);
      setExam(examData);

      // Iniciar intento (o continuar si hay uno in_progress)
      const attemptData = await progressApiService.startExam(examId!);
      setAttempt(attemptData);

      // Restaurar respuestas del cache si las hay
      if (attemptData.cachedAnswers && attemptData.cachedAnswers.length > 0) {
        const cached: Record<number, string> = {};
        attemptData.cachedAnswers.forEach(ca => {
          cached[ca.questionOrder] = ca.answer;
        });
        setAnswers(cached);
        notify.success('Respuestas anteriores restauradas desde el cache.');
      }
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al cargar examen');
      navigate('/training/my-progress');
    } finally { setIsLoading(false); }
  };

  // Auto-save cache cada 30 segundos
  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress') return;
    const interval = setInterval(() => {
      saveCache();
    }, 30000);
    return () => clearInterval(interval);
  }, [attempt, answers]);

  const saveCache = useCallback(async () => {
    if (!attempt) return;
    const answerArray = Object.entries(answers).map(([order, answer]) => ({
      questionOrder: parseInt(order),
      answer,
    }));
    if (answerArray.length === 0) return;
    try {
      await progressApiService.saveCache(attempt._id, answerArray);
    } catch { /* silently fail */ }
  }, [attempt, answers]);

  // Manejar respuesta
  const handleAnswer = (questionOrder: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionOrder]: answer }));
  };

  // Confirmar envío
  const handleSubmit = async () => {
    setConfirmModalOpen(false);
    setIsSubmitting(true);
    try {
      const answerArray = Object.entries(answers).map(([order, answer]) => ({
        questionOrder: parseInt(order),
        answer,
      }));
      const resultData = await progressApiService.submitExam(attempt!._id, answerArray);
      setResult(resultData);
      setAttempt(resultData);

      if (resultData.status === 'passed') {
        notify.success(`¡Aprobado con ${resultData.percentage}%!`);
      } else if (resultData.status === 'failed') {
        notify.error(`No aprobado (${resultData.percentage}%). Revisa el material.`);
      } else {
        notify.success('Examen enviado. Tiene preguntas que requieren evaluación manual.');
      }
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al enviar examen');
    } finally { setIsSubmitting(false); }
  };

  // Contar respondidas
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exam?.questions?.length || 0;

  if (isLoading) {
    return (
      <>
        <PageBreadcrumb pageTitle="Examen" />
        <div className="flex items-center justify-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
        </div>
      </>
    );
  }

  // Resultado final
  if (result && result.status !== 'in_progress') {
    return (
      <>
        <PageBreadcrumb pageTitle="Resultado del Examen" />
        <div className="mx-auto max-w-2xl" data-test-context="exam-result-page">
          <div className="rounded-xl bg-white p-8 text-center shadow-1 dark:bg-gray-dark">
            {result.passed ? (
              <>
                <CheckCircle2 size={64} className="mx-auto mb-4 text-green-500" />
                <h2 className="mb-2 text-2xl font-bold text-green-700 dark:text-green-400">¡Aprobado!</h2>
              </>
            ) : result.status === 'pending_evaluation' ? (
              <>
                <Clock size={64} className="mx-auto mb-4 text-orange-500" />
                <h2 className="mb-2 text-2xl font-bold text-orange-700 dark:text-orange-400">Pendiente de Evaluación</h2>
              </>
            ) : (
              <>
                <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
                <h2 className="mb-2 text-2xl font-bold text-red-700 dark:text-red-400">No Aprobado</h2>
              </>
            )}
            <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
              Puntaje: <span className="font-bold">{result.percentage}%</span> ({result.totalScore}/{result.maxScore} puntos)
            </p>
            {result.status === 'pending_evaluation' && (
              <p className="mb-4 text-sm text-gray-500">Tu examen tiene preguntas de respuesta libre que serán evaluadas por el encargado.</p>
            )}
            <Button onClick={() => navigate('/training/my-progress')}>
              Volver a Mi Progreso
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBreadcrumb pageTitle={exam?.title || 'Examen'} />
      <div className="mx-auto max-w-3xl" data-test-context="take-exam-page">
        {/* Header */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-1 dark:bg-gray-dark">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{exam?.title}</h2>
          {exam?.description && <p className="mt-1 text-sm text-gray-500">{exam.description}</p>}
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
            <span>Aprobación: {exam?.passingScore}%</span>
            <span>Preguntas: {totalQuestions}</span>
            <span>Respondidas: {answeredCount}/{totalQuestions}</span>
          </div>
        </div>

        {/* Preguntas */}
        <div className="space-y-4">
          {exam?.questions?.map((q, idx) => (
            <QuestionView
              key={q.order}
              question={q}
              index={idx}
              answer={answers[q.order] || ''}
              onAnswer={(answer) => handleAnswer(q.order, answer)}
            />
          ))}
        </div>

        {/* Botón enviar */}
        <div className="mt-6 flex items-center justify-between rounded-xl bg-white p-4 shadow-1 dark:bg-gray-dark">
          <p className="text-sm text-gray-500">
            {answeredCount === totalQuestions
              ? <span className="text-green-600 font-medium">Todas las preguntas respondidas</span>
              : `Faltan ${totalQuestions - answeredCount} pregunta(s) por responder`
            }
          </p>
          <Button
            onClick={() => setConfirmModalOpen(true)}
            disabled={answeredCount === 0 || isSubmitting}
            data-test-key="submit-exam-btn"
          >
            <Send size={16} className="mr-2" />
            Enviar Examen
          </Button>
        </div>
      </div>

      {/* Modal de confirmación */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        className="relative w-full max-w-[450px] m-5 sm:m-0 rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900"
      >
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-orange-500" />
          <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
            ¿Estás seguro de enviar?
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Una vez enviadas las respuestas <strong>no podrás modificarlas</strong>.
            {answeredCount < totalQuestions && (
              <span className="block mt-2 text-orange-600">
                Atención: tienes {totalQuestions - answeredCount} pregunta(s) sin responder.
              </span>
            )}
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Confirmar Envío'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
});

// ─── Componente: Vista de una pregunta ──────────────────────────────────────

function QuestionView({ question, index, answer, onAnswer }: {
  question: ExamQuestion;
  index: number;
  answer: string;
  onAnswer: (answer: string) => void;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-1 dark:bg-gray-dark" data-test-key={`question-${question.order}`}>
      <div className="mb-3 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600 dark:bg-brand-500/10">
          {index + 1}
        </span>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-white">{question.question}</p>
          <p className="text-xs text-gray-400 mt-0.5">{question.points} puntos · {question.type === 'multiple_choice' ? 'Selección múltiple' : 'Respuesta libre'}</p>
        </div>
      </div>

      {question.type === 'multiple_choice' && question.options ? (
        <div className="ml-10 space-y-2">
          {question.options.map((opt, optIdx) => (
            <label
              key={optIdx}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                answer === opt.text
                  ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/10'
                  : 'border-gray-100 hover:border-gray-200 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
            >
              <input
                type="radio"
                name={`q-${question.order}`}
                value={opt.text}
                checked={answer === opt.text}
                onChange={() => onAnswer(opt.text)}
                className="accent-brand-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">{opt.text}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="ml-10">
          <textarea
            value={answer}
            onChange={(e) => onAnswer(e.target.value)}
            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            rows={4}
            placeholder="Escribe tu respuesta aquí..."
            data-test-key="answer-textarea"
          />
        </div>
      )}
    </div>
  );
}

export default TakeExam;
