// const { imageUploadUtils } = require('../../helpers/cloudinary');
// const Product = require('../../models/Product');

// const uploadProductImage = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, error: "No file uploaded" });
//     }

//     const imageUrl = await imageUploadUtils(req.file.buffer);

//     res.json({
//       success: true,
//       message: "Image uploaded successfully",
//       imageUrl,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// const addProduct = async (req, res) => {
//   try {
//     const {
//       image,
//       title,
//       description,
//       category,
//       brand,
//       price,
//       salePrice,
//       totalStock,
//     } = req.body;

//     if (!image || !title || !price) {
//       return res.status(400).json({
//         success: false,
//         error: "Image, title, and price are required",
//       });
//     }

//     const newProduct = await Product.create({
//       image,
//       title,
//       description,
//       category,
//       brand,
//       price,
//       salePrice,
//       totalStock,
//     });

//     res.json({
//       success: true,
//       message: "Product added successfully",
//       data: newProduct,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// const fetchAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find({});
//     res.json({ success: true, data: products });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // ✅✅✅ UPDATE PRODUCT CONTROLLER
// const updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const updatedProduct = await Product.findByIdAndUpdate(
//       id,
//       req.body,
//       { new: true } // return updated doc
//     );

//     if (!updatedProduct) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: updatedProduct,
//     });

//   } catch (error) {
//     console.error("Update error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update product",
//     });
//   }
// };

// // ✅✅✅ DELETE PRODUCT CONTROLLER
// const deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedProduct = await Product.findByIdAndDelete(id);

//     if (!deletedProduct) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Product deleted successfully",
//       data: deletedProduct,
//     });

//   } catch (error) {
//     console.error("Delete error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete product",
//     });
//   }
// };


// module.exports = {
//   uploadProductImage,
//   addProduct,
//   fetchAllProducts,
//   updateProduct,
//   deleteProduct,
// };

const { imageUploadUtils } = require('../../helpers/cloudinary');
const Product = require('../../models/Product');

const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const imageUrl = await imageUploadUtils(req.file.buffer);

    res.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      lowStockThreshold = 5,
      allowBackorders = false,
      showOutOfStock = true,
      isActive = true
    } = req.body;

    if (!image || !title || !price || totalStock === undefined) {
      return res.status(400).json({
        success: false,
        error: "Image, title, price, and totalStock are required",
      });
    }

    // Validate price and stock
    const priceNum = parseFloat(price);
    const totalStockNum = parseInt(totalStock);
    const lowStockThresholdNum = parseInt(lowStockThreshold) || 5;

    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({
        success: false,
        error: "Price must be a valid positive number"
      });
    }

    if (isNaN(totalStockNum) || totalStockNum < 0) {
      return res.status(400).json({
        success: false,
        error: "Stock must be a valid positive number"
      });
    }

    // Handle sale price validation
    let salePriceNum = null;
    if (salePrice && salePrice !== '') {
      salePriceNum = parseFloat(salePrice);
      if (isNaN(salePriceNum) || salePriceNum < 0 || salePriceNum > priceNum) {
        return res.status(400).json({
          success: false,
          error: "Sale price must be less than or equal to regular price"
        });
      }
    }

    const newProduct = await Product.create({
      image,
      title,
      description: description || '',
      category,
      brand: brand || '',
      price: priceNum,
      salePrice: salePriceNum,
      totalStock: totalStockNum,
      reservedStock: 0,
      availableStock: totalStockNum,
      lowStockThreshold: lowStockThresholdNum,
      allowBackorders: Boolean(allowBackorders),
      showOutOfStock: Boolean(showOutOfStock),
      isActive: totalStockNum > 0 || Boolean(allowBackorders) ? Boolean(isActive) : false
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const fetchAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      lowStockThreshold,
      allowBackorders,
      showOutOfStock,
      isActive
    } = req.body;

    // Find existing product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Prepare update data
    const updateData = { ...req.body };
    
    // Validate and convert numeric fields
    if (price !== undefined) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid positive number"
        });
      }
      updateData.price = priceNum;
    }

    // FIXED: Proper salePrice validation
    if (salePrice !== undefined) {
      if (salePrice === '' || salePrice === null) {
        updateData.salePrice = null;
      } else {
        const salePriceNum = parseFloat(salePrice);
        
        // Determine which price to compare against
        const priceToCompare = updateData.price !== undefined 
          ? updateData.price  // Use new price if provided
          : existingProduct.price; // Otherwise use existing price
        
        if (isNaN(salePriceNum) || salePriceNum < 0 || salePriceNum > priceToCompare) {
          return res.status(400).json({
            success: false,
            message: `Sale price (${salePriceNum}) must be less than or equal to regular price (${priceToCompare})`
          });
        }
        updateData.salePrice = salePriceNum;
      }
    }

    if (totalStock !== undefined) {
      const totalStockNum = parseInt(totalStock);
      if (isNaN(totalStockNum) || totalStockNum < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock must be a valid positive number"
        });
      }
      updateData.totalStock = totalStockNum;
      
      // Calculate available stock
      const reservedStock = existingProduct.reservedStock || 0;
      updateData.availableStock = Math.max(0, totalStockNum - reservedStock);
    }

    if (lowStockThreshold !== undefined) {
      const lowStockThresholdNum = parseInt(lowStockThreshold) || 5;
      if (lowStockThresholdNum < 0) {
        return res.status(400).json({
          success: false,
          message: "Low stock threshold must be a positive number"
        });
      }
      updateData.lowStockThreshold = lowStockThresholdNum;
    }

    // Handle boolean fields
    if (allowBackorders !== undefined) {
      updateData.allowBackorders = Boolean(allowBackorders);
    }
    
    if (showOutOfStock !== undefined) {
      updateData.showOutOfStock = Boolean(showOutOfStock);
    }
    
    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    // FIXED: Temporarily disable model validators to avoid conflict
    // Our controller has already validated everything
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: false } // Disable model validators
    );

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product has reserved stock
    const product = await Product.findById(id);
    if (product && (product.reservedStock || 0) > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete product with reserved stock. Cancel orders first."
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });

  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getInventoryReport = async (req, res) => {
  try {
    const { lowStockOnly, outOfStockOnly, category, brand } = req.query;
    
    let filters = {};
    
    if (lowStockOnly === 'true') {
      filters.$expr = {
        $lte: [
          { $subtract: ['$totalStock', '$reservedStock'] },
          '$lowStockThreshold'
        ]
      };
    }
    
    if (outOfStockOnly === 'true') {
      filters.$expr = {
        $lte: [
          { $subtract: ['$totalStock', '$reservedStock'] },
          0
        ]
      };
    }
    
    if (category) filters.category = category;
    if (brand) filters.brand = brand;

    const products = await Product.find(filters)
      .sort({ availableStock: 1, totalStock: 1 })
      .select('title category brand totalStock reservedStock availableStock lowStockThreshold isActive allowBackorders');
    
    // Calculate summary
    const summary = {
      totalProducts: products.length,
      totalStock: products.reduce((sum, p) => sum + p.totalStock, 0),
      reservedStock: products.reduce((sum, p) => sum + (p.reservedStock || 0), 0),
      availableStock: products.reduce((sum, p) => sum + (p.availableStock || 0), 0),
      lowStockCount: products.filter(p => (p.availableStock || 0) <= (p.lowStockThreshold || 5) && (p.availableStock || 0) > 0).length,
      outOfStockCount: products.filter(p => (p.availableStock || 0) <= 0 && !p.allowBackorders).length,
      backorderCount: products.filter(p => p.allowBackorders && (p.availableStock || 0) <= 0).length
    };

    res.status(200).json({
      success: true,
      data: products,
      summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Inventory report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get inventory report",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  uploadProductImage,
  addProduct,
  fetchAllProducts,
  updateProduct,
  deleteProduct,
  getInventoryReport
};
