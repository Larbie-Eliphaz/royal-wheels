let pendingRequests = 0;
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => listener(pendingRequests));
};

export const startTransaction = () => {
  pendingRequests += 1;
  notifyListeners();
};

export const finishTransaction = () => {
  pendingRequests = Math.max(0, pendingRequests - 1);
  notifyListeners();
};

export const subscribeToTransactions = (listener) => {
  listeners.add(listener);
  listener(pendingRequests);

  return () => listeners.delete(listener);
};
