import Product from "../models/Product.js";
import logger from "../config/logger.js";

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const body = req.body;

    if (!body.name || body.name.trim() === '') {
      return res.status(400).json({ success: false, message: "Product name is required", field: "name" });
    }
    if (!body.price || body.price === '' || Number(body.price) <= 0) {
      return res.status(400).json({ success: false, message: "Product price must be greater than 0", field: "price" });
    }

    const parseArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.filter(Boolean);
      try { return JSON.parse(val); } catch { return val.split(',').map(s => s.trim()).filter(Boolean); }
    };

    const ingredients = parseArray(body.ingredients);
    const benefits = parseArray(body.benefits);
    const skinTypes = parseArray(body.skinTypes);

    const images = (() => {
      if (!body.images) return [];
      const arr = Array.isArray(body.images) ? body.images : (() => {
        try { return JSON.parse(body.images); } catch { return [body.images]; }
      })();
      return arr.map(img => typeof img === 'string' ? { url: img, publicId: "base64" } : img).filter(Boolean);
    })();

    const productData = {
      name: body.name.trim(),
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : Number(body.price),
      category: body.category || 'uncategorized',
      shortDescription: body.shortDescription || '',
      description: body.description || body.fullDescription || '',
      fullDescription: body.fullDescription || body.description || '',
      ingredients,
      benefits,
      skinTypes: skinTypes.length > 0 ? skinTypes : ['All'],
      howToUse: body.howToUse || '',
      images,
      image: images.length > 0 ? images[0].url : '',
      stock: body.stock ? Number(body.stock) : 0,
      featured: body.featured !== undefined ? Boolean(body.featured) : false,
      rating: body.rating ? Number(body.rating) : 0,
      reviews: body.reviews ? Number(body.reviews) : 0,
    };

    const product = await Product.create(productData);
    logger.info('Product created: %s', product._id);

    res.status(201).json({ success: true, product, message: "Product created successfully" });

  } catch (error) {
    logger.error('createProduct error: %s', error.message);
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => ({ field: key, message: error.errors[key].message }));
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};


// GET ALL PRODUCTS (keep your existing code or use this)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE PRODUCT
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const body = req.body;

    const updateData = {
      ...body,
      price: body.price ? Number(body.price) : undefined,
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
    };

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });

  } catch (error) {
    console.error("Update product error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE PRODUCT IMAGE
export const deleteProductImage = async (req, res) => {
  try {
    const { id, index } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.images || !product.images[index]) {
      return res.status(400).json({
        success: false,
        message: "Image not found",
      });
    }

    product.images.splice(index, 1);

    if (product.images.length > 0) {
      product.image = product.images[0].url;
    } else {
      product.image = '';
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      product,
    });

  } catch (error) {
    console.error("Delete product image error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};