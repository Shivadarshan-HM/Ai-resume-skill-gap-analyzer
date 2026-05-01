import { useEffect, useState } from "react";
import "./SplashScreen.css";

const SPLASH_DURATION_MS = 2800;
const EXIT_DURATION_MS = 450;

function SplashScreen({ onComplete }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const startExitAt = SPLASH_DURATION_MS - EXIT_DURATION_MS;

    const exitTimer = window.setTimeout(() => {
      setIsExiting(true);
    }, startExitAt);

    const completeTimer = window.setTimeout(() => {
      if (typeof onComplete === "function") {
        onComplete();
      }
    }, SPLASH_DURATION_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`splash-screen ${isExiting ? "is-exiting" : ""}`} role="status" aria-live="polite" aria-label="Loading CVisionary">
      <div className="splash-content">
        <div className="logo-scan-wrap">
          <img
            src="/logo.png"
            alt="CVisionary"
            className="splash-logo"
          />
        </div>
        <h1 className="splash-title">CVisionary</h1>
      </div>
    </div>
  );
}

export default SplashScreen;
