import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // Initialize from localStorage
    const savedCart = localStorage.getItem('sharplab_cart');
    return savedCart ? JSON.parse(savedCart) : { items: [], totalItems: 0, totalPrice: 0 };
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sharplab_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.items.find(item => item.productId === product.id);
      
      let newItems;
      if (existingItem) {
        // Update quantity if item already exists
        newItems = prevCart.items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [
          ...prevCart.items,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.image_name,
            stock: product.stock
          }
        ];
      }

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return { items: newItems, totalItems, totalPrice };
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter(item => item.productId !== productId);
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return { items: newItems, totalItems, totalPrice };
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      );

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return { items: newItems, totalItems, totalPrice };
    });
  };

  const clearCart = () => {
    setCart({ items: [], totalItems: 0, totalPrice: 0 });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
