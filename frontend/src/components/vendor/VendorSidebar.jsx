import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaCar, FaPlus, FaShoppingCart, FaHome, FaTimes, FaUser } from "react-icons/fa";
import LogoutButton from "../common/LogoutButton";

const VendorSidebar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menus = [
    {
      name: "Dashboard",
      path: "/vendor",
      icon: <FaHome />,
    },

    {
      name: "Upload Car",
      path: "/vendor/upload",
      icon: <FaPlus />,
    },

    {
      name: "My Cars",
      path: "/vendor/cars",
      icon: <FaCar />,
    },

    {
      name: "Orders",
      path: "/vendor/orders",
      icon: <FaShoppingCart />,
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
        <h1 className="text-3xl font-bold text-orange-500">Vendor Panel</h1>
        <button
          type="button"
          className="dashboard-menu-toggle"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          aria-label={isMenuOpen ? "Close vendor navigation" : "Open vendor navigation"}
          aria-expanded={isMenuOpen}
          aria-controls="vendor-navigation"
        >
          {isMenuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
        </button>
      </div>

      <nav id="vendor-navigation" className="dashboard-sidebar-nav space-y-3 flex-1">
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

export default VendorSidebar;
