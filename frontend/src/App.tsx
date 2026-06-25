import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import Home from "./pages/Dashboard/Home";
import SignIn from "./pages/AuthPages/SignIn";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PermissionRoute from "./components/auth/PermissionRoute";
import { authStore } from "./stores/views";
import DivisionsList from "./pages/Divisions/DivisionsList";
import EmployeesList from "./pages/Employees/EmployeesList";
import HatsList from "./pages/Hats/HatsList";
import HatForm from "./pages/Hats/HatForm";
import HatsView from "./pages/Hats/HatsView";
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
          <Route path="/employees" element={<PermissionRoute resource="employees"><EmployeesList /></PermissionRoute>} />
          <Route path="/divisions" element={<PermissionRoute resource="divisions"><DivisionsList /></PermissionRoute>} />
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
        </Route>

        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
