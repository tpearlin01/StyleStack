const store = require('../data/store');

const getOverview = async (req, res, next) => {
  try {
    const overview = store.getAnalyticsOverview();
    res.json({
      success: true,
      data: overview,
      totalRevenue: overview.totalRevenue,
      totalOrders: overview.totalOrders,
      lowStockItems: overview.lowStockItems,
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
