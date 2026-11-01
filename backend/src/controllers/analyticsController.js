const Order = require('../models/Order');
const Product = require('../models/Product');
const store = require('../data/store');
const { isMongoDBConnected } = require('../config/db');

const getOverview = async (req, res, next) => {
  try {
    if (isMongoDBConnected()) {
      const orders = await Order.find().lean();
      const totalRevenue = parseFloat(
        orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0).toFixed(2)
      );
      const totalOrders = orders.length;
      const lowStockItems = await Product.countDocuments({
        $or: [{ stock: { $lt: 10 } }, { inStock: { $lt: 10 } }, { stockQuantity: { $lt: 10 } }],
      });

      const overview = {
        totalRevenue,
        totalOrders,
        lowStockItems,
      };

      return res.json({
        success: true,
        data: overview,
        totalRevenue,
        totalOrders,
        lowStockItems,
        source: 'mongodb',
      });
    }

    // Offline JSON Store Fallback
    const overview = store.getAnalyticsOverview();
    res.json({
      success: true,
      data: overview,
      totalRevenue: overview.totalRevenue,
      totalOrders: overview.totalOrders,
      lowStockItems: overview.lowStockItems,
      source: 'local_json_fallback',
    });
  } catch (error) {
    next(error);
  }
};

const getFeedback = async (req, res, next) => {
  try {
    const feedback = store.getFeedback();
    res.json({
      success: true,
      data: feedback,
      reviews: feedback.reviews,
      csatScore: feedback.csatScore,
      averageRating: feedback.averageRating,
      csatMetrics: feedback.csatMetrics,
    });
  } catch (error) {
    next(error);
  }
};

const getReturns = async (req, res, next) => {
  try {
    const returnsData = store.getReturns();
    res.json({
      success: true,
      data: returnsData,
      returnReasons: returnsData.returnReasons,
      itemDiagnostics: returnsData.itemDiagnostics,
      causeBreakdown: returnsData.causeBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getFeedback,
  getReturns,
};
