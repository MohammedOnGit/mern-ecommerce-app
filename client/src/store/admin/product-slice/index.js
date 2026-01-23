import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  isLoading: false,
  error: null,
};

// ------------------ ADD NEW PRODUCT ------------------
export const addNewProduct = createAsyncThunk(
  "/products/addNewProduct",
  async (formData, { rejectWithValue }) => {
    try {
      // ✅ Prepare inventory data properly
      const productData = {
        ...formData,
        // Ensure numeric fields are properly converted
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        totalStock: parseInt(formData.totalStock) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
        showOutOfStock: Boolean(formData.showOutOfStock),
        isActive: Boolean(formData.isActive),
      };

      const result = await axios.post(
        "http://localhost:5000/api/admin/products/add",
        productData,
        { headers: { "Content-Type": "application/json" } }
      );
      return result.data?.data || result.data;
    } catch (error) {
      console.error("Add product error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ------------------ FETCH ALL PRODUCTS ------------------
export const fetchAllProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const result = await axios.get(
        "http://localhost:5000/api/admin/products/all"
      );
      return result.data?.data || result.data;
    } catch (error) {
      console.error("Fetch products error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ------------------ EDIT PRODUCT ------------------
export const editProduct = createAsyncThunk(
  "/products/editProduct",
  async ({ productId, formData }, { rejectWithValue }) => {
    try {
      // ✅ Prepare inventory data for update
      const updateData = {
        ...formData,
        // Ensure numeric fields are properly converted
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        totalStock: parseInt(formData.totalStock) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
        showOutOfStock: Boolean(formData.showOutOfStock),
        isActive: Boolean(formData.isActive),
      };

      const result = await axios.put(
        `http://localhost:5000/api/admin/products/${productId}`,
        updateData,
        { headers: { "Content-Type": "application/json" } }
      );
      return result.data?.data || result.data;
    } catch (error) {
      console.error("Edit product error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ------------------ DELETE PRODUCT ------------------
export const deletedProduct = createAsyncThunk(
  "/products/deletedProduct",
  async ({ productId }, { rejectWithValue }) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/products/delete/${productId}`
      );
      return { productId };
    } catch (error) {
      console.error("Delete product error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ------------------ SLICE ------------------
const AdminProductSlice = createSlice({
  name: "adminProduct",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ADD
      .addCase(addNewProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addNewProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.push(action.payload);
      })
      .addCase(addNewProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // EDIT
      .addCase(editProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.products.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) state.products[index] = action.payload;
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deletedProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletedProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter(
          (item) => item._id !== action.payload.productId
        );
      })
      .addCase(deletedProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default AdminProductSlice.reducer;
