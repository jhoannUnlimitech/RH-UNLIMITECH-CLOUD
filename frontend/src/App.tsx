import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import Home from "./pages/Dashboard/Home";
import SignIn from "./pages/AuthPages/SignIn";
import ChangePassword from "./pages/AuthPages/ChangePassword";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PermissionRoute from "./components/auth/PermissionRoute";
import { authStore } from "./stores/views";
import DivisionsList from "./pages/Divisions/DivisionsList";
import EmployeesList from "./pages/Employees/EmployeesList";
import ProjectsList from "./pages/Projects/ProjectsList";
import ProjectDetail from "./pages/Projects/ProjectDetail";
import HatsList from "./pages/Hats/HatsList";
import HatForm from "./pages/Hats/HatForm";
import HatsView from "./pages/Hats/HatsView";
import CSWCategoriesList from "./pages/CSWCategories/CSWCategoriesList";
import CSWList from "./pages/CSW/CSWList";
import CSWForm from "./pages/CSW/CSWForm";
import CSWView from "./pages/CSW/CSWView";
import NotFound from "./pages/Errors/NotFound";
import CalendarPage from "./pages/Calendar/CalendarPage";
import EventsList from "./pages/Calendar/EventsList";
import UserProfile from "./pages/Profile/UserProfile";
import Library from "./pages/Training/Library";
import LibraryManage from "./pages/Training/LibraryManage";
import LibraryCategories from "./pages/Training/LibraryCategories";
import DocumentView from "./pages/Training/DocumentView";
import DocumentForm from "./pages/Training/DocumentForm";
import TrainingManage from "./pages/Training/TrainingManage";
import ExamForm from "./pages/Training/ExamForm";
import MyProgress from "./pages/Training/MyProgress";
import TakeExam from "./pages/Training/TakeExam";
import StudyReport from "./pages/Training/StudyReport";
import Attendance from "./pages/Training/Attendance";
import SystemSettings from "./pages/Settings/SystemSettings";
import HonorTable from "./pages/Training/HonorTable";

export default function App() {
  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    authStore.checkAuth();
  }, []);

  return (
    <ErrorBoundary>
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Auth Pages */}
        <Route path="/signin" element={<SignIn />} />

        {/* Protected Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index path="/" element={<Home />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/employees" element={<PermissionRoute resource="employees"><EmployeesList /></PermissionRoute>} />
          <Route path="/divisions" element={<PermissionRoute resource="divisions"><DivisionsList /></PermissionRoute>} />
          <Route path="/projects" element={<PermissionRoute resource="projects"><ProjectsList /></PermissionRoute>} />
          <Route path="/projects/:id" element={<PermissionRoute resource="projects"><ProjectDetail /></PermissionRoute>} />
          <Route path="/roles" element={<PermissionRoute resource="roles"><HatsList /></PermissionRoute>} />
          <Route path="/roles/new" element={<PermissionRoute resource="roles"><HatForm /></PermissionRoute>} />
          <Route path="/roles/edit/:id" element={<PermissionRoute resource="roles"><HatForm /></PermissionRoute>} />
          <Route path="/roles/view/:id" element={<PermissionRoute resource="roles"><HatsView /></PermissionRoute>} />
          <Route path="/csw-categories" element={<PermissionRoute resource="csw_categories"><CSWCategoriesList /></PermissionRoute>} />
          <Route path="/csw/new" element={<PermissionRoute resource="csw"><CSWForm /></PermissionRoute>} />
          <Route path="/csw/edit/:id" element={<PermissionRoute resource="csw"><CSWForm /></PermissionRoute>} />
          <Route path="/csw/view/:id" element={<PermissionRoute resource="csw"><CSWView /></PermissionRoute>} />
          <Route path="/csw/my-requests" element={<PermissionRoute resource="csw"><CSWList /></PermissionRoute>} />
          <Route path="/csw/pending" element={<PermissionRoute resource="csw"><CSWList /></PermissionRoute>} />
          <Route path="/csw/all" element={<PermissionRoute resource="csw"><CSWList /></PermissionRoute>} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/calendar/events" element={<EventsList />} />

          {/* Training Module */}
          <Route path="/library" element={<PermissionRoute resource="training"><Library /></PermissionRoute>} />
          <Route path="/library/manage" element={<PermissionRoute resource="training" action="content"><LibraryManage /></PermissionRoute>} />
          <Route path="/library/categories" element={<PermissionRoute resource="training" action="content"><LibraryCategories /></PermissionRoute>} />
          <Route path="/library/documents/new" element={<PermissionRoute resource="training" action="content"><DocumentForm /></PermissionRoute>} />
          <Route path="/library/documents/edit/:id" element={<PermissionRoute resource="training" action="content"><DocumentForm /></PermissionRoute>} />
          <Route path="/library/documents/:slug" element={<PermissionRoute resource="training"><DocumentView /></PermissionRoute>} />
          <Route path="/training/manage" element={<PermissionRoute resource="training" action="manage"><TrainingManage /></PermissionRoute>} />
          <Route path="/training/manage/exams/new" element={<PermissionRoute resource="training" action="manage"><ExamForm /></PermissionRoute>} />
          <Route path="/training/manage/exams/edit/:id" element={<PermissionRoute resource="training" action="manage"><ExamForm /></PermissionRoute>} />
          <Route path="/training/exam/:examId" element={<PermissionRoute resource="training"><TakeExam /></PermissionRoute>} />
          <Route path="/training/my-progress" element={<PermissionRoute resource="training"><MyProgress /></PermissionRoute>} />
          <Route path="/training/report" element={<PermissionRoute resource="training"><StudyReport /></PermissionRoute>} />
          <Route path="/training/admin/attendance" element={<PermissionRoute resource="training" action="manage"><Attendance /></PermissionRoute>} />
          <Route path="/settings" element={<PermissionRoute resource="training" action="manage"><SystemSettings /></PermissionRoute>} />
          <Route path="/training/honor-table" element={<PermissionRoute resource="training"><HonorTable /></PermissionRoute>} />
          <Route path="/training/certificates" element={<PermissionRoute resource="training"><Library /></PermissionRoute>} />
          <Route path="/training/admin/dashboard" element={<PermissionRoute resource="training"><TrainingManage /></PermissionRoute>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    </ErrorBoundary>
  );
}
