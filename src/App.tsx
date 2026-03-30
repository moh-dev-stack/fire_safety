import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { IncidentLogPage } from "./pages/IncidentLogPage";
import { ReportIncidentPage } from "./pages/ReportIncidentPage";
import { LoginPage } from "./pages/LoginPage";
import { MapPage } from "./pages/MapPage";
import { RotaPage } from "./pages/RotaPage";
import { TeamPage } from "./pages/TeamPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeamPage />} />
          <Route path="rota" element={<RotaPage />} />
          <Route path="incidents" element={<ReportIncidentPage />} />
          <Route path="incidents/log" element={<IncidentLogPage />} />
          <Route path="map" element={<MapPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
