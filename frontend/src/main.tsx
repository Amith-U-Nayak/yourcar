import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// Placeholder App — replaced in Phase 6
function App() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="font-display text-4xl font-bold text-brand">
        Yourcar 🏏
      </h1>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
