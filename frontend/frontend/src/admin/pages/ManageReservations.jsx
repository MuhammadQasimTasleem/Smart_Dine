import { useState, useEffect } from "react";
import { FiEye, FiCheck, FiX, FiEdit2 } from "react-icons/fi";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import {
  getReservations,
  updateReservationStatus,
  updateReservation,
} from "../services/adminService";
import "../styles/admin.css";

const ManageReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const fetchReservations = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await getReservations(params);
      setReservations(data);
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "customer_name", label: "Customer" },
    { key: "customer_phone", label: "Phone" },
    { key: "date", label: "Date" },
    {
      key: "time",
      label: "Time",
      render: (val) => val?.slice(0, 5) || val,
    },
    { key: "party_size", label: "Guests" },
    { key: "table_number", label: "Table", render: (val) => val || "-" },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span className={`status-badge status-${val}`}>{val}</span>
      ),
    },
  ];

  const handleViewReservation = (reservation) => {
    setSelectedReservation(reservation);
    setTableNumber(reservation.table_number || "");
    setDetailModalOpen(true);
  };

  const handleStatusChange = async (reservationId, newStatus, table = null) => {
    try {
      await updateReservationStatus(reservationId, newStatus, table);
      fetchReservations();
      if (selectedReservation?.id === reservationId) {
        setSelectedReservation((prev) => ({
          ...prev,
          status: newStatus,
          table_number: table || prev.table_number,
        }));
      }
    } catch (err) {
      console.error("Failed to update reservation status:", err);
      alert("Failed to update reservation status.");
    }
  };

  const handleConfirmWithTable = () => {
    if (!tableNumber) {
      alert("Please assign a table number");
      return;
    }
    handleStatusChange(selectedReservation.id, "confirmed", tableNumber);
  };

  const actions = (row) => (
    <div className="table-actions">
      <button
        className="action-btn view"
        onClick={(e) => {
          e.stopPropagation();
          handleViewReservation(row);
        }}
        title="View Details"
      >
        <FiEye />
      </button>
      {row.status === "pending" && (
        <>
          <button
            className="action-btn confirm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewReservation(row);
            }}
            title="Confirm Reservation"
          >
            <FiCheck />
          </button>
          <button
            className="action-btn cancel"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("Are you sure you want to cancel this reservation?")) {
                handleStatusChange(row.id, "cancelled");
              }
            }}
            title="Cancel Reservation"
          >
            <FiX />
          </button>
        </>
      )}
      {row.status === "confirmed" && (
        <button
          className="action-btn complete"
          onClick={(e) => {
            e.stopPropagation();
            handleStatusChange(row.id, "completed");
          }}
          title="Mark Completed"
        >
          <FiCheck />
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading reservations...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Reservation Management</h1>
          <p>View and manage table reservations</p>
        </div>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Reservations</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        </div>
      </div>

      <div className="page-content">
        <DataTable
          columns={columns}
          data={reservations}
          searchable={true}
          searchPlaceholder="Search reservations..."
          pageSize={10}
          actions={actions}
          onRowClick={handleViewReservation}
        />
      </div>

      {/* Reservation Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Reservation #${selectedReservation?.id}`}
        size="medium"
      >
        {selectedReservation && (
          <div className="reservation-details">
            <div className="reservation-info-grid">
              <div className="info-item">
                <label>Customer Name</label>
                <p>{selectedReservation.customer_name}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{selectedReservation.customer_email}</p>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <p>{selectedReservation.customer_phone}</p>
              </div>
              <div className="info-item">
                <label>Date</label>
                <p>{selectedReservation.date}</p>
              </div>
              <div className="info-item">
                <label>Time</label>
                <p>{selectedReservation.time?.slice(0, 5)}</p>
              </div>
              <div className="info-item">
                <label>Party Size</label>
                <p>{selectedReservation.party_size} guests</p>
              </div>
              <div className="info-item">
                <label>Status</label>
                <p>
                  <span className={`status-badge status-${selectedReservation.status}`}>
                    {selectedReservation.status}
                  </span>
                </p>
              </div>
              <div className="info-item">
                <label>Table Number</label>
                <p>{selectedReservation.table_number || "Not assigned"}</p>
              </div>
            </div>

            {selectedReservation.special_requests && (
              <div className="special-requests">
                <label>Special Requests</label>
                <p>{selectedReservation.special_requests}</p>
              </div>
            )}

            {selectedReservation.status === "pending" && (
              <div className="confirm-section">
                <h3>Confirm Reservation</h3>
                <div className="form-group">
                  <label htmlFor="tableNumber">Assign Table Number *</label>
                  <input
                    type="text"
                    id="tableNumber"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="e.g., T1, T2, VIP1"
                  />
                </div>
                <div className="action-buttons">
                  <button
                    className="primary-btn"
                    onClick={handleConfirmWithTable}
                  >
                    <FiCheck /> Confirm Reservation
                  </button>
                  <button
                    className="danger-btn"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to cancel?")) {
                        handleStatusChange(selectedReservation.id, "cancelled");
                        setDetailModalOpen(false);
                      }
                    }}
                  >
                    <FiX /> Cancel Reservation
                  </button>
                </div>
              </div>
            )}

            {selectedReservation.status === "confirmed" && (
              <div className="action-buttons">
                <button
                  className="primary-btn"
                  onClick={() => {
                    handleStatusChange(selectedReservation.id, "completed");
                    setDetailModalOpen(false);
                  }}
                >
                  <FiCheck /> Mark as Completed
                </button>
                <button
                  className="warning-btn"
                  onClick={() => {
                    handleStatusChange(selectedReservation.id, "no_show");
                    setDetailModalOpen(false);
                  }}
                >
                  Mark as No Show
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageReservations;
