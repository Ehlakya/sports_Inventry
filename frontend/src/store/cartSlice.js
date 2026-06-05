import { createSlice } from '@reduxjs/toolkit';

// Read initial cart state from localStorage
let initialCartItems = [];
try {
  const itemsStr = localStorage.getItem('cartItems');
  if (itemsStr) {
    initialCartItems = JSON.parse(itemsStr);
  }
} catch (e) {
  console.error('Error parsing cart items from localStorage:', e);
}

const initialState = {
  items: initialCartItems
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { productId, productName, brand, size, quantity, price, availableStock } = action.payload;
      
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === productId && item.size === size
      );

      if (existingItemIndex > -1) {
        // Increment quantity, bounding to available stock
        const newQty = state.items[existingItemIndex].quantity + quantity;
        state.items[existingItemIndex].quantity = Math.min(newQty, availableStock);
      } else {
        // Add new item
        state.items.push({
          productId,
          productName,
          brand,
          size,
          quantity: Math.min(quantity, availableStock),
          price,
          availableStock
        });
      }

      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      const { productId, size } = action.payload;
      state.items = state.items.filter(
        (item) => !(item.productId === productId && item.size === size)
      );
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { productId, size, quantity } = action.payload;
      const item = state.items.find(
        (item) => item.productId === productId && item.size === size
      );
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.availableStock));
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cartItems');
    }
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

// Selectors for convenience
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalQuantity = (state) => 
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartSubtotal = (state) => 
  state.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

export default cartSlice.reducer;
