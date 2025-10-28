import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div>
      <h1>AC Companion Python</h1>
      <div>テスト</div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
