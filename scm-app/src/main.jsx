import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import SCMApp from "./SCM_App";

// ── Dark mode init: read preference before first render ──
const saved = localStorage.getItem("scm-theme");
if (saved === "dark") {
  document.documentElement.dataset.theme = "dark";
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SCMApp />
  </StrictMode>
);
