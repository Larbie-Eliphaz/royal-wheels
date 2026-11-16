import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LogoutButton = ({ className = "" }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className={`${
        className ||
        "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition"
      } disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {loggingOut ? "Logging out..." : "Logout"}
    </button>
  );
};

export default LogoutButton;
