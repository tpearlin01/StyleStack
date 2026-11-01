const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const store = require('../data/store');
const emailService = require('../services/emailService');
const { isMongoDBConnected } = require('../config/db');

const normalizeOrder = (o) => {
  if (!o) return null;
  const obj = o.toObject ? o.toObject() : { ...o };
  const orderId = obj.orderId || obj.id || (obj._id ? obj._id.toString() : '');
  obj.id = orderId;
  obj.orderId = orderId;
  obj._id = obj._id || orderId;
  obj.taxAmount = obj.taxAmount !== undefined ? obj.taxAmount : (obj.gstAmount || 0);
  obj.gstAmount = obj.taxAmount;
  obj.totalAmount = obj.totalAmount !== undefined ? obj.totalAmount : (obj.total || 0);
  obj.total = obj.totalAmount;
  obj.status = obj.status || 'Placed';
  obj.paymentMethod = obj.paymentMethod || (obj.customer && obj.customer.paymentMethod) || 'Cash on Delivery';
  obj.paymentStatus = obj.paymentStatus || 'Pending';
  obj.date = obj.date || (obj.createdAt ? new Date(obj.createdAt).toISOString() : new Date().toISOString());

  if (Array.isArray(obj.items)) {
    obj.items = obj.items.map((i) => ({
      ...i,
      id: i.id || i.productId || '',
      productId: i.productId || i.id || '',
      price: i.price !== undefined ? i.price : (i.unitPrice || 0),
      unitPrice: i.unitPrice !== undefined ? i.unitPrice : (i.price || 0),
    }));
  }

  return obj;
};

const getOrders = async (req, res, next) => {
  try {
    if (isMongoDBConnected()) {
      const docs = await Order.find().sort({ createdAt: -1, date: -1 }).lean();
      const orders = docs.map(normalizeOrder);
      return res.json({
        success: true,
        data: orders,
        count: orders.length,
        source: 'mongodb',
      });
    }

    // Offline JSON Store Fallback
    const orders = store.getOrders();
    res.json({
      success: true,
      data: orders,
      count: orders.length,
      source: 'local_json_fallback',
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isMongoDBConnected()) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId
        ? { $or: [{ orderId: String(id) }, { id: String(id) }, { _id: id }] }
        : { $or: [{ orderId: String(id) }, { id: String(id) }] };

      const doc = await Order.findOne(query).lean();
      if (!doc) {
        const err = new Error('Order not found');
        err.status = 404;
        throw err;
      }

      return res.json({
        success: true,
        data: normalizeOrder(doc),
        source: 'mongodb',
      });
    }

    // Offline JSON Store Fallback
    const order = store.getOrderById(id);
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    res.json({
      success: true,
      data: order,
      source: 'local_json_fallback',
    });
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { customerName, customerEmail, shippingAddress, items, paymentMethod = 'Cash on Delivery', customer } = req.body;

    const name = customerName || (customer && customer.name);
    const email = customerEmail || (customer && customer.email);
    const address = shippingAddress || (customer && customer.address) || 'Standard Shipping Address';

    if (!name || !name.trim()) {
      const err = new Error('Customer name is required');
      err.status = 400;
      throw err;
    }

    if (!email || !email.trim()) {
      const err = new Error('Customer email is required');
      err.status = 400;
      throw err;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      const err = new Error('Order must contain at least one item');
      err.status = 400;
      throw err;
    }

    if (isMongoDBConnected()) {
      // 1. Verify stock and decrement in MongoDB
      let subtotal = 0;
      const validatedItems = [];

      for (const item of items) {
        const pid = item.id || item.productId || item._id;
        const itemName = item.name || item.title || 'Apparel Item';
        const qty = Math.max(1, Number(item.quantity) || 1);
        const unitPrice = Number(item.price !== undefined ? item.price : (item.unitPrice || 0));

        if (pid) {
          const isObjectId = mongoose.Types.ObjectId.isValid(pid);
          const pQuery = isObjectId
            ? { $or: [{ id: String(pid) }, { _id: pid }] }
            : { id: String(pid) };

          const product = await Product.findOne(pQuery);
          if (product) {
            const avail = Number(product.stock !== undefined ? product.stock : 10);
            if (avail < qty) {
              const err = new Error(`Insufficient stock for product "${product.name}". Available: ${avail}, Requested: ${qty}`);
              err.status = 400;
              throw err;
            }

            // Decrement product stock in MongoDB
            product.stock = Math.max(0, avail - qty);
            product.inStock = product.stock;
            product.stockQuantity = product.stock;
            await product.save();

            // Mirror in store
            store.decrementStock(pid, qty);
          }
        }

        subtotal += qty * unitPrice;
        validatedItems.push({
          id: pid ? String(pid) : `item-${Date.now()}`,
          productId: pid ? String(pid) : '',
          name: itemName,
          size: item.size || item.selectedSize || 'M',
          quantity: qty,
          unitPrice,
          price: unitPrice,
          imageUrl: item.imageUrl || item.image || '',
          image: item.image || item.imageUrl || '',
        });
      }

      subtotal = parseFloat(subtotal.toFixed(2));
      const taxAmount = parseFloat((subtotal * 0.05).toFixed(2)); // 5% GST
      const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const nowIso = new Date().toISOString();

      const newOrderDoc = await Order.create({
        id: orderId,
        orderId,
        customerName: name.trim(),
        customerEmail: email.trim().toLowerCase(),
        shippingAddress: address,
        customer: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          address,
          paymentMethod,
        },
        items: validatedItems,
        subtotal,
        taxAmount,
        gstAmount: taxAmount,
        shippingFee: 0,
        totalAmount,
        total: totalAmount,
        status: 'Placed',
        paymentMethod,
        paymentStatus: 'Pending',
        date: nowIso,
        createdAt: nowIso,
      });

      const normalized = normalizeOrder(newOrderDoc);

      // Mirror order in local store for fallback consistency
      try {
        store.createOrder({
          customerName: name.trim(),
          customerEmail: email.trim().toLowerCase(),
          shippingAddress: address,
          items: validatedItems,
          paymentMethod,
          customer,
        });
      } catch (e) {
        // ignore duplicate store note
      }

      // Send email confirmation asynchronously
      emailService.sendOrderConfirmationEmail(normalized).catch((emailErr) => {
        console.error('[OrderController] Email sending error caught gracefully:', emailErr.message);
      });

      return res.status(201).json({
        success: true,
        data: normalized,
        order: normalized,
        source: 'mongodb',
      });
    }

    // Offline JSON Store Fallback
    const newOrder = store.createOrder({
      customerName,
      customerEmail,
      shippingAddress,
      items,
      paymentMethod,
      customer,
    });

    emailService.sendOrderConfirmationEmail(newOrder).catch((emailErr) => {
      console.error('[OrderController] Email sending error caught gracefully:', emailErr.message);
    });

    res.status(201).json({
      success: true,
      data: newOrder,
      order: newOrder,
      source: 'local_json_fallback',
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Placed', 'Dispatched', 'Delivered'];
    if (!validStatuses.includes(status)) {
      const err = new Error(`Invalid status "${status}". Allowed: ${validStatuses.join(', ')}`);
      err.status = 400;
      throw err;
    }

    if (isMongoDBConnected()) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId
        ? { $or: [{ orderId: String(id) }, { id: String(id) }, { _id: id }] }
        : { $or: [{ orderId: String(id) }, { id: String(id) }] };

      const order = await Order.findOne(query);
      if (!order) {
        const err = new Error('Order not found');
        err.status = 404;
        throw err;
      }

      order.status = status;
      order.updatedAt = new Date();
      await order.save();

      // Mirror in store
      try {
        store.updateOrderStatus(id, status);
      } catch (e) {
        // ignore
      }

      return res.json({
        success: true,
        data: normalizeOrder(order),
        message: `Order status updated to ${status}`,
        source: 'mongodb',
      });
    }

    // Offline JSON Store Fallback
    const updated = store.updateOrderStatus(id, status);
    res.json({
      success: true,
      data: updated,
      message: `Order status updated to ${status}`,
      source: 'local_json_fallback',
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
  normalizeOrder,
};
