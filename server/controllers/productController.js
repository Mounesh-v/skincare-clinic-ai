import Product from "../models/Product.js";

// CREATE PRODUCT WITH EXTENSIVE DEBUGGING
export const createProduct = async (req, res) => {
  try {
    console.log("\n========================================");
    console.log("🔷 CREATE PRODUCT REQUEST RECEIVED");
    console.log("========================================");
    
    const body = req.body;
    
    // Log the raw body
    console.log("\n📦 RAW BODY:");
    console.log(JSON.stringify(body, null, 2));
    
    // Log body keys
    console.log("\n🔑 BODY KEYS:", Object.keys(body));
    
    // Log body types
    console.log("\n📊 BODY TYPES:");
    Object.keys(body).forEach(key => {
      console.log(`  ${key}: ${typeof body[key]} = ${Array.isArray(body[key]) ? 'Array' : typeof body[key]}`);
    });

    // Step 1: Validate required fields
    console.log("\n✅ STEP 1: Validating required fields...");
    
    if (!body.name || body.name.trim() === '') {
      console.log("❌ VALIDATION FAILED: name is missing or empty");
      return res.status(400).json({
        success: false,
        message: "Product name is required",
        field: "name"
      });
    }
    console.log("✓ name:", body.name);

    if (!body.price || body.price === '' || body.price === 0) {
      console.log("❌ VALIDATION FAILED: price is missing or invalid");
      return res.status(400).json({
        success: false,
        message: "Product price is required and must be greater than 0",
        field: "price"
      });
    }
    console.log("✓ price:", body.price);

    // Step 2: Parse and clean arrays
    console.log("\n✅ STEP 2: Processing arrays...");
    
    let ingredients = [];
    if (body.ingredients) {
      console.log("Raw ingredients:", body.ingredients);
      if (typeof body.ingredients === 'string') {
        try {
          ingredients = JSON.parse(body.ingredients);
        } catch (e) {
          ingredients = body.ingredients.split(',').map(i => i.trim()).filter(Boolean);
        }
      } else if (Array.isArray(body.ingredients)) {
        ingredients = body.ingredients.filter(Boolean);
      }
    }
    console.log("✓ Parsed ingredients:", ingredients);

    let benefits = [];
    if (body.benefits) {
      console.log("Raw benefits:", body.benefits);
      if (typeof body.benefits === 'string') {
        try {
          benefits = JSON.parse(body.benefits);
        } catch (e) {
          benefits = body.benefits.split(',').map(b => b.trim()).filter(Boolean);
        }
      } else if (Array.isArray(body.benefits)) {
        benefits = body.benefits.filter(Boolean);
      }
    }
    console.log("✓ Parsed benefits:", benefits);

    let skinTypes = [];
    if (body.skinTypes) {
      console.log("Raw skinTypes:", body.skinTypes);
      if (typeof body.skinTypes === 'string') {
        try {
          skinTypes = JSON.parse(body.skinTypes);
        } catch (e) {
          skinTypes = body.skinTypes.split(',').map(s => s.trim()).filter(Boolean);
        }
      } else if (Array.isArray(body.skinTypes)) {
        skinTypes = body.skinTypes.filter(Boolean);
      }
    }
    console.log("✓ Parsed skinTypes:", skinTypes);

    // Step 3: Process images
    console.log("\n✅ STEP 3: Processing images...");
    let images = [];
    
    if (body.images) {
      console.log("Raw images type:", typeof body.images);
      console.log("Is array?", Array.isArray(body.images));
      
      if (Array.isArray(body.images)) {
        console.log("Images array length:", body.images.length);
        images = body.images.map((img, index) => {
          console.log(`Processing image ${index}:`, typeof img);
          if (typeof img === 'string') {
            return { url: img, publicId: "base64" };
          } else if (img && img.url) {
            return img;
          }
          return null;
        }).filter(Boolean);
      } else if (typeof body.images === 'string') {
        try {
          const parsed = JSON.parse(body.images);
          if (Array.isArray(parsed)) {
            images = parsed.map(img => ({
              url: img,
              publicId: "base64"
            }));
          }
        } catch (e) {
          console.log("Failed to parse images string:", e.message);
          images = [{ url: body.images, publicId: "base64" }];
        }
      }
    }
    console.log("✓ Processed images count:", images.length);

    // Step 4: Build product data
    console.log("\n✅ STEP 4: Building product data...");
    
    const productData = {
      name: body.name.trim(),
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : Number(body.price),
      category: body.category || 'uncategorized',
      shortDescription: body.shortDescription || '',
      description: body.description || body.fullDescription || '',
      fullDescription: body.fullDescription || body.description || '',
      ingredients: ingredients,
      benefits: benefits,
      skinTypes: skinTypes.length > 0 ? skinTypes : ['all'],
      howToUse: body.howToUse || '',
      images: images,
      image: images.length > 0 ? images[0].url : '',
      inStock: body.inStock !== undefined ? Boolean(body.inStock) : true,
      stockCount: body.stockCount ? Number(body.stockCount) : 0,
      featured: body.featured !== undefined ? Boolean(body.featured) : false,
      rating: body.rating ? Number(body.rating) : 0,
      reviews: body.reviews ? Number(body.reviews) : 0,
    };

    console.log("\n📋 FINAL PRODUCT DATA:");
    console.log(JSON.stringify(productData, null, 2));

    // Step 5: Save to database
    console.log("\n✅ STEP 5: Saving to database...");
    
    const product = await Product.create(productData);
    
    console.log("\n🎉 SUCCESS! Product created with ID:", product._id);
    console.log("========================================\n");

    res.status(201).json({
      success: true,
      product,
      message: "Product created successfully"
    });

  } catch (error) {
    console.log("\n========================================");
    console.log("❌ ERROR OCCURRED");
    console.log("========================================");
    console.log("Error name:", error.name);
    console.log("Error message:", error.message);
    console.log("\nFull error:");
    console.log(error);
    
    // MongoDB validation error
    if (error.name === 'ValidationError') {
      console.log("\n🔍 VALIDATION ERRORS:");
      const errors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      console.log(errors);
      
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }

    console.log("========================================\n");
    
    res.status(400).json({
      success: false,
      message: error.message,
      error: error.name,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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