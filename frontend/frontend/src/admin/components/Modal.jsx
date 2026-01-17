import { FiX } from "react-icons/fi";

const Modal = ({ isOpen, onClose, title, children, size = "medium" }) => {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className={`admin-modal admin-modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <h2>{title}</h2>
          <button className="admin-modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="admin-modal-content">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
