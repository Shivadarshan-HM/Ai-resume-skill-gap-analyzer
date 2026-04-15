import { useState, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./components/Dashboard";

const API_URL = "http://127.0.0.1:5000";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (!token || !savedUser) {
        setChecking(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setChecking(false);
          return;
        }

        const data = await res.json();
        setUser(data.user || JSON.parse(savedUser));
      } catch {
        // If backend is temporarily unreachable, keep prior session state.
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } finally {
        setChecking(false);
      }
    }

    restoreSession();
  }, []);

  function handleLoginSuccess(userData) {
    setUser(userData);
    setAnalysisData(null); // Reset analysis on new login
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setAnalysisData(null);
  }

  if (checking) return null;

  const dashboardProps = {
    user,
    onLogout: handleLogout,
    analysisData,
    setAnalysisData,
    analysisLoading,
    setAnalysisLoading,
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            user
              ? <Navigate to="/dashboard" replace />
              : <Landing />
          }
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/forgot-password"
          element={user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
        />
        <Route
          path="/dashboard/*"
          element={user ? <Dashboard {...dashboardProps} /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
