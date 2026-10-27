import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./auth/AuthContext.tsx";
import { App } from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { TauriConfigGate } from './tauri/TauriConfigGate.tsx';
import { applyMotionSetting } from './tauri/motion.ts';

const queryClient = new QueryClient();

// The Tauri webviews blink through animations, so disable them before the
// first render (see src/tauri/motion.ts). No-op on the web.
applyMotionSetting();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <CssBaseline />
      {/* The Tauri app asks for its server here before anything calls it. */}
      <TauriConfigGate>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryClientProvider>
      </TauriConfigGate>
    </ThemeProvider>
  </StrictMode>
);
