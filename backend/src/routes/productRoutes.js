const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  decrementProductStock,
  deleteProduct,
} = require('../controllers/productController');
const upload = require('../middleware/upload');

router.route('/')
  .get(getProducts)
  .post(upload.single('image'), createProduct);

router.route('/:id')
  .get(getProductById)
  .delete(deleteProduct);

router.route('/:id/stock')
  .patch(decrementProductStock);

module.exports = router;
