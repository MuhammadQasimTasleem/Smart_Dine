import { useState, useEffect } from "react";
import {
  FiShoppingBag,
  FiDollarSign,
  FiCalendar,
  FiUsers,
  FiTrendingUp,
  FiClock,
} from "react-icons/fi";
import StatsCard from "../components/StatsCard";
import DataTable from "../components/DataTable";
import { getDashboardStats } from "../services/adminService";
import "../styles/admin.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError("Failed to load dashboard stats");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const orderColumns = [
    { key: "id", label: "Order ID", width: "80px" },
    { key: "customer_name", label: "Customer" },
    { key: "total", label: "Total", render: (val) => `₹${val}` },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span className={`status-badge status-${val}`}>{val}</span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (val) => new Date(val).toLocaleDateString(),
    },
  ];

  const reservationColumns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "customer_name", label: "Customer" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "party_size", label: "Guests" },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span className={`status-badge status-${val}`}>{val}</span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <p>{error}</p>
        <button onClick={fetchDashboardStats}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          title="Total Orders"
          value={stats?.orders?.total || 0}
          icon={<FiShoppingBag />}
          color="primary"
          trend="up"
          trendValue={`${stats?.orders?.today || 0} today`}
        />
        <StatsCard
          title="Revenue"
          value={`₹${stats?.revenue?.total?.toFixed(2) || "0.00"}`}
          icon={<FiDollarSign />}
          color="success"
          trend="up"
          trendValue={`₹${stats?.revenue?.today?.toFixed(2) || "0.00"} today`}
        />
        <StatsCard
          title="Reservations"
          value={stats?.reservations?.total || 0}
          icon={<FiCalendar />}
          color="warning"
          trend="up"
          trendValue={`${stats?.reservations?.pending || 0} pending`}
        />
        <StatsCard
          title="Total Users"
          value={stats?.users?.total || 0}
          icon={<FiUsers />}
          color="info"
          trend="up"
          trendValue={`${stats?.users?.new_this_week || 0} this week`}
        />
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat">
          <FiClock className="quick-stat-icon" />
          <div className="quick-stat-content">
            <span className="quick-stat-value">
              {stats?.orders?.pending || 0}
            </span>
            <span className="quick-stat-label">Pending Orders</span>
          </div>
        </div>
        <div className="quick-stat">
          <FiTrendingUp className="quick-stat-icon" />
          <div className="quick-stat-content">
            <span className="quick-stat-value">
              ₹{stats?.revenue?.week?.toFixed(2) || "0.00"}
            </span>
            <span className="quick-stat-label">This Week Revenue</span>
          </div>
        </div>
        <div className="quick-stat">
          <FiCalendar className="quick-stat-icon" />
          <div className="quick-stat-content">
            <span className="quick-stat-value">
              {stats?.reservations?.today || 0}
            </span>
            <span className="quick-stat-label">Today's Reservations</span>
          </div>
        </div>
        <div className="quick-stat">
          <FiShoppingBag className="quick-stat-icon" />
          <div className="quick-stat-content">
            <span className="quick-stat-value">
              {stats?.menu?.active || 0}
            </span>
            <span className="quick-stat-label">Active Menu Items</span>
          </div>
        </div>
      </div>

      {/* Recent Data Tables */}
      <div className="dashboard-tables">
        <div className="dashboard-table-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <a href="/admin/orders" className="view-all-link">
              View All
            </a>
          </div>
          <DataTable
            columns={orderColumns}
            data={stats?.recent_orders || []}
            searchable={false}
            pageSize={5}
          />
        </div>

        <div className="dashboard-table-section">
          <div className="section-header">
            <h2>Recent Reservations</h2>
            <a href="/admin/reservations" className="view-all-link">
              View All
            </a>
          </div>
          <DataTable
            columns={reservationColumns}
            data={stats?.recent_reservations || []}
            searchable={false}
            pageSize={5}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
