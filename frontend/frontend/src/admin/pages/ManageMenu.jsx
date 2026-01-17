import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from "react-icons/fi";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import {
  getMenuItems,
  getCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../services/adminService";
import "../styles/admin.css";

const ManageMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    is_veg: false,
    is_available: true,
    is_featured: false,
    rating: 4.0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsData, categoriesData] = await Promise.all([
        getMenuItems(),
        getCategories(),
      ]);
      setMenuItems(itemsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to fetch menu data:", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "image",
      label: "Image",
      width: "80px",
      render: (val) => (
        <img
          src={val || "https://via.placeholder.com/50"}
          alt="Item"
          className="menu-item-thumb"
        />
      ),
    },
    { key: "name", label: "Name" },
    { key: "category_name", label: "Category" },
    { key: "price", label: "Price", render: (val) => `₹${val}` },
    {
      key: "is_veg",
      label: "Type",
      render: (val) => (
        <span className={`type-badge ${val ? "veg" : "non-veg"}`}>
          {val ? "Veg" : "Non-Veg"}
        </span>
      ),
    },
    {
      key: "is_available",
      label: "Available",
      render: (val) => (
        <span className={`availability-badge ${val ? "available" : "unavailable"}`}>
          {val ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "is_featured",
      label: "Featured",
      render: (val) => (val ? "⭐" : "-"),
    },
  ];

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category || "",
        image: item.image || "",
        is_veg: item.is_veg,
        is_available: item.is_available,
        is_featured: item.is_featured,
        rating: item.rating,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        is_veg: false,
        is_available: true,
        is_featured: false,
        rating: 4.0,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        category: formData.category || null,
      };

      if (editingItem) {
        await updateMenuItem(editingItem.id, data);
      } else {
        await createMenuItem(data);
      }
      
      fetchData();
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save menu item:", err);
      alert("Failed to save menu item. Please try again.");
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await deleteMenuItem(item.id);
        fetchData();
      } catch (err) {
        console.error("Failed to delete menu item:", err);
        alert("Failed to delete menu item.");
      }
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await updateMenuItem(item.id, { is_available: !item.is_available });
      fetchData();
    } catch (err) {
      console.error("Failed to update availability:", err);
    }
  };

  const actions = (row) => (
    <div className="table-actions">
      <button
        className="action-btn edit"
        onClick={(e) => {
          e.stopPropagation();
          handleOpenModal(row);
        }}
        title="Edit"
      >
        <FiEdit2 />
      </button>
      <button
        className="action-btn toggle"
        onClick={(e) => {
          e.stopPropagation();
          handleToggleAvailability(row);
        }}
        title={row.is_available ? "Mark Unavailable" : "Mark Available"}
      >
        {row.is_available ? <FiEyeOff /> : <FiEye />}
      </button>
      <button
        className="action-btn delete"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(row);
        }}
        title="Delete"
      >
        <FiTrash2 />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Menu Management</h1>
          <p>Manage your restaurant menu items</p>
        </div>
        <button className="primary-btn" onClick={() => handleOpenModal()}>
          <FiPlus /> Add Item
        </button>
      </div>

      <div className="page-content">
        <DataTable
          columns={columns}
          data={menuItems}
          searchable={true}
          searchPlaceholder="Search menu items..."
          pageSize={10}
          actions={actions}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingItem ? "Edit Menu Item" : "Add Menu Item"}
        size="large"
      >
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price (₹) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="rating">Rating</label>
              <input
                type="number"
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                min="0"
                max="5"
                step="0.1"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image">Image URL</label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-row checkboxes">
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="is_veg"
                  checked={formData.is_veg}
                  onChange={handleInputChange}
                />
                Vegetarian
              </label>
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleInputChange}
                />
                Available
              </label>
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                />
                Featured
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="secondary-btn" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              {editingItem ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageMenu;
