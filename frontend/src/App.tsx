import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import Home from "./pages/Dashboard/Home";
import SignIn from "./pages/AuthPages/SignIn";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { authStore } from "./stores/views";
import DivisionsList from "./pages/Divisions/DivisionsList";
import EmployeesList from "./pages/Employees/EmployeesList";
import RolesList from "./pages/Roles/RolesList";
import RoleForm from "./pages/Roles/RoleForm";
import RolesView from "./pages/Roles/RolesView";
import CSWCategoriesList from "./pages/CSWCategories/CSWCategoriesList";
import CSWList from "./pages/CSW/CSWList";
import CSWForm from "./pages/CSW/CSWForm";
import CSWView from "./pages/CSW/CSWView";

export default function App() {
  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    authStore.checkAuth();
  }, []);

  return (
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
          <Route path="/divisions" element={<DivisionsList />} />
          <Route path="/employees" element={<EmployeesList />} />
          <Route path="/roles" element={<RolesList />} />
          <Route path="/roles/new" element={<RoleForm />} />
          <Route path="/roles/edit/:id" element={<RoleForm />} />
          <Route path="/roles/view/:id" element={<RolesView />} />
          <Route path="/csw-categories" element={<CSWCategoriesList />} />
          <Route path="/csw/new" element={<CSWForm />} />
          <Route path="/csw/edit/:id" element={<CSWForm />} />
          <Route path="/csw/view/:id" element={<CSWView />} />
          <Route path="/csw/my-requests" element={<CSWList />} />
          <Route path="/csw/pending" element={<CSWList />} />
          <Route path="/csw/all" element={<CSWList />} />
        </Route>

        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
