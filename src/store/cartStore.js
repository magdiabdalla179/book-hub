import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1, selectedFormat = null) => {
        const { items } = get();
        const format = selectedFormat || product.format;
        const existingIndex = items.findIndex(
          (i) => i.product._id === product._id && i.selectedFormat === format
        );

        if (existingIndex >= 0) {
          const newItems = [...items];
          newItems[existingIndex].quantity += quantity;
          set({ items: newItems });
        } else {
          set({ items: [...items, { product, quantity, selectedFormat: format }] });
        }
      },

      updateItemFormat: (productId, newFormat) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (i) => i.product._id === productId && i.selectedFormat === newFormat
        );
        if (existingIndex >= 0) {
          const item = items.find((i) => i.product._id === productId);
          if (item) {
            get().updateQuantity(item.product._id, 0);
            get().addItem(item.product, item.quantity, newFormat);
          }
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product._id === productId ? { ...i, selectedFormat: newFormat } : i
          ),
        }));
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product._id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product._id === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => {
          const price = i.product.discountPrice ?? i.product.price;
          return sum + price * i.quantity;
        }, 0),

      shippingCost: () => {
        const hasPhysical = get().items.some(
          (i) => (i.selectedFormat || i.product.format) === 'physical'
        );
        return hasPhysical ? 2000 : 0;
      },

      tax: () => Math.round(get().subtotal() * 0.18),

      total: () => get().subtotal() + get().shippingCost() + get().tax(),
    }),
    {
      name: 'bookhub-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
