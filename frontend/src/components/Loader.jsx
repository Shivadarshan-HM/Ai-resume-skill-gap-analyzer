import { useEffect } from "react";
import "./Loader.css";

function Loader({ fullScreen = false }) {
  useEffect(() => {
    if (!fullScreen) return undefined;

    document.body.classList.add("cvisionary-loader-open");

    return () => {
      document.body.classList.remove("cvisionary-loader-open");
    };
  }, [fullScreen]);

  return (
    <div className={`cvisionary-loader-screen ${fullScreen ? "is-fullscreen" : ""}`} role="status" aria-live="polite" aria-label="Loading CVisionary">
      <div className="cvisionary-loader-content">
        <div className="cvisionary-loader-orb" aria-hidden="true">
          <span className="orb-ring orb-ring-a" />
          <span className="orb-ring orb-ring-b" />
          <span className="orb-core" />
        </div>

        <h2 className="cvisionary-loader-title">
          <span className="title-main">CVisionary</span>
          <span className="title-sub">Scanning your profile</span>
        </h2>

        <div className="cvisionary-loader-track" aria-hidden="true">
          <span className="track-glow" />
        </div>
      </div>
    </div>
  );
}

export default Loader;
