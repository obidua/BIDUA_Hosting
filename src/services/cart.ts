import { supabase } from '../lib/supabase';

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  billing_cycle: 'monthly' | 'quarterly' | 'semiannually' | 'annually' | 'biennially' | 'triennially';
  quantity: number;
  price: number;
  monthly_price: number;
  configuration: {
    hostname?: string;
    datacenter_id?: string;
    os_template_id?: string;
    addons?: string[];
  };
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    category: string;
    vcpu: number;
    ram: number;
    storage: number;
    bandwidth: number;
    features: string[];
  };
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export const cartService = {
  async getOrCreateCart(userId: string): Promise<Cart | null> {
    const { data: existingCart, error: fetchError } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching cart:', fetchError);
      return null;
    }

    if (existingCart) {
      const items = await this.getCartItems(existingCart.id);
      return { ...existingCart, items };
    }

    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select()
      .single();

    if (createError) {
      console.error('Error creating cart:', createError);
      return null;
    }

    return { ...newCart, items: [] };
  },

  async getCartItems(cartId: string): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(
          id,
          name,
          category,
          vcpu,
          ram,
          storage,
          bandwidth,
          features
        )
      `)
      .eq('cart_id', cartId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cart items:', error);
      return [];
    }

    return data || [];
  },

  async addToCart(
    cartId: string,
    productId: string,
    billingCycle: CartItem['billing_cycle'],
    price: number,
    monthlyPrice: number,
    configuration: CartItem['configuration'] = {}
  ): Promise<CartItem | null> {
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cartId,
        product_id: productId,
        billing_cycle: billingCycle,
        quantity: 1,
        price,
        monthly_price: monthlyPrice,
        configuration,
      })
      .select(`
        *,
        product:products(
          id,
          name,
          category,
          vcpu,
          ram,
          storage,
          bandwidth,
          features
        )
      `)
      .single();

    if (error) {
      console.error('Error adding to cart:', error);
      return null;
    }

    await this.updateCartTimestamp(cartId);
    return data;
  },

  async updateCartItem(
    itemId: string,
    updates: {
      billing_cycle?: CartItem['billing_cycle'];
      quantity?: number;
      price?: number;
      monthly_price?: number;
      configuration?: CartItem['configuration'];
    }
  ): Promise<boolean> {
    const { error } = await supabase
      .from('cart_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating cart item:', error);
      return false;
    }

    return true;
  },

  async removeFromCart(itemId: string): Promise<boolean> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error removing from cart:', error);
      return false;
    }

    return true;
  },

  async clearCart(cartId: string): Promise<boolean> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    if (error) {
      console.error('Error clearing cart:', error);
      return false;
    }

    return true;
  },

  async updateCartTimestamp(cartId: string): Promise<void> {
    await supabase
      .from('carts')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', cartId);
  },

  async getCartItemCount(cartId: string): Promise<number> {
    const { count } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('cart_id', cartId);

    return count || 0;
  },

  calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
};
