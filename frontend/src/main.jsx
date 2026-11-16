import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import {NotificationProvider,} from "./context/NotificationContext";
import { Toaster } from "react-hot-toast";
import GlobalErrorBoundary from "./components/common/GlobalErrorBoundary";
import GlobalFrontendErrors from "./components/common/GlobalFrontendErrors";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
    <GlobalFrontendErrors />
    <Toaster position="top-right" />
  </React.StrictMode>
);
      