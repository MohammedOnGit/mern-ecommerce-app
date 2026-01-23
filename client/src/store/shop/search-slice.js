import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  searchQuery: "",
  searchResults: [],
  recentSearches: [],
  popularSearches: ["men", "women", "footwear", "adidas", "zara", "luxury", "perfume"],
  suggestions: [],
  isLoading: false,
  error: null,
  filters: {
    category: [],
    brand: [],
    minPrice: 0,
    maxPrice: 1000,
    inStock: false,
    onSale: false
  },
  pagination: {
    page: 1,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  }
};

// API base URL - update this based on your environment
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Fetch search suggestions from API
export const fetchSearchSuggestions = createAsyncThunk(
  'search/fetchSuggestions',
  async (query, { rejectWithValue }) => {
    try {
      if (!query.trim()) {
        return { suggestions: [] };
      }

      const response = await axios.get(`${API_BASE_URL}/shop/search/suggestions`, {
        params: { q: query }
      });

      if (response.data.success) {
        return { suggestions: response.data.suggestions };
      } else {
        return rejectWithValue(response.data.message || "Failed to fetch suggestions");
      }
    } catch (error) {
      console.error("Suggestions API error:", error);
      
      // Fallback to local search if API fails
      try {
        // Fetch all products for fallback search
        const productsResponse = await axios.get(`${API_BASE_URL}/shop/products`);
        const products = productsResponse.data.data || [];
        
        const lowercaseQuery = query.toLowerCase();
        
        const productSuggestions = products
          .filter(product => 
            product.title?.toLowerCase().includes(lowercaseQuery) ||
            product.description?.toLowerCase().includes(lowercaseQuery) ||
            product.category?.toLowerCase().includes(lowercaseQuery) ||
            (product.brand && product.brand.toLowerCase().includes(lowercaseQuery))
          )
          .map(product => ({
            id: product._id,
            text: product.title,
            type: 'product',
            category: product.category,
            brand: product.brand,
            price: product.salePrice || product.price
          }))
          .slice(0, 5);

        return { suggestions: productSuggestions };
      } catch (fallbackError) {
        return rejectWithValue(fallbackError.message);
      }
    }
  }
);

// Perform search with filters
export const performSearch = createAsyncThunk(
  'search/performSearch',
  async ({ query, filters = {}, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const params = {
        q: query,
        page,
        limit,
        ...filters
      };

      // Convert boolean filters to string
      if (filters.inStock) params.inStock = 'true';
      if (filters.onSale) params.onSale = 'true';
      
      // Convert array filters to string if needed
      if (filters.category && filters.category.length > 0) {
        params.category = filters.category.join(',');
      }
      
      if (filters.brand && filters.brand.length > 0) {
        params.brand = filters.brand.join(',');
      }

      const response = await axios.get(`${API_BASE_URL}/shop/search`, {
        params
      });

      if (response.data.success) {
        return {
          results: response.data.data.products || [],
          query,
          filters,
          pagination: response.data.data.pagination || {
            page: 1,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        };
      } else {
        return rejectWithValue(response.data.message || "Search failed");
      }
    } catch (error) {
      console.error("Search API error:", error);
      
      // Fallback to fetching all products and filtering locally
      try {
        const productsResponse = await axios.get(`${API_BASE_URL}/shop/products`);
        const allProducts = productsResponse.data.data || [];
        
        let results = [...allProducts];

        // Apply text search
        if (query && query.trim()) {
          const lowercaseQuery = query.toLowerCase();
          results = results.filter(product =>
            product.title?.toLowerCase().includes(lowercaseQuery) ||
            product.description?.toLowerCase().includes(lowercaseQuery) ||
            product.category?.toLowerCase().includes(lowercaseQuery) ||
            (product.brand && product.brand.toLowerCase().includes(lowercaseQuery))
          );
        }

        // Apply filters
        if (filters.category && filters.category.length > 0) {
          results = results.filter(product => 
            filters.category.includes(product.category)
          );
        }

        if (filters.brand && filters.brand.length > 0) {
          results = results.filter(product => 
            filters.brand.includes(product.brand)
          );
        }

        if (filters.minPrice !== undefined) {
          results = results.filter(product => 
            (product.salePrice || product.price) >= filters.minPrice
          );
        }

        if (filters.maxPrice !== undefined) {
          results = results.filter(product => 
            (product.salePrice || product.price) <= filters.maxPrice
          );
        }

        if (filters.inStock) {
          results = results.filter(product => product.totalStock > 0);
        }

        if (filters.onSale) {
          results = results.filter(product => product.salePrice < product.price);
        }

        // Apply pagination
        const total = results.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const paginatedResults = results.slice(startIndex, startIndex + limit);

        return {
          results: paginatedResults,
          query,
          filters,
          pagination: {
            page,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        };
      } catch (fallbackError) {
        return rejectWithValue(fallbackError.message);
      }
    }
  }
);

// Fetch popular searches
export const fetchPopularSearches = createAsyncThunk(
  'search/fetchPopularSearches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/shop/search/popular`);
      
      if (response.data.success) {
        return { popularSearches: response.data.popularSearches };
      } else {
        return rejectWithValue(response.data.message || "Failed to fetch popular searches");
      }
    } catch (error) {
      console.error("Popular searches API error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Load recent searches from localStorage
export const loadRecentSearches = () => (dispatch) => {
  try {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      const recentSearches = JSON.parse(saved);
      dispatch(searchSlice.actions.setRecentSearches(recentSearches));
    }
  } catch (error) {
    console.error('Failed to load recent searches:', error);
  }
};

// Add search to recent searches
export const addRecentSearch = (query) => (dispatch, getState) => {
  try {
    const state = getState().search;
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) return;
    
    let updatedSearches = [...state.recentSearches];
    updatedSearches = updatedSearches.filter(search => search !== trimmedQuery);
    updatedSearches.unshift(trimmedQuery);
    updatedSearches = updatedSearches.slice(0, 10);
    
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    dispatch(searchSlice.actions.setRecentSearches(updatedSearches));
  } catch (error) {
    console.error('Failed to save recent search:', error);
  }
};

// Clear recent searches
export const clearRecentSearches = () => (dispatch) => {
  try {
    localStorage.removeItem('recentSearches');
    dispatch(searchSlice.actions.setRecentSearches([]));
  } catch (error) {
    console.error('Failed to clear recent searches:', error);
  }
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setRecentSearches: (state, action) => {
      state.recentSearches = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSearch: (state) => {
      state.searchResults = [];
      state.searchQuery = "";
      state.suggestions = [];
      state.pagination = initialState.pagination;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch suggestions
      .addCase(fetchSearchSuggestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSearchSuggestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suggestions = action.payload.suggestions;
      })
      .addCase(fetchSearchSuggestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.suggestions = [];
      })
      
      // Perform search
      .addCase(performSearch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.results;
        state.searchQuery = action.payload.query;
        state.filters = { ...state.filters, ...action.payload.filters };
        state.pagination = action.payload.pagination;
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.searchResults = [];
      })
      
      // Fetch popular searches
      .addCase(fetchPopularSearches.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPopularSearches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.popularSearches = action.payload.popularSearches;
      })
      .addCase(fetchPopularSearches.rejected, (state) => {
        state.isLoading = false;
        // Keep default popular searches if API fails
      });
  }
});

export const {
  setSearchQuery,
  setFilters,
  resetFilters,
  clearSearch,
  setPage
} = searchSlice.actions;

export default searchSlice.reducer;