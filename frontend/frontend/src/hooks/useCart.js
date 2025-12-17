import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Re-export useCart from CartContext for backward compatibility
export { useCart } from "../context/CartContext";