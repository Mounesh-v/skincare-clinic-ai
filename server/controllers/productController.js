import Product from "../models/Product.js";

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const body = req.body;

    const productData = {
      ...body,

      ingredients: body.ingredients || [],
      benefits: body.benefits || [],

      images: Array.isArray(body.images)
        ? body.images.map((base64) => ({
            url: base64,
            publicId: "base64",
          }))
        : [],
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      product,
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL PRODUCTS
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
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

    // increase views
    product.views += 1;
    await product.save();

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
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

      ingredients: body.ingredients || [],
      benefits: body.benefits || [],
    };

    // ===== IMAGE HANDLING =====

    // If new images sent from frontend
    if (Array.isArray(body.images)) {
      updateData.images = body.images.map((base64) => ({
        url: base64,
        publicId: "base64",
      }));
    }

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
      message: "Product updated",
      product,
    });

  } catch (error) {
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delte Product img
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

    if (!product.images[index]) {
      return res.status(400).json({
        success: false,
        message: "Image not found",
      });
    }

    product.images.splice(index, 1);

    await product.save();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


