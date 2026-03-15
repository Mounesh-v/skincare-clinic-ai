import Product from "../models/Product.js";

const parseArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  try {
    return JSON.parse(val);
  } catch {
    return String(val).split(",").map((s) => s.trim()).filter(Boolean);
  }
};

/** Get all products for the logged-in vendor */
export const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user.id }).lean();
    res.json({
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

/** Get single product – only if it belongs to this vendor */
export const getVendorProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      vendor: req.user.id,
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/** Create product – set vendor to logged-in vendor */
export const createVendorProduct = async (req, res) => {
  try {
    const body = req.body;

    if (!body.name || body.name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
        field: "name",
      });
    }
    if (!body.price || body.price === "" || Number(body.price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product price must be greater than 0",
        field: "price",
      });
    }

    const images = (() => {
      if (!body.images) return [];
      const arr = Array.isArray(body.images)
        ? body.images
        : (() => {
            try {
              return JSON.parse(body.images);
            } catch {
              return [body.images];
            }
          })();
      return arr
        .map((img) =>
          typeof img === "string" ? { url: img, publicId: "base64" } : img
        )
        .filter(Boolean);
    })();

    const ingredients = parseArray(body.ingredients);
    const benefits = parseArray(body.benefits);
    const skinTypes = parseArray(body.skinTypes);
    const skinTypesNormalized =
      skinTypes.length > 0
        ? skinTypes.map(
            (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
          )
        : ["All"];

    const productData = {
      name: body.name.trim(),
      description: body.description || body.fullDescription || "",
      category: body.category || "Serums",
      price: Number(body.price),
      originalPrice: body.originalPrice
        ? Number(body.originalPrice)
        : Number(body.price),
      stock: body.stock ? Number(body.stock) : 0,
      images,
      ingredients,
      benefits,
      skinTypes: skinTypesNormalized,
      howToUse: body.howToUse || "",
      status: body.status || "Active",
      vendor: req.user.id,
    };

    const product = await Product.create(productData);
    res.status(201).json({
      success: true,
      product,
      message: "Product created successfully",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/** Update product – only if it belongs to this vendor */
export const updateVendorProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      vendor: req.user.id,
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const body = req.body;
    const updateFields = [
      "name",
      "description",
      "category",
      "price",
      "originalPrice",
      "stock",
      "howToUse",
      "status",
      "ingredients",
      "benefits",
      "skinTypes",
      "images",
    ];
    for (const key of updateFields) {
      if (body[key] !== undefined) {
        if (key === "price" || key === "originalPrice" || key === "stock") {
          product[key] = Number(body[key]);
        } else if (key === "ingredients" || key === "benefits" || key === "skinTypes") {
          product[key] = parseArray(body[key]);
        } else if (key === "images") {
          const arr = Array.isArray(body.images)
            ? body.images
            : (() => {
                try {
                  return JSON.parse(body.images);
                } catch {
                  return [body.images];
                }
              })();
          product.images = arr
            .map((img) =>
              typeof img === "string" ? { url: img, publicId: "base64" } : img
            )
            .filter(Boolean);
        } else {
          product[key] = body[key];
        }
      }
    }
    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/** Delete product – only if it belongs to this vendor */
export const deleteVendorProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      vendor: req.user.id,
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.json({
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
