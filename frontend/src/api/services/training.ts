import apiClient from '../client';

/**
 * TrainingService — API client para Cursos, Niveles e Insignias.
 */

export interface Course {
  _id: string;
  name: string;
  description: string;
  link?: string;
  libraryDocument?: string | { _id: string; title: string; slug: string; type: string };
  order: number;
  level: string | { _id: string; name: string; order: number };
  estimatedHours?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Level {
  _id: string;
  name: string;
  description?: string;
  order: number;
  badge: string | { _id: string; name: string; icon: string; shape: string; color: string };
  exam?: string | { _id: string; name: string; passingScore: number };
  courses: string[] | Course[];
  requiredCoursesCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  shape: string;
  color: string;
  levels: string[] | Level[];
  totalCourses: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExamOption {
  text: string;
  isCorrect?: boolean; // Oculto para empleados sin manage
}

export interface ExamQuestion {
  _id?: string;
  question: string;
  type: 'multiple_choice' | 'open_text';
  options?: ExamOption[];
  expectedAnswer?: string; // Oculto para empleados sin manage
  points: number;
  order: number;
}

export interface Exam {
  _id: string;
  title: string;
  description?: string;
  level: string | { _id: string; name: string; order: number };
  questions: ExamQuestion[];
  passingScore: number;
  maxAttempts: number;
  assignedTo?: string[];
  active: boolean;
  totalPoints?: number;
  questionCount?: number;
  createdBy: string | { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

class TrainingService {
  private readonly baseURL = '/training';

  // --- Cursos ---

  async getCourses(filters?: { level?: string; active?: string }): Promise<Course[]> {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    const res = await apiClient.get<{ success: boolean; data: Course[] }>(`${this.baseURL}/courses${params}`);
    return res.data.data;
  }

  async getCourseById(id: string): Promise<Course> {
    const res = await apiClient.get<{ success: boolean; data: Course }>(`${this.baseURL}/courses/${id}`);
    return res.data.data;
  }

  async createCourse(data: Partial<Course>): Promise<Course> {
    const res = await apiClient.post<{ success: boolean; data: Course }>(`${this.baseURL}/courses`, data);
    return res.data.data;
  }

  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    const res = await apiClient.put<{ success: boolean; data: Course }>(`${this.baseURL}/courses/${id}`, data);
    return res.data.data;
  }

  async reorderCourses(courses: { id: string; order: number }[]): Promise<void> {
    await apiClient.put(`${this.baseURL}/courses/reorder`, { courses });
  }

  async deleteCourse(id: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/courses/${id}`);
  }

  // --- Niveles ---

  async getLevels(filters?: { badge?: string; active?: string }): Promise<Level[]> {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    const res = await apiClient.get<{ success: boolean; data: Level[] }>(`${this.baseURL}/levels${params}`);
    return res.data.data;
  }

  async getLevelById(id: string): Promise<Level> {
    const res = await apiClient.get<{ success: boolean; data: Level }>(`${this.baseURL}/levels/${id}`);
    return res.data.data;
  }

  async createLevel(data: Partial<Level>): Promise<Level> {
    const res = await apiClient.post<{ success: boolean; data: Level }>(`${this.baseURL}/levels`, data);
    return res.data.data;
  }

  async updateLevel(id: string, data: Partial<Level>): Promise<Level> {
    const res = await apiClient.put<{ success: boolean; data: Level }>(`${this.baseURL}/levels/${id}`, data);
    return res.data.data;
  }

  async reorderLevels(levels: { id: string; order: number }[]): Promise<void> {
    await apiClient.put(`${this.baseURL}/levels/reorder`, { levels });
  }

  async deleteLevel(id: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/levels/${id}`);
  }

  // --- Insignias ---

  async getBadges(filters?: { active?: string }): Promise<Badge[]> {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    const res = await apiClient.get<{ success: boolean; data: Badge[] }>(`${this.baseURL}/badges${params}`);
    return res.data.data;
  }

  async getBadgeById(id: string): Promise<Badge> {
    const res = await apiClient.get<{ success: boolean; data: Badge }>(`${this.baseURL}/badges/${id}`);
    return res.data.data;
  }

  async createBadge(data: Partial<Badge>): Promise<Badge> {
    const res = await apiClient.post<{ success: boolean; data: Badge }>(`${this.baseURL}/badges`, data);
    return res.data.data;
  }

  async updateBadge(id: string, data: Partial<Badge>): Promise<Badge> {
    const res = await apiClient.put<{ success: boolean; data: Badge }>(`${this.baseURL}/badges/${id}`, data);
    return res.data.data;
  }

  async deleteBadge(id: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/badges/${id}`);
  }

  // --- Exámenes ---

  async getExams(filters?: { level?: string; active?: string }): Promise<Exam[]> {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    const res = await apiClient.get<{ success: boolean; data: Exam[] }>(`${this.baseURL}/exams${params}`);
    return res.data.data;
  }

  async getMyExams(): Promise<Exam[]> {
    const res = await apiClient.get<{ success: boolean; data: Exam[] }>(`${this.baseURL}/exams/me`);
    return res.data.data;
  }

  async getExamById(id: string): Promise<Exam> {
    const res = await apiClient.get<{ success: boolean; data: Exam }>(`${this.baseURL}/exams/${id}`);
    return res.data.data;
  }

  async createExam(data: Partial<Exam>): Promise<Exam> {
    const res = await apiClient.post<{ success: boolean; data: Exam }>(`${this.baseURL}/exams`, data);
    return res.data.data;
  }

  async updateExam(id: string, data: Partial<Exam>): Promise<Exam> {
    const res = await apiClient.put<{ success: boolean; data: Exam }>(`${this.baseURL}/exams/${id}`, data);
    return res.data.data;
  }

  async reorderExamQuestions(id: string, questions: { order: number }[]): Promise<Exam> {
    const res = await apiClient.put<{ success: boolean; data: Exam }>(`${this.baseURL}/exams/${id}/reorder-questions`, { questions });
    return res.data.data;
  }

  async assignExam(examId: string, employeeId: string): Promise<Exam> {
    const res = await apiClient.post<{ success: boolean; data: Exam }>(`${this.baseURL}/exams/${examId}/assign/${employeeId}`);
    return res.data.data;
  }

  async deleteExam(id: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/exams/${id}`);
  }
}

export const trainingService = new TrainingService();
