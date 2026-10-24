const ORDERS_KEY = 'stylestack_orders';
const CATALOG_KEY = 'stylestack_catalog_v11';

/**
 * Retrieve all confirmed orders from localStorage.
 */
export const getStoredOrders = () => {
  try {
    const data = localStorage.getItem(ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading stored orders:', err);
    return [];
  }
};

/**
 * Decrement inventory in local catalog storage when an order is confirmed.
 * Ensures stock levels never drop below zero.
 */
export const decrementProductStock = (orderedItems = []) => {
  if (!orderedItems || !orderedItems.length) return;

  try {
    const rawCatalog = localStorage.getItem(CATALOG_KEY);
    if (!rawCatalog) return;

    const catalog = JSON.parse(rawCatalog);
    let changed = false;

    const updatedCatalog = catalog.map((product) => {
      // Match ordered items by ID or matching product name
      const matchedItem = orderedItems.find(
        (item) => item.id === product.id || item.name === product.name
      );

      if (matchedItem) {
        changed = true;
        const qtyToDeduct = Number(matchedItem.quantity) || 1;
        const currentStock = typeof product.inStock === 'number' ? product.inStock : 15;
        const newStock = Math.max(0, currentStock - qtyToDeduct);
        return {
          ...product,
          inStock: newStock,
        };
      }
      return product;
    });

    if (changed) {
      localStorage.setItem(CATALOG_KEY, JSON.stringify(updatedCatalog));
      window.dispatchEvent(new Event('stylestack_catalog_updated'));
    }
  } catch (err) {
    console.error('Error decrementing product stock:', err);
  }
};

/**
 * Persist a newly placed order to shared storage,
 * decrement ordered product quantities, and notify active listeners.
 */
export const saveNewOrder = (order) => {
  try {
    const existing = getStoredOrders();
    const updated = [order, ...existing];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));

    // Decrement stock for all items in the order
    if (order && order.items && order.items.length) {
      decrementProductStock(order.items);
    }

    // Broadcast synchronization event
    window.dispatchEvent(new Event('stylestack_orders_updated'));
    return updated;
  } catch (err) {
    console.error('Error saving new order:', err);
    return [];
  }
};

/**
 * Utility to restock a product directly from the admin panel.
 */
export const restockProduct = (productId, restockQuantity = 20) => {
  try {
    const rawCatalog = localStorage.getItem(CATALOG_KEY);
    if (!rawCatalog) return false;

    const catalog = JSON.parse(rawCatalog);
    const updated = catalog.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          inStock: (Number(p.inStock) || 0) + Number(restockQuantity),
        };
      }
      return p;
    });

    localStorage.setItem(CATALOG_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('stylestack_catalog_updated'));
    window.dispatchEvent(new Event('stylestack_orders_updated'));
    return true;
  } catch (err) {
    console.error('Error restocking product:', err);
    return false;
  }
};
