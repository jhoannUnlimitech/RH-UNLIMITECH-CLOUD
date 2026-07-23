import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import { Plus, Edit2, Trash2, FileText, Award, Layers, BookOpen } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DeleteConfirmModal from "../../components/employees/DeleteConfirmModal";
import BadgeIcon from "../../components/training/BadgeIcon";
import BadgeFormModal from "../../components/training/BadgeFormModal";
import LevelFormModal from "../../components/training/LevelFormModal";
import CourseFormModal from "../../components/training/CourseFormModal";
import { trainingService } from "../../api/services/training";
import type { Badge, Level, Course, Exam } from "../../api/services/training";
import { notify } from "../../utils/toast";

/**
 * TrainingManage — Gestión de Insignias, Niveles, Cursos y Exámenes (admin).
 *
 * 4 tabs con listados y acciones CRUD. Los formularios de examen son página aparte.
 * Requiere permiso training:manage.
 */

type TabKey = 'badges' | 'levels' | 'courses' | 'exams';

const TrainingManage = observer(() => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('badges');

  // Data
  const [badges, setBadges] = useState<Badge[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ id: string; name: string; type: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create/Edit modals
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Fetch data on tab change
  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        switch (activeTab) {
          case 'badges':
            setBadges(await trainingService.getBadges());
            break;
          case 'levels':
            setLevels(await trainingService.getLevels());
            break;
          case 'courses':
            setCourses(await trainingService.getCourses());
            break;
          case 'exams':
            setExams(await trainingService.getExams());
            break;
        }
      } catch { /* toast */ }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, [activeTab]);

  // Delete handler
  const handleDelete = (id: string, name: string, type: string) => {
    setDeletingItem({ id, name, type });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      switch (deletingItem.type) {
        case 'badge': await trainingService.deleteBadge(deletingItem.id); setBadges(prev => prev.filter(b => b._id !== deletingItem.id)); break;
        case 'level': await trainingService.deleteLevel(deletingItem.id); setLevels(prev => prev.filter(l => l._id !== deletingItem.id)); break;
        case 'course': await trainingService.deleteCourse(deletingItem.id); setCourses(prev => prev.filter(c => c._id !== deletingItem.id)); break;
        case 'examen': await trainingService.deleteExam(deletingItem.id); setExams(prev => prev.filter(e => e._id !== deletingItem.id)); break;
      }
      notify.success(`${deletingItem.type} eliminado`);
      setDeleteModalOpen(false);
      setDeletingItem(null);
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al eliminar');
    } finally { setIsDeleting(false); }
  };

  const tabs: { key: TabKey; label: string; icon: React.FC<any> }[] = [
    { key: 'badges', label: 'Insignias', icon: Award },
    { key: 'levels', label: 'Niveles', icon: Layers },
    { key: 'courses', label: 'Cursos', icon: BookOpen },
    { key: 'exams', label: 'Exámenes', icon: FileText },
  ];

  return (
    <>
      <PageBreadcrumb pageTitle="Gestión Training" />
      <div className="rounded-xl bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card" data-test-context="training-manage-page">

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-1 border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                data-test-key={`tab-${tab.key}`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {activeTab === 'badges' && <BadgesTab badges={badges} onDelete={handleDelete} onCreate={() => { setEditingBadge(null); setBadgeModalOpen(true); }} onEdit={(b) => { setEditingBadge(b); setBadgeModalOpen(true); }} />}
            {activeTab === 'levels' && <LevelsTab levels={levels} onDelete={handleDelete} onCreate={() => { setEditingLevel(null); setLevelModalOpen(true); }} onEdit={(l) => { setEditingLevel(l); setLevelModalOpen(true); }} />}
            {activeTab === 'courses' && <CoursesTab courses={courses} onDelete={handleDelete} onCreate={() => { setEditingCourse(null); setCourseModalOpen(true); }} onEdit={(c) => { setEditingCourse(c); setCourseModalOpen(true); }} />}
            {activeTab === 'exams' && <ExamsTab exams={exams} onDelete={handleDelete} navigate={navigate} />}
          </>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingItem(null); }}
        onConfirm={confirmDelete}
        itemName={deletingItem?.name || ''}
        itemType={deletingItem?.type || ''}
        isLoading={isDeleting}
      />

      {/* Badge Form Modal */}
      <BadgeFormModal
        isOpen={badgeModalOpen}
        onClose={() => { setBadgeModalOpen(false); setEditingBadge(null); }}
        onSuccess={(badge) => {
          if (editingBadge) {
            setBadges(prev => prev.map(b => b._id === badge._id ? badge : b));
          } else {
            setBadges(prev => [...prev, badge]);
          }
        }}
        badge={editingBadge}
      />

      {/* Level Form Modal */}
      <LevelFormModal
        isOpen={levelModalOpen}
        onClose={() => { setLevelModalOpen(false); setEditingLevel(null); }}
        onSuccess={(level) => {
          if (editingLevel) {
            setLevels(prev => prev.map(l => l._id === level._id ? level : l));
          } else {
            setLevels(prev => [...prev, level]);
          }
        }}
        level={editingLevel}
        badges={badges}
      />

      {/* Course Form Modal */}
      <CourseFormModal
        isOpen={courseModalOpen}
        onClose={() => { setCourseModalOpen(false); setEditingCourse(null); }}
        onSuccess={(course) => {
          if (editingCourse) {
            setCourses(prev => prev.map(c => c._id === course._id ? course : c));
          } else {
            setCourses(prev => [...prev, course]);
          }
        }}
        course={editingCourse}
        levels={levels}
      />
    </>
  );
});

// ─── Tab: Insignias ─────────────────────────────────────────────────────────

function BadgesTab({ badges, onDelete, onCreate, onEdit }: { badges: Badge[]; onDelete: (id: string, name: string, type: string) => void; onCreate: () => void; onEdit: (b: Badge) => void }) {
  return (
    <div data-test-context="badges-tab">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white">Insignias ({badges.length})</h3>
        <Button onClick={onCreate} size="sm" data-test-key="create-badge-btn">
          <Plus size={16} className="mr-1" /> Nueva Insignia
        </Button>
      </div>
      {badges.length === 0 ? (
        <p className="py-8 text-center text-gray-400">No hay insignias creadas</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map(badge => (
            <div key={badge._id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 dark:border-gray-700" data-test-key={`badge-${badge._id}`}>
              <BadgeIcon shape={badge.shape} icon={badge.icon} color={badge.color} earned={true} size={48} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{badge.name}</p>
                <p className="text-xs text-gray-400 truncate">{badge.description}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{badge.totalCourses} cursos · {(badge.levels as any[])?.length || 0} niveles</p>
              </div>
              <button onClick={() => onEdit(badge)} className="rounded p-1.5 text-gray-300 hover:text-brand-500" data-test-key="edit-btn">
                <Edit2 size={14} />
              </button>
              <button onClick={() => onDelete(badge._id, badge.name, 'badge')} className="rounded p-1.5 text-gray-300 hover:text-red-500" data-test-key="delete-btn">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Niveles ───────────────────────────────────────────────────────────

function LevelsTab({ levels, onDelete, onCreate, onEdit }: { levels: Level[]; onDelete: (id: string, name: string, type: string) => void; onCreate: () => void; onEdit: (l: Level) => void }) {
  return (
    <div data-test-context="levels-tab">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white">Niveles ({levels.length})</h3>
        <Button onClick={onCreate} size="sm" data-test-key="create-level-btn">
          <Plus size={16} className="mr-1" /> Nuevo Nivel
        </Button>
      </div>
      {levels.length === 0 ? (
        <p className="py-8 text-center text-gray-400">No hay niveles creados</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Orden</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Nombre</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Insignia</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Cursos</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Examen</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {levels.map(level => {
                const badgeName = typeof level.badge === 'object' ? level.badge.name : '—';
                const examName = typeof level.exam === 'object' ? (level.exam as any).title : (level.exam ? 'Asignado' : '—');
                const courseCount = Array.isArray(level.courses) ? level.courses.length : 0;
                return (
                  <tr key={level._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50" data-test-key={`level-${level._id}`}>
                    <td className="px-4 py-3 text-gray-500">{level.order}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{level.name}</td>
                    <td className="px-4 py-3 text-gray-500">{badgeName}</td>
                    <td className="px-4 py-3 text-gray-500">{courseCount}</td>
                    <td className="px-4 py-3 text-gray-500">{examName}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onEdit(level)} className="rounded p-1.5 text-gray-300 hover:text-brand-500" data-test-key="edit-btn">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => onDelete(level._id, level.name, 'level')} className="rounded p-1.5 text-gray-300 hover:text-red-500" data-test-key="delete-btn">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Cursos ────────────────────────────────────────────────────────────

function CoursesTab({ courses, onDelete, onCreate, onEdit }: { courses: Course[]; onDelete: (id: string, name: string, type: string) => void; onCreate: () => void; onEdit: (c: Course) => void }) {
  return (
    <div data-test-context="courses-tab">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white">Cursos ({courses.length})</h3>
        <Button onClick={onCreate} size="sm" data-test-key="create-course-btn">
          <Plus size={16} className="mr-1" /> Nuevo Curso
        </Button>
      </div>
      {courses.length === 0 ? (
        <p className="py-8 text-center text-gray-400">No hay cursos creados</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Orden</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Nombre</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Nivel</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Horas est.</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {courses.map(course => {
                const levelName = typeof course.level === 'object' ? course.level.name : '—';
                return (
                  <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50" data-test-key={`course-${course._id}`}>
                    <td className="px-4 py-3 text-gray-500">{course.order}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 dark:text-white">{course.name}</p>
                      {course.description && <p className="text-xs text-gray-400 line-clamp-1">{course.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{levelName}</td>
                    <td className="px-4 py-3 text-gray-500">{course.estimatedHours || '—'}h</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onEdit(course)} className="rounded p-1.5 text-gray-300 hover:text-brand-500" data-test-key="edit-btn">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => onDelete(course._id, course.name, 'course')} className="rounded p-1.5 text-gray-300 hover:text-red-500" data-test-key="delete-btn">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Exámenes ──────────────────────────────────────────────────────────

function ExamsTab({ exams, onDelete, navigate }: { exams: Exam[]; onDelete: (id: string, name: string, type: string) => void; navigate: any }) {
  return (
    <div data-test-context="exams-tab">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white">Exámenes ({exams.length})</h3>
        <Button onClick={() => navigate('/training/manage/exams/new')} size="sm" data-test-key="create-exam-btn">
          <Plus size={16} className="mr-1" /> Nuevo Examen
        </Button>
      </div>
      {exams.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-400 dark:border-gray-600">
          <FileText size={32} className="mx-auto mb-2 opacity-50" />
          <p>No hay exámenes creados.</p>
          <p className="text-xs mt-1">Crea tu primer examen para asociarlo a un nivel.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map(exam => {
            const levelName = typeof exam.level === 'object' ? exam.level.name : '—';
            return (
              <div
                key={exam._id}
                className="flex items-center justify-between rounded-xl border border-gray-100 p-4 hover:border-brand-200 dark:border-gray-700 dark:hover:border-brand-500/30"
                data-test-key={`exam-${exam._id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                    <FileText size={20} className="text-brand-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white" data-test-key="exam-title">{exam.title}</p>
                    <p className="text-xs text-gray-400">
                      Nivel: {levelName} · {exam.questionCount || exam.questions?.length || 0} preguntas · {exam.passingScore}% aprobación · {exam.maxAttempts} intento{exam.maxAttempts > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${exam.active ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                    {exam.active ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    onClick={() => navigate(`/training/manage/exams/edit/${exam._id}`)}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-700"
                    title="Editar"
                    data-test-key="edit-btn"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(exam._id, exam.title, 'examen')}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    title="Eliminar"
                    data-test-key="delete-btn"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TrainingManage;
