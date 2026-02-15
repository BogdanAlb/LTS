import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { SessionProvider } from "./auth/SessionContext";
import { LanguageProvider } from "./i18n/LanguageContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <SessionProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SessionProvider>
    </LanguageProvider>
  </StrictMode>,
);
