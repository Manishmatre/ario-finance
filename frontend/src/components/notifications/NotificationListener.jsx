import { useEffect } from "react";
import { socket } from "../../utils/socket";

/**
 * NotificationListener
 * Listens for real-time notifications from the backend and triggers a callback.
 * @param {function} onNotification - Callback to handle notification data
 */
function NotificationListener({ onNotification }) {
  useEffect(() => {
    socket.on("notification", (data) => {
      onNotification(data);
    });
    return () => {
      socket.off("notification");
    };
  }, [onNotification]);
  return null;
}

export default NotificationListener;
