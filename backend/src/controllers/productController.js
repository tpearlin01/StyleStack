const mongoose = require('mongoose');
const Product = require('../models/Product');
const store = require('../data/store');
const { isMongoDBConnected } = require('../config/db');

const normalizeProduct = (p) => {
  if (!p) return null;
  const obj = p.toObject ? p.toObject() : { ...p };
  const productId = obj.id || (obj._id ? obj._id.toString() : '');
  obj.id = productId;
  obj._id = obj._id || productId;
  obj.name = obj.name || obj.title || 'Apparel Item';
  obj.title = obj.title || obj.name || 'Apparel Item';
  obj.image = obj.image || obj.imageUrl || '';
  obj.imageUrl = obj.imageUrl || obj.image || '';
  obj.categoryName = obj.categoryName || obj.category || 'Casual';
  obj.stock = obj.stock !== undefined ? Number(obj.stock) : (obj.inStock !== undefined ? Number(obj.inStock) : 10);
  obj.inStock = obj.stock;
  obj.stockQuantity = obj.stock;
  return obj;
};

const getProducts = async (req, res, next) => {
  try {
    const { category, gender, search, sort, size } = req.query;

    if (isMongoDBConnected()) {
      const query = {};

      if (category && category !== 'all') {
        const escaped = category.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.$or = [
          { category: new RegExp(`^${escaped}$`, 'i') },
          { categoryName: new RegExp(`^${escaped}$`, 'i') },
        ];
      }

      if (gender && gender !== 'all') {
        const escapedGender = gender.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.gender = new RegExp(`^${escapedGender}$`, 'i');
      }

      if (size) {
        query.sizes = size;
      }

      if (search && search.trim()) {
        const term = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(term, 'i');
        const searchConditions = [
          { name: searchRegex },
          { title: searchRegex },
          { description: searchRegex },
          { brand: searchRegex },
          { category: searchRegex },
          { categoryName: searchRegex },
        ];

        if (query.$or) {
          query.$and = [{ $or: query.$or }, { $or: searchConditions }];
          delete query.$or;
        } else {
          query.$or = searchConditions;
        }
      }

      let sortOptions = { createdAt: -1 };
      if (sort === 'price-low') {
        sortOptions = { price: 1 };
      } else if (sort === 'price-high') {
        sortOptions = { price: -1 };
      } else if (sort === 'newest') {
        sortOptions = { createdAt: -1 };
      }

      const docs = await Product.find(query).sort(sortOptions).lean();
      const products = docs.map(normalizeProduct);

      return res.json({
        success: true,
        data: products,
        total: products.length,
        count: products.length,
        source: 'mongodb',
      });
    }

    // Offline JSON Store Fallback
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
      source: 'local_json_fallback',
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isMongoDBConnected()) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId
        ? { $or: [{ id: String(id) }, { _id: id }] }
        : { id: String(id) };

      const doc = await Product.findOne(query).lean();
      if (!doc) {
        const err = new Error('Product not found');
        err.status = 404;
        throw err;
      }

      return res.json({
        success: true,
        data: normalizeProduct(doc),
        source: 'mongodb',
      });
    }

    // Offline JSON Store Fallback
    const product = store.getProductById(id);
    if (!product) {
      const err = new Error('Product not found');
      err.status = 404;
      throw err;
    }

    res.json({
      success: true,
      data: product,
      source: 'local_json_fallback',
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

    const stockVal = stock !== undefined ? Number(stock) : (inStock !== undefined ? Number(inStock) : (stockQuantity !== undefined ? Number(stockQuantity) : 15));
    const sizesArr = Array.isArray(sizes) ? sizes : ['S', 'M', 'L', 'XL'];
    const generatedId = `prod-${Date.now()}`;

    if (isMongoDBConnected()) {
      const newDoc = await Product.create({
        id: generatedId,
        name: productName.trim(),
        title: productName.trim(),
        category: category.trim().toLowerCase(),
        categoryName: category.trim(),
        gender: gender || 'unisex',
        price: parsedPrice,
        stock: stockVal,
        inStock: stockVal,
        stockQuantity: stockVal,
        sizes: sizesArr,
        description: description || '',
        badge: badge || tag || 'New Arrival',
        image: imageUrl,
        imageUrl,
      });

      // Mirror in local fallback store for redundancy
      store.addProduct({
        id: generatedId,
        name: productName.trim(),
        title: productName.trim(),
        category: category.trim(),
        gender: gender || 'unisex',
        price: parsedPrice,
        stock: stockVal,
        sizes: sizesArr,
        description,
        badge: badge || tag || 'New Arrival',
        image: imageUrl,
        imageUrl,
      });

      return res.status(201).json({
        success: true,
        data: normalizeProduct(newDoc),
        source: 'mongodb',
      });
    }

    // Offline JSON Store Fallback
    const newProduct = store.addProduct({
      name: productName.trim(),
      title: productName.trim(),
      category: category.trim(),
      gender: gender || 'unisex',
      price: parsedPrice,
      stock: stockVal,
      sizes: sizesArr,
      description,
      badge: badge || tag || 'New Arrival',
      image: imageUrl,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      data: newProduct,
      source: 'local_json_fallback',
    });
  } catch (error) {
    next(error);
  }
};

const decrementProductStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;
    const qty = Math.max(1, Number(quantity) || 1);

    if (isMongoDBConnected()) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId
        ? { $or: [{ id: String(id) }, { _id: id }] }
        : { id: String(id) };

      const product = await Product.findOne(query);
      if (!product) {
        const err = new Error('Product not found');
        err.status = 404;
        throw err;
      }

      const current = product.stock !== undefined ? product.stock : 10;
      const newStock = Math.max(0, current - qty);
      product.stock = newStock;
      product.inStock = newStock;
      product.stockQuantity = newStock;
      await product.save();

      // Mirror in memory store
      store.decrementStock(id, qty);

      return res.json({
        success: true,
        data: normalizeProduct(product),
        message: `Stock updated for ${product.name}`,
        source: 'mongodb',
      });
    }

    // Offline JSON Store Fallback
    const updated = store.decrementStock(id, qty);
    if (!updated) {
      const err = new Error('Product not found');
      err.status = 404;
      throw err;
    }

    res.json({
      success: true,
      data: updated,
      message: `Stock updated for ${updated.name}`,
      source: 'local_json_fallback',
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isMongoDBConnected()) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId
        ? { $or: [{ id: String(id) }, { _id: id }] }
        : { id: String(id) };

      const deleted = await Product.findOneAndDelete(query);
      if (!deleted) {
        const err = new Error('Product not found');
        err.status = 404;
        throw err;
      }

      const index = store._raw.products.findIndex((p) => String(p.id) === String(id) || String(p._id) === String(id));
      if (index !== -1) {
        store._raw.products.splice(index, 1);
      }

      return res.json({
        success: true,
        message: 'Product removed',
        source: 'mongodb',
      });
    }

    // Offline JSON Store Fallback
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
      source: 'local_json_fallback',
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
  normalizeProduct,
};
