import { useEffect } from "react";
import toast from "react-hot-toast";

const GlobalFrontendErrors = () => {
  useEffect(() => {
    const handleError = (event) => {
      if (!event.error) return;

      const message = event.error.message || "An unexpected application error occurred.";
      toast.error(`Application error: ${message}`);
    };

    const handleUnhandledRejection = (event) => {
      if (event.reason?.globalNotificationShown) return;

      const message =
        event.reason?.message ||
        (typeof event.reason === "string" ? event.reason : null) ||
        "An unexpected application error occurred.";
      toast.error(`Application error: ${message}`);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return null;
};

export default GlobalFrontendErrors;
