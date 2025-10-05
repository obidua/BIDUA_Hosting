import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { cartService, Cart, CartItem } from '../services/cart';

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  total: number;
  loading: boolean;
  addToCart: (
    productId: string,
    billingCycle: CartItem['billing_cycle'],
    price: number,
    monthlyPrice: number,
    configuration?: CartItem['configuration']
  ) => Promise<boolean>;
  updateItem: (
    itemId: string,
    updates: {
      billing_cycle?: CartItem['billing_cycle'];
      quantity?: number;
      price?: number;
      monthly_price?: number;
      configuration?: CartItem['configuration'];
    }
  ) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    if (!user) {
      setCart(null);
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userCart = await cartService.getOrCreateCart(user.id);
    if (userCart) {
      setCart(userCart);
      setItems(userCart.items);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  const addToCart = async (
    productId: string,
    billingCycle: CartItem['billing_cycle'],
    price: number,
    monthlyPrice: number,
    configuration?: CartItem['configuration']
  ): Promise<boolean> => {
    if (!cart) return false;

    const newItem = await cartService.addToCart(
      cart.id,
      productId,
      billingCycle,
      price,
      monthlyPrice,
      configuration
    );

    if (newItem) {
      setItems((prev) => [newItem, ...prev]);
      return true;
    }

    return false;
  };

  const updateItem = async (
    itemId: string,
    updates: {
      billing_cycle?: CartItem['billing_cycle'];
      quantity?: number;
      price?: number;
      monthly_price?: number;
      configuration?: CartItem['configuration'];
    }
  ): Promise<boolean> => {
    const success = await cartService.updateCartItem(itemId, updates);

    if (success) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      );
      return true;
    }

    return false;
  };

  const removeItem = async (itemId: string): Promise<boolean> => {
    const success = await cartService.removeFromCart(itemId);

    if (success) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      return true;
    }

    return false;
  };

  const clearCart = async (): Promise<boolean> => {
    if (!cart) return false;

    const success = await cartService.clearCart(cart.id);

    if (success) {
      setItems([]);
      return true;
    }

    return false;
  };

  const refreshCart = async () => {
    await loadCart();
  };

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const total = cartService.calculateTotal(items);

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        total,
        loading,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
