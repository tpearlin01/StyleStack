const request = require('supertest');
const app = require('../app');

describe('Analytics & Intelligence Endpoints', () => {
  it('GET /api/analytics/overview returns dynamic totalRevenue, totalOrders, and lowStockItems matching orders data', async () => {
    // Fetch orders to calculate ground truth
    const ordersRes = await request(app).get('/api/orders');
    const orders = ordersRes.body.data;
    const expectedRevenue = parseFloat(
      orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0).toFixed(2)
    );
    const expectedOrdersCount = orders.length;

    const res = await request(app).get('/api/analytics/overview');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalOrders).toBe(expectedOrdersCount);
    expect(res.body.data.totalRevenue).toBe(expectedRevenue);
    expect(typeof res.body.data.lowStockItems).toBe('number');
  });

  it('GET /api/analytics/feedback returns customer reviews, CSAT score, and average rating', async () => {
    const res = await request(app).get('/api/analytics/feedback');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.reviews)).toBe(true);
    expect(res.body.data.reviews.length).toBeGreaterThan(0);
    expect(res.body.data.csatScore).toBeDefined();
    expect(res.body.data.averageRating).toBeDefined();

    // Check review fields match PRD & frontend
    const sampleReview = res.body.data.reviews[0];
    expect(sampleReview.customerName).toBeDefined();
    expect(sampleReview.rating).toBeDefined();
    expect(sampleReview.fitFeedback).toBeDefined();
    expect(sampleReview.verified).toBeDefined();
  });

  it('GET /api/analytics/returns returns return cause breakdown and diagnostics', async () => {
    const res = await request(app).get('/api/analytics/returns');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.returnReasons)).toBe(true);
    expect(res.body.data.returnReasons.length).toBe(3);

    // Verify categories
    const categories = res.body.data.returnReasons.map((r) => r.category);
    expect(categories.some((c) => c.includes('Size') && c.includes('Fit'))).toBe(true);
    expect(categories.some((c) => c.includes('Color') && c.includes('Fabric'))).toBe(true);
    expect(categories.some((c) => c.includes('Damaged') || c.includes('Packaging'))).toBe(true);

    // Verify diagnostic records with suggested actions
    expect(Array.isArray(res.body.data.itemDiagnostics)).toBe(true);
    expect(res.body.data.itemDiagnostics.length).toBeGreaterThan(0);
    expect(res.body.data.itemDiagnostics[0].actionSuggested).toBeDefined();
  });
});
