/**
 * preview.entry.tsx
 *
 * Folder-local entry point for the standalone preview page.
 * NOT imported or registered anywhere in the main Stealth Mail app.
 *
 * To run:
 *   npx serve tools/v2/team/vendor-mail-tracker
 *   open http://localhost:3000/preview.html
 *
 * Or with Vite (from any vite-enabled environment):
 *   vite tools/v2/team/vendor-mail-tracker/preview.html
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { VendorTrackerApp } from "./components/VendorTrackerApp";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found in preview.html");

createRoot(container).render(
  <StrictMode>
    <VendorTrackerApp />
  </StrictMode>,
);
