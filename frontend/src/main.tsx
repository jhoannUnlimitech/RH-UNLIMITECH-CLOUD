import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import App from "./App.tsx";
import { AppWrapper } from "./utils/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AppWrapper>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
            },
            success: {
              style: { background: '#10B981', color: '#fff' },
              iconTheme: { primary: '#fff', secondary: '#10B981' },
            },
            error: {
              style: { background: '#EF4444', color: '#fff' },
              iconTheme: { primary: '#fff', secondary: '#EF4444' },
            },
          }}
        />
      </AppWrapper>
    </ThemeProvider>
  </StrictMode>
);
