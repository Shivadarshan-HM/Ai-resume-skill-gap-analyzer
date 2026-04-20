import { useState, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./components/Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    // Simply restore from localStorage — no backend call needed on refresh
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setChecking(false);
  }, []);

  function handleLoginSuccess(userData) {
    setUser(userData);
    setAnalysisData(null);
  }

  function handleUserUpdate(updatedUser) {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
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
    onUserUpdate: handleUserUpdate,
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
          element={user ? <Navigate to="/dashboard" replace /> : <Landing />}
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
