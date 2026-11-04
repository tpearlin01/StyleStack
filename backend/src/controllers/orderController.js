const store = require('../data/store');

const getOrders = async (req, res, next) => {
  try {
    const orders = store.getOrders();
    res.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = store.getOrderById(id);

    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { customerName, customerEmail, shippingAddress, items, paymentMethod, customer } = req.body;

    const newOrder = store.createOrder({
      customerName,
      customerEmail,
      shippingAddress,
      items,
      paymentMethod,
      customer,
    });

    // Streamline order payload: prune unneeded nested metadata for lean mobile network responses
    const streamlinedOrder = {
      id: newOrder.id || newOrder.orderId,
      orderId: newOrder.orderId || newOrder.id,
      customerName: newOrder.customerName,
      customerEmail: newOrder.customerEmail,
      shippingAddress: newOrder.shippingAddress,
      items: (newOrder.items || []).map((i) => ({
        id: i.id || i.productId,
        name: i.name,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
      })),
      subtotal: newOrder.subtotal,
      taxAmount: newOrder.taxAmount,
      totalAmount: newOrder.totalAmount,
      status: newOrder.status,
      paymentMethod: newOrder.paymentMethod,
      createdAt: newOrder.createdAt,
    };

    res.status(201).json({
      success: true,
      data: streamlinedOrder,
      order: streamlinedOrder,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = store.updateOrderStatus(id, status);
    res.json({
      success: true,
      data: updated,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
};
