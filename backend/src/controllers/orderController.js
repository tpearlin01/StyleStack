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

    res.status(201).json({
      success: true,
      data: newOrder,
      order: newOrder,
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
