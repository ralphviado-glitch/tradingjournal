import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Trades from "./pages/Trades";

function AppWrapper() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const showSidebar = user && location.pathname !== "/login";

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* Sidebar */}
        {showSidebar && (
          <aside className="col-2 p-0">
            <Sidebar />
          </aside>
        )}

        {/* Main Content */}
        <main className={showSidebar ? "col-10 p-4" : "col-12 p-4"}>
          <Routes>
            {/* Login */}
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
            />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={user ? <Dashboard /> : <Navigate to="/login" replace />}
            />

            {/* Trades */}
            <Route
              path="/trades"
              element={user ? <Trades /> : <Navigate to="/login" replace />}
            />

            {/* Default */}
            <Route
              path="*"
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
