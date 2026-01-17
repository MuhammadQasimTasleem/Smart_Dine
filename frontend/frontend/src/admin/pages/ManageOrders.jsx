import { useState, useEffect } from "react";
import { FiEye, FiCheck, FiX, FiTruck, FiClock } from "react-icons/fi";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { getOrders, updateOrderStatus } from "../services/adminService";
import "../styles/admin.css";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await getOrders(params);
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "id", label: "Order #", width: "80px" },
    { key: "customer_name", label: "Customer" },
    { key: "customer_phone", label: "Phone" },
    {
      key: "order_type",
      label: "Type",
      render: (val) => (
        <span className={`order-type-badge ${val}`}>
          {val.replace("_", " ")}
        </span>
      ),
    },
    { key: "total", label: "Total", render: (val) => `₹${val}` },
    {
      key: "payment_status",
      label: "Payment",
      render: (val) => (
        <span className={`payment-badge payment-${val}`}>{val}</span>
      ),
    },
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
      render: (val) => new Date(val).toLocaleString(),
    },
  ];

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await updateOrderStatus(orderId, newStatus);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ 
          ...prev, 
          status: newStatus,
          // Update payment status if returned from backend
          payment_status: response.payment_status || prev.payment_status
        }));
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status.");
    }
  };

  const getStatusActions = (order) => {
    const statusFlow = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: ["ready", "cancelled"],
      ready: ["delivered"],
      delivered: [],
      cancelled: [],
    };

    return statusFlow[order.status] || [];
  };

  const actions = (row) => (
    <div className="table-actions">
      <button
        className="action-btn view"
        onClick={(e) => {
          e.stopPropagation();
          handleViewOrder(row);
        }}
        title="View Details"
      >
        <FiEye />
      </button>
      {getStatusActions(row).includes("confirmed") && (
        <button
          className="action-btn confirm"
          onClick={(e) => {
            e.stopPropagation();
            handleStatusChange(row.id, "confirmed");
          }}
          title="Confirm Order"
        >
          <FiCheck />
        </button>
      )}
      {getStatusActions(row).includes("preparing") && (
        <button
          className="action-btn preparing"
          onClick={(e) => {
            e.stopPropagation();
            handleStatusChange(row.id, "preparing");
          }}
          title="Start Preparing"
        >
          <FiClock />
        </button>
      )}
      {getStatusActions(row).includes("delivered") && (
        <button
          className="action-btn deliver"
          onClick={(e) => {
            e.stopPropagation();
            handleStatusChange(row.id, "delivered");
          }}
          title="Mark Delivered"
        >
          <FiTruck />
        </button>
      )}
      {getStatusActions(row).includes("cancelled") && (
        <button
          className="action-btn cancel"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm("Are you sure you want to cancel this order?")) {
              handleStatusChange(row.id, "cancelled");
            }
          }}
          title="Cancel Order"
        >
          <FiX />
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Order Management</h1>
          <p>View and manage customer orders</p>
        </div>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="page-content">
        <DataTable
          columns={columns}
          data={orders}
          searchable={true}
          searchPlaceholder="Search orders..."
          pageSize={10}
          actions={actions}
          onRowClick={handleViewOrder}
        />
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Order #${selectedOrder?.id}`}
        size="large"
      >
        {selectedOrder && (
          <div className="order-details">
            <div className="order-info-grid">
              <div className="order-info-section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                {selectedOrder.customer_address && (
                  <p><strong>Address:</strong> {selectedOrder.customer_address}</p>
                )}
              </div>
              <div className="order-info-section">
                <h3>Order Information</h3>
                <p><strong>Type:</strong> {selectedOrder.order_type.replace("_", " ")}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status-badge status-${selectedOrder.status}`}>
                    {selectedOrder.status}
                  </span>
                </p>
                <p>
                  <strong>Payment:</strong>{" "}
                  <span className={`payment-badge payment-${selectedOrder.payment_status}`}>
                    {selectedOrder.payment_status}
                  </span>
                </p>
                <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
            </div>

            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="order-items-section">
                <h3>Order Items</h3>
                <table className="order-items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.item_name}</td>
                        <td>₹{item.item_price}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.subtotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{selectedOrder.subtotal}</span>
              </div>
              <div className="total-row">
                <span>Tax:</span>
                <span>₹{selectedOrder.tax}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total:</span>
                <span>₹{selectedOrder.total}</span>
              </div>
            </div>

            {selectedOrder.special_instructions && (
              <div className="special-instructions">
                <h3>Special Instructions</h3>
                <p>{selectedOrder.special_instructions}</p>
              </div>
            )}

            <div className="order-actions">
              <h3>Update Status</h3>
              <div className="status-buttons">
                {getStatusActions(selectedOrder).map((status) => (
                  <button
                    key={status}
                    className={`status-btn status-btn-${status}`}
                    onClick={() => handleStatusChange(selectedOrder.id, status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageOrders;
