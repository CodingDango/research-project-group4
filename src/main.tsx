import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./components/providers/theme-provider.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import CoordinateApp from "./components/CoordinateApp.tsx";
import AppLayout from "./components/Layout.tsx";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<CoordinateApp />} />
          <Route path="/coordinate" element={<CoordinateApp />} />
          <Route path="/1-player" element={null} />
          <Route path="/2-player" element={null} />
        </Route>
      </Routes>
    </BrowserRouter>
  </ThemeProvider>,
);
