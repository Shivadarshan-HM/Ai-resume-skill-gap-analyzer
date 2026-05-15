import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./components/Dashboard";
import SplashScreen from "./components/SplashScreen";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { user, checking, logout, refreshCurrentUser } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [savedPrompt, setSavedPrompt] = useState("");
  const [savedRole, setSavedRole] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);

  function handleLoginSuccess() {
    setAnalysisData(null);
  }

  async function handleUserUpdate() {
    await refreshCurrentUser();
  }

  async function handleLogout() {
    await logout();
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
