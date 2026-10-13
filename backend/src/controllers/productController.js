const store = require('../data/store');

const getProducts = async (req, res, next) => {
  try {
    const { category, gender, search, sort, size } = req.query;

    const result = store.getProducts({ category, gender, search });
    let products = [...result.products];

    if (size) {
      products = products.filter(
        (p) => Array.isArray(p.sizes) && p.sizes.includes(size)
      );
    }

    if (sort === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'newest') {
      products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    res.json({
      success: true,
      data: products,
      total: products.length,
      count: products.length,
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = store.getProductById(id);

    if (!product) {
      const err = new Error('Product not found');
      err.status = 404;
      throw err;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, title, category, price, gender, stock, inStock, stockQuantity, sizes, description, badge, tag } = req.body;

    const productName = name || title;
    if (!productName || !productName.trim()) {
      const err = new Error('Product name or title is required');
      err.status = 400;
      throw err;
    }

    if (!category || !category.trim()) {
      const err = new Error('Product category is required');
      err.status = 400;
      throw err;
    }

    const parsedPrice = Number(price);
    if (price === undefined || isNaN(parsedPrice) || parsedPrice < 0) {
      const err = new Error('A valid non-negative price is required');
      err.status = 400;
      throw err;
    }

    let imageUrl = req.body.image || req.body.imageUrl || '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newProduct = store.addProduct({
      name: productName.trim(),
      title: productName.trim(),
      category: category.trim(),
      gender: gender || 'unisex',
      price: parsedPrice,
      stock: stock !== undefined ? Number(stock) : (inStock !== undefined ? Number(inStock) : (stockQuantity !== undefined ? Number(stockQuantity) : 15)),
      sizes,
      description,
      badge: badge || tag || 'New Arrival',
      image: imageUrl,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

const decrementProductStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;

    const updated = store.decrementStock(id, Number(quantity) || 1);
    if (!updated) {
      const err = new Error('Product not found');
      err.status = 404;
      throw err;
    }

    res.json({
      success: true,
      data: updated,
      message: `Stock updated for ${updated.name}`,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const index = store._raw.products.findIndex((p) => String(p.id) === String(id) || String(p._id) === String(id));
    if (index === -1) {
      const err = new Error('Product not found');
      err.status = 404;
      throw err;
    }

    store._raw.products.splice(index, 1);
    res.json({
      success: true,
      message: 'Product removed',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  decrementProductStock,
  deleteProduct,
};
