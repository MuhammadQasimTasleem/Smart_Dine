import { NavLink, useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import {
  FiHome,
  FiShoppingBag,
  FiCalendar,
  FiUsers,
  FiMenu,
  FiBarChart2,
  FiLogOut,
  FiX,
} from "react-icons/fi";

const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout, admin } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const menuItems = [
    { path: "/admin/dashboard", icon: <FiHome />, label: "Dashboard" },
    { path: "/admin/menu", icon: <FiMenu />, label: "Menu Management" },
    { path: "/admin/orders", icon: <FiShoppingBag />, label: "Orders" },
    { path: "/admin/reservations", icon: <FiCalendar />, label: "Reservations" },
    { path: "/admin/users", icon: <FiUsers />, label: "Users" },
    { path: "/admin/reports", icon: <FiBarChart2 />, label: "Reports" },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="admin-sidebar-overlay" onClick={onClose}></div>}

      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <span className="logo-icon">🍽️</span>
            <span className="logo-text">Smart Dine</span>
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="admin-user-info">
          <div className="admin-avatar">
            {admin?.username?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="admin-user-details">
            <span className="admin-username">{admin?.username || "Admin"}</span>
            <span className="admin-role">
              {admin?.is_superuser ? "Super Admin" : "Staff"}
            </span>
          </div>
        </div>

        <nav className="admin-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `admin-nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={onClose}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
