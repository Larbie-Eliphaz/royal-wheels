import axios from "axios";
import toast from "react-hot-toast";
import {
  finishTransaction,
  startTransaction,
} from "./transactionProgress";

const API = axios.create({baseURL:"http://localhost:4400/api",});

const getSuccessMessage = (response) => {
  const serverMessage = response.data?.message;
  if (typeof serverMessage === "string" && serverMessage.trim()) {
    return serverMessage;
  }

  const url = response.config.url || "";
  if (url.includes("/auth/login")) return "Login successful.";
  if (url.includes("/auth/register")) return "Account created successfully.";
  if (url.includes("/auth/logout")) return "Logged out successfully.";
  if (url.includes("/cars/create")) return "Car uploaded successfully.";
  if (url.includes("/orders/create")) return "Order created successfully.";
  if (url.includes("/payment/initialize")) {
    return "Payment is ready. Continue to the secure payment page.";
  }
  if (url.includes("/payments/pay/")) return "Payment request submitted.";

  return "Changes saved successfully.";
};

API.interceptors.request.use(
    (config) => {const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (userInfo?.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }

    config.transactionProgressStarted = true;
    startTransaction();
    return config;
  }
);

API.interceptors.response.use(
  (response) => {
    if (response.config.transactionProgressStarted) {
      finishTransaction();
    }

    const method = response.config.method?.toLowerCase();
    if (
      !response.config.skipGlobalNotifications &&
      !response.config.skipGlobalSuccessNotification &&
      ["post", "put", "patch", "delete"].includes(method)
    ) {
      toast.success(getSuccessMessage(response));
    }

    return response;
  },
  (error) => {
    if (error.config?.transactionProgressStarted) {
      finishTransaction();
    }

    if (!error.config?.skipGlobalNotifications && !axios.isCancel(error)) {
      error.globalNotificationShown = true;
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again.",
      );
    }

    return Promise.reject(error);
  },
);

export default API;