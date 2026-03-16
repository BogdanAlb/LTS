import { Navigate, Route, Routes } from "react-router-dom";
import { useSession } from "./auth/useSession";
import "./App.css";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Graph from "./pages/Graph";
import Home from "./pages/Home";
import KioskOrders from "./pages/KioskOrders";
import ReparaturFormular from "./pages/ReparaturFormular";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Status from "./pages/Status";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSession();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/grafic"
          element={(
            <ProtectedRoute>
              <Graph />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/status"
          element={(
            <ProtectedRoute>
              <Status />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/settings"
          element={(
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          )}
        />
        <Route path="/kiosk-orders" element={<KioskOrders />} />
        <Route path="/reparatur" element={<ReparaturFormular />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/home" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
