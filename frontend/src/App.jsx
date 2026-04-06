import { useState, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
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
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  if (checking) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            user
              ? <Navigate to="/dashboard" replace />
              : <Login onLoginSuccess={handleLoginSuccess} />
          }
        />
        <Route
          path="/dashboard"
          element={
            user
              ? <Dashboard user={user} onLogout={handleLogout} />
              : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
