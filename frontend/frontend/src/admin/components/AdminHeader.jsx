import { FiMenu, FiBell, FiSearch } from "react-icons/fi";

const AdminHeader = ({ title, onMenuClick }) => {
  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button className="admin-menu-btn" onClick={onMenuClick}>
          <FiMenu />
        </button>
        <h1 className="admin-page-title">{title}</h1>
      </div>

      <div className="admin-header-right">
        <div className="admin-search">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search..." />
        </div>

        <button className="admin-notification-btn">
          <FiBell />
          <span className="notification-badge">3</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
