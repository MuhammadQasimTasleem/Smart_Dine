import { useState, useEffect } from "react";
import { FiEye, FiUserCheck, FiUserX, FiTrash2, FiShield } from "react-icons/fi";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import {
  getUsers,
  getUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
} from "../services/adminService";
import "../styles/admin.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (statusFilter) params.is_active = statusFilter;
      const data = await getUsers(params);
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    {
      key: "first_name",
      label: "Name",
      render: (val, row) => `${val || ""} ${row.last_name || ""}`.trim() || "-",
    },
    { key: "phone", label: "Phone", render: (val) => val || "-" },
    {
      key: "is_staff",
      label: "Role",
      render: (val, row) => (
        <span className={`role-badge ${row.is_superuser ? "superuser" : val ? "staff" : "user"}`}>
          {row.is_superuser ? "Super Admin" : val ? "Staff" : "User"}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (val) => (
        <span className={`status-badge ${val ? "status-active" : "status-inactive"}`}>
          {val ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "date_joined",
      label: "Joined",
      render: (val) => new Date(val).toLocaleDateString(),
    },
  ];

  const handleViewUser = async (user) => {
    try {
      const userData = await getUser(user.id);
      setSelectedUser(userData);
      setDetailModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await toggleUserStatus(userId);
      fetchUsers();
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => ({ ...prev, is_active: !prev.is_active }));
      }
    } catch (err) {
      console.error("Failed to toggle user status:", err);
      alert("Failed to update user status.");
    }
  };

  const handleMakeStaff = async (userId, isStaff) => {
    try {
      await updateUser(userId, { is_staff: isStaff });
      fetchUsers();
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => ({ ...prev, is_staff: isStaff }));
      }
    } catch (err) {
      console.error("Failed to update user role:", err);
      alert("Failed to update user role.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteUser(userId);
        fetchUsers();
        setDetailModalOpen(false);
      } catch (err) {
        console.error("Failed to delete user:", err);
        alert(err.response?.data?.error || "Failed to delete user.");
      }
    }
  };

  const actions = (row) => (
    <div className="table-actions">
      <button
        className="action-btn view"
        onClick={(e) => {
          e.stopPropagation();
          handleViewUser(row);
        }}
        title="View Details"
      >
        <FiEye />
      </button>
      {!row.is_superuser && (
        <>
          <button
            className={`action-btn ${row.is_active ? "ban" : "unban"}`}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(row.id);
            }}
            title={row.is_active ? "Deactivate User" : "Activate User"}
          >
            {row.is_active ? <FiUserX /> : <FiUserCheck />}
          </button>
          <button
            className="action-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteUser(row.id);
            }}
            title="Delete User"
          >
            <FiTrash2 />
          </button>
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>View and manage registered users</p>
        </div>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Users</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="page-content">
        <DataTable
          columns={columns}
          data={users}
          searchable={true}
          searchPlaceholder="Search users..."
          pageSize={10}
          actions={actions}
          onRowClick={handleViewUser}
        />
      </div>

      {/* User Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="User Details"
        size="medium"
      >
        {selectedUser && (
          <div className="user-details">
            <div className="user-avatar-large">
              {selectedUser.username?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="user-info-grid">
              <div className="info-item">
                <label>Username</label>
                <p>{selectedUser.username}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{selectedUser.email}</p>
              </div>
              <div className="info-item">
                <label>Full Name</label>
                <p>
                  {`${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`.trim() ||
                    "Not provided"}
                </p>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <p>{selectedUser.phone || "Not provided"}</p>
              </div>
              <div className="info-item">
                <label>Address</label>
                <p>{selectedUser.address || "Not provided"}</p>
              </div>
              <div className="info-item">
                <label>Role</label>
                <p>
                  <span
                    className={`role-badge ${
                      selectedUser.is_superuser
                        ? "superuser"
                        : selectedUser.is_staff
                        ? "staff"
                        : "user"
                    }`}
                  >
                    {selectedUser.is_superuser
                      ? "Super Admin"
                      : selectedUser.is_staff
                      ? "Staff"
                      : "User"}
                  </span>
                </p>
              </div>
              <div className="info-item">
                <label>Status</label>
                <p>
                  <span
                    className={`status-badge ${
                      selectedUser.is_active ? "status-active" : "status-inactive"
                    }`}
                  >
                    {selectedUser.is_active ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div className="info-item">
                <label>Joined</label>
                <p>{new Date(selectedUser.date_joined).toLocaleString()}</p>
              </div>
              <div className="info-item">
                <label>Last Login</label>
                <p>
                  {selectedUser.last_login
                    ? new Date(selectedUser.last_login).toLocaleString()
                    : "Never"}
                </p>
              </div>
            </div>

            {!selectedUser.is_superuser && (
              <div className="user-actions">
                <button
                  className={`${selectedUser.is_active ? "danger-btn" : "primary-btn"}`}
                  onClick={() => handleToggleStatus(selectedUser.id)}
                >
                  {selectedUser.is_active ? (
                    <>
                      <FiUserX /> Deactivate User
                    </>
                  ) : (
                    <>
                      <FiUserCheck /> Activate User
                    </>
                  )}
                </button>

                <button
                  className={`${selectedUser.is_staff ? "warning-btn" : "secondary-btn"}`}
                  onClick={() => handleMakeStaff(selectedUser.id, !selectedUser.is_staff)}
                >
                  <FiShield />
                  {selectedUser.is_staff ? "Remove Staff Role" : "Make Staff"}
                </button>

                <button
                  className="danger-btn"
                  onClick={() => handleDeleteUser(selectedUser.id)}
                >
                  <FiTrash2 /> Delete User
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageUsers;
