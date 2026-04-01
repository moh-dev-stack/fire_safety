import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { AdminOnlyPage } from "./components/AdminOnlyPage";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { IncidentLogPage } from "./pages/IncidentLogPage";
import { ReportIncidentPage } from "./pages/ReportIncidentPage";
import { LoginPage } from "./pages/LoginPage";
import { HelpPage } from "./pages/HelpPage";
import { MapPage } from "./pages/MapPage";
import { RolesPage } from "./pages/RolesPage";
import {
  ENABLE_TRAINING_MODULE,
  ENABLE_VENUE_CHECKLIST,
} from "./config/features";
import { RotaPage } from "./pages/RotaPage";
import { TeamPage } from "./pages/TeamPage";
import { TrainingPage } from "./pages/TrainingPage";
import { VenueChecklistPage } from "./pages/VenueChecklistPage";

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
          <Route
            index
            element={
              <AdminOnlyPage>
                <TeamPage />
              </AdminOnlyPage>
            }
          />
          <Route
            path="rota"
            element={
              <AdminOnlyPage>
                <RotaPage />
              </AdminOnlyPage>
            }
          />
          {ENABLE_TRAINING_MODULE ? (
            <>
              <Route path="training" element={<TrainingPage />} />
              <Route
                path="training/fire-extinguishers"
                element={<Navigate to="/training" replace />}
              />
            </>
          ) : null}
          {ENABLE_VENUE_CHECKLIST ? (
            <Route
              path="venue-checklist"
              element={
                <AdminOnlyPage>
                  <VenueChecklistPage />
                </AdminOnlyPage>
              }
            />
          ) : null}
          <Route path="incidents" element={<ReportIncidentPage />} />
          <Route
            path="incidents/log"
            element={
              <AdminOnlyPage>
                <IncidentLogPage />
              </AdminOnlyPage>
            }
          />
          <Route
            path="map"
            element={
              <AdminOnlyPage>
                <MapPage />
              </AdminOnlyPage>
            }
          />
          <Route path="help" element={<HelpPage />} />
          <Route
            path="roles"
            element={
              <AdminOnlyPage>
                <RolesPage />
              </AdminOnlyPage>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
