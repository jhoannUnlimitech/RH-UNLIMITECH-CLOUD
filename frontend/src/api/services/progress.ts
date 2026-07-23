import apiClient from '../client';

/**
 * ProgressService — API client para progreso de capacitación.
 */

export interface CourseProgress {
  course: string | { _id: string; name: string };
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
}

export interface LevelProgress {
  level: string | { _id: string; name: string; order: number };
  status: 'locked' | 'in_progress' | 'exam_pending' | 'exam_failed' | 'completed';
  startedAt?: string;
  completedAt?: string;
  examAttempts: number;
}

export interface BadgeProgress {
  badge: string | { _id: string; name: string; icon: string; shape: string; color: string };
  status: 'not_started' | 'in_progress' | 'completed';
  percentage: number;
  startedAt?: string;
  earnedAt?: string;
}

export interface EmployeeProgress {
  _id: string;
  employee: string;
  courses: CourseProgress[];
  levels: LevelProgress[];
  badges: BadgeProgress[];
  latestBadge?: { _id: string; name: string; icon: string; shape: string; color: string };
  totalStudyHours: number;
  currentLevel?: { _id: string; name: string; order: number };
  currentCourse?: { _id: string; name: string };
  active: boolean;
}

export interface ExamAttempt {
  _id: string;
  employee: string | { _id: string; name: string; email: string };
  exam: string | { _id: string; title: string; passingScore: number };
  level?: string;
  answers: Array<{
    questionOrder: number;
    questionText: string;
    type: 'multiple_choice' | 'open_text';
    answer: string;
    isCorrect?: boolean;
    score?: number;
    maxScore: number;
    feedback?: string;
  }>;
  cachedAnswers?: Array<{ questionOrder: number; answer: string; savedAt: string }>;
  status: 'in_progress' | 'submitted' | 'pending_evaluation' | 'passed' | 'failed';
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  submittedAt?: string;
  evaluatedAt?: string;
}

export interface ExtraAssignment {
  _id: string;
  type: 'course' | 'document' | 'directive';
  resource?: any;
  title: string;
  description?: string;
  assignedTo: 'all' | string[];
  assignedBy: string | { _id: string; name: string };
  reason: string;
  priority: 'normal' | 'high' | 'urgent';
  dueDate?: string;
  completions: Array<{ employee: string; completedAt: string }>;
  active: boolean;
  createdAt: string;
}

class ProgressApiService {
  // --- Progress ---

  async getMyProgress(): Promise<EmployeeProgress> {
    const res = await apiClient.get<{ success: boolean; data: EmployeeProgress }>('/training/progress/me');
    return res.data.data;
  }

  async getProgressByEmployee(employeeId: string): Promise<EmployeeProgress> {
    const res = await apiClient.get<{ success: boolean; data: EmployeeProgress }>(`/training/progress/${employeeId}`);
    return res.data.data;
  }

  async completeCourse(courseId: string): Promise<{ progress: EmployeeProgress; levelStatus: string; examUnlocked: boolean; levelCompleted: boolean }> {
    const res = await apiClient.post<{ success: boolean; data: any }>(`/training/progress/complete-course/${courseId}`);
    return res.data.data;
  }

  // --- Exam Attempts ---

  async startExam(examId: string): Promise<ExamAttempt> {
    const res = await apiClient.post<{ success: boolean; data: ExamAttempt }>(`/training/exam-attempts/${examId}/start`);
    return res.data.data;
  }

  async saveCache(attemptId: string, answers: Array<{ questionOrder: number; answer: string }>): Promise<void> {
    await apiClient.put(`/training/exam-attempts/${attemptId}/cache`, { answers });
  }

  async submitExam(attemptId: string, answers: Array<{ questionOrder: number; answer: string }>): Promise<ExamAttempt> {
    const res = await apiClient.put<{ success: boolean; data: ExamAttempt }>(`/training/exam-attempts/${attemptId}/submit`, { answers });
    return res.data.data;
  }

  async getAttempt(attemptId: string): Promise<ExamAttempt> {
    const res = await apiClient.get<{ success: boolean; data: ExamAttempt }>(`/training/exam-attempts/${attemptId}`);
    return res.data.data;
  }

  async getPendingEvaluations(): Promise<ExamAttempt[]> {
    const res = await apiClient.get<{ success: boolean; data: ExamAttempt[] }>('/training/exam-attempts/pending-evaluation');
    return res.data.data;
  }

  async evaluateAnswer(attemptId: string, questionOrder: number, score: number, feedback?: string): Promise<ExamAttempt> {
    const res = await apiClient.put<{ success: boolean; data: ExamAttempt }>(`/training/exam-attempts/${attemptId}/evaluate`, { questionOrder, score, feedback });
    return res.data.data;
  }

  async completeEvaluation(attemptId: string): Promise<ExamAttempt> {
    const res = await apiClient.put<{ success: boolean; data: ExamAttempt }>(`/training/exam-attempts/${attemptId}/complete-evaluation`);
    return res.data.data;
  }

  // --- Assignments ---

  async getMyAssignments(): Promise<ExtraAssignment[]> {
    const res = await apiClient.get<{ success: boolean; data: ExtraAssignment[] }>('/training/assignments/me');
    return res.data.data;
  }

  async getAllAssignments(): Promise<ExtraAssignment[]> {
    const res = await apiClient.get<{ success: boolean; data: ExtraAssignment[] }>('/training/assignments');
    return res.data.data;
  }

  async createAssignment(data: Partial<ExtraAssignment> & { reason: string }): Promise<ExtraAssignment> {
    const res = await apiClient.post<{ success: boolean; data: ExtraAssignment }>('/training/assignments', data);
    return res.data.data;
  }

  async completeAssignment(assignmentId: string): Promise<ExtraAssignment> {
    const res = await apiClient.post<{ success: boolean; data: ExtraAssignment }>(`/training/assignments/${assignmentId}/complete`);
    return res.data.data;
  }
}

export const progressApiService = new ProgressApiService();
