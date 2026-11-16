import {
  useNotifications,
} from "../../context/NotificationContext";

const NotificationDropdown = () => {
    const {notifications, } = useNotifications();

    return (
      <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-xl p-4 z-50">

        <h2 className="text-xl font-bold mb-4">
          Notifications
        </h2>

        <div className="space-y-3 max-h-96 overflow-y-auto">

          {notifications.length === 0 ? (
            <p className="text-gray-500">
              No notifications
            </p>
          ) : (
            notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="border rounded-xl p-4"
                >

                  <h3 className="font-bold">
                    {notification.title}
                  </h3>

                  <p className="text-gray-600 text-sm mt-1">
                    {notification.message}
                  </p>
                </div>
              )
            )
          )}
        </div>
      </div>
    );
  };

export default NotificationDropdown;