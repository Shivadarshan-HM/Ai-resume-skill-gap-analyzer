import { useState, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./components/Dashboard";
import SplashScreen from "./components/SplashScreen";
import { getCurrentUser } from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [savedPrompt, setSavedPrompt] = useState("");
  const [savedRole, setSavedRole] = useState("");
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
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        const data = await getCurrentUser();
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setChecking(false);
      }
    }

    restoreSession();
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

  if (!user && showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  const dashboardProps = {
    user,
    onUserUpdate: handleUserUpdate,
    onLogout: handleLogout,
    analysisData,
    setAnalysisData,
    analysisLoading,
    setAnalysisLoading,
    selectedFile,
    setSelectedFile,
    savedPrompt,
    setSavedPrompt,
    savedRole,
    setSavedRole,
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
