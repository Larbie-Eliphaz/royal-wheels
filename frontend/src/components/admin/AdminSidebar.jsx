import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaUsers,
  FaCar,
  FaShoppingCart,
  FaMoneyBill,
  FaHome,
  FaEnvelope,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import LogoutButton from "../common/LogoutButton";

const AdminSidebar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menus = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <FaHome />,
    },

    {
      name: "Users",
      path: "/admin/users",
      icon: <FaUsers />,
    },

    {
      name: "Cars",
      path: "/admin/cars",
      icon: <FaCar />,
    },

    {
      name: "Orders",
      path: "/admin/orders",
      icon: <FaShoppingCart />,
    },

    {
      name: "Payments",
      path: "/admin/payments",
      icon: <FaMoneyBill />,
    },
    {
      name: "Complaints",
      path: "/admin/complaints",
      icon: <FaEnvelope />,
    },
    {
      name: "My Profile",
      path: "/profile",
      icon: <FaUser />,
    },
  ];

  return (
    <aside className={`dashboard-sidebar bg-slate-900 text-white p-6 flex flex-col${isMenuOpen ? " dashboard-menu-open" : ""}`}>
      <div className="dashboard-sidebar-header">
        <h1 className="text-3xl font-bold text-orange-500">Admin Panel</h1>
        <button
          type="button"
          className="dashboard-menu-toggle"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          aria-label={isMenuOpen ? "Close admin navigation" : "Open admin navigation"}
          aria-expanded={isMenuOpen}
          aria-controls="admin-navigation"
        >
          {isMenuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
        </button>
      </div>

      <nav id="admin-navigation" className="dashboard-sidebar-nav space-y-3 flex-1">
        {menus.map((menu) => (
          <Link
            key={menu.path}
            to={menu.path}
            onClick={() => setIsMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              location.pathname === menu.path ||
              (menu.path === "/profile" && location.pathname.startsWith("/profile"))
                ? "bg-orange-500"
                : "hover:bg-slate-800"
            }`}
          >
            {menu.icon}
            {menu.name}
          </Link>
        ))}
      </nav>

      <div className="dashboard-sidebar-logout mt-6">
        <LogoutButton className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-medium transition" />
      </div>
    </aside>
  );
};

export default AdminSidebar;
