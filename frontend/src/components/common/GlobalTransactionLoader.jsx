import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { subscribeToTransactions } from "../../api/transactionProgress";
import TransactionLoader from "./TransactionLoader";

const GlobalTransactionLoader = () => {
  const location = useLocation();
  const previousLocationKey = useRef(location.key);
  const navigationTimeout = useRef(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => subscribeToTransactions(setPendingRequests), []);

  useEffect(() => {
    if (previousLocationKey.current === location.key) {
      return undefined;
    }

    previousLocationKey.current = location.key;
    setIsNavigating(true);
    window.clearTimeout(navigationTimeout.current);
    navigationTimeout.current = window.setTimeout(
      () => setIsNavigating(false),
      300,
    );
  }, [location.key]);

  useEffect(() => {
    return () => window.clearTimeout(navigationTimeout.current);
  }, []);

  if (!isNavigating && pendingRequests === 0) {
    return null;
  }

  return (
    <TransactionLoader
      message={
        pendingRequests > 0
          ? "Processing your request..."
          : "Loading page..."
      }
    />
  );
};

export default GlobalTransactionLoader;
