import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { AdminOnlyPage } from "./components/AdminOnlyPage";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { IncidentLogPage } from "./pages/IncidentLogPage";
import { ReportIncidentPage } from "./pages/ReportIncidentPage";
import { ReportLayout } from "./pages/ReportLayout";
import { LoginPage } from "./pages/LoginPage";
import { MapPage } from "./pages/MapPage";
import { RolesPage } from "./pages/RolesPage";
import {
  ENABLE_TRAINING_MODULE,
  ENABLE_VENUE_CHECKLIST,
} from "./config/features";
import { HomePage } from "./pages/HomePage";
import { RotaPage } from "./pages/RotaPage";
import { TeamLayout } from "./pages/TeamLayout";
import { TeamPage } from "./pages/TeamPage";
import { TrainingFsoBriefPage } from "./pages/TrainingFsoBriefPage";
import { TrainingFsoJalsaPage } from "./pages/TrainingFsoJalsaPage";
import { TrainingLayout } from "./pages/TrainingLayout";
import { TrainingModulePage } from "./pages/TrainingModulePage";
import { TrainingRedBookPage } from "./pages/TrainingRedBookPage";
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
          <Route index element={<HomePage />} />
          <Route
            path="team"
            element={
              <AdminOnlyPage>
                <TeamLayout />
              </AdminOnlyPage>
            }
          >
            <Route index element={<TeamPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="rota" element={<RotaPage />} />
          </Route>
          <Route
            path="rota"
            element={
              <AdminOnlyPage>
                <Navigate to="/team/rota" replace />
              </AdminOnlyPage>
            }
          />
          {ENABLE_TRAINING_MODULE ? (
            <Route path="training" element={<TrainingLayout />}>
              <Route index element={<TrainingModulePage />} />
              <Route path="fso-2005-brief" element={<TrainingFsoBriefPage />} />
              <Route path="fso-2005-jalsa-uk" element={<TrainingFsoJalsaPage />} />
              <Route
                path="red-book-2025"
                element={
                  <AdminOnlyPage>
                    <TrainingRedBookPage />
                  </AdminOnlyPage>
                }
              />
              <Route
                path="fire-extinguishers"
                element={<Navigate to="/training" replace />}
              />
            </Route>
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
          <Route path="incidents" element={<ReportLayout />}>
            <Route index element={<ReportIncidentPage />} />
            <Route
              path="log"
              element={
                <AdminOnlyPage>
                  <IncidentLogPage />
                </AdminOnlyPage>
              }
            />
          </Route>
          <Route
            path="map"
            element={
              <AdminOnlyPage>
                <MapPage />
              </AdminOnlyPage>
            }
          />
          <Route
            path="roles"
            element={
              <AdminOnlyPage>
                <Navigate to="/team/roles" replace />
              </AdminOnlyPage>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </AuthProvider>
  );
}
