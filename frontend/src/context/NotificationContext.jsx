import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";
import socket from "../socket/socket";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?._id;
  const [notifications, setNotifications] = useState([]);
  const [notificationsForUserId, setNotificationsForUserId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorForUserId, setErrorForUserId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    if (!userId) return undefined;

    const fetchNotifications = async () => {
      try {
        const { data } = await API.get("/notifications");
        if (isMounted) {
          setNotifications(data.notifications || []);
          setNotificationsForUserId(userId);
          setErrorMessage("");
          setErrorForUserId(null);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.response?.data?.message || "Unable to load notifications.",
          );
          setErrorForUserId(userId);
        }
      }
    };

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return undefined;

    const handleNewNotification = (data) => {
      setNotifications((previous) => {
        const currentNotifications =
          notificationsForUserId === userId ? previous : [];
        return [
          data,
          ...currentNotifications.filter(
            (notification) => notification._id !== data._id,
          ),
        ];
      });
      setNotificationsForUserId(userId);
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [userId, notificationsForUserId]);

  return (
    <NotificationContext.Provider
      value={{
        notifications:
          notificationsForUserId === userId && userId ? notifications : [],
        errorMessage: errorForUserId === userId ? errorMessage : "",
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => useContext(NotificationContext);
