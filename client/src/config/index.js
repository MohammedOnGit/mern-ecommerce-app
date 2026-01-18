// ================= AUTH FORMS =================
export const registerFormControls = [
  {
    label: "Username",
    name: "userName",
    type: "text",
    placeholder: "Enter your username",
    required: true,
  },
  {
    label: "Email",
    name: "email",
    type: "email",
    placeholder: "Enter your email",
    required: true,
  },
  {
    label: "Password",
    name: "password",
    type: "password",
    placeholder: "Enter your password",
    required: true,
  },
];

export const loginFormControls = [
  {
    label: "Email",
    name: "email",
    type: "email",
    placeholder: "Enter your email",
    required: true,
  },
  {
    label: "Password",
    name: "password",
    type: "password",
    placeholder: "Enter your password",
    required: true,
  },
];

// ================= PRODUCT FORM =================
export const addProductFormElements = [
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
    required: true,
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
    required: true,
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    required: true,
    options: [
      { id: "men", label: "Men" },
      { id: "women", label: "Women" },
      { id: "kids", label: "Kids" },
      { id: "accessories", label: "Accessories" },
      { id: "footwear", label: "Footwear" },
    ],
  },
  {
    label: "Brand",
    name: "brand",
    componentType: "select",
    required: true,
    options: [
      { id: "nike", label: "Nike" },
      { id: "adidas", label: "Adidas" },
      { id: "puma", label: "Puma" },
      { id: "levi", label: "Levi's" },
      { id: "zara", label: "Zara" },
      { id: "hm", label: "H&M" },
    ],
  },
  {
    label: "Price",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Enter product price",
    required: true,
    min: 0,
  },
  {
    label: "Sale Price",
    name: "salePrice",
    componentType: "input",
    type: "number",
    placeholder: "Enter sale price (optional)",
    min: 0,
  },

  // INVENTORY MANAGEMENT FIELDS
  {
    label: "Total Stock",
    name: "totalStock",
    componentType: "input",
    type: "number",
    placeholder: "Enter total stock quantity",
    required: true,
    min: 0,
  },
  {
    label: "Low Stock Threshold",
    name: "lowStockThreshold",
    componentType: "input",
    type: "number",
    placeholder: "Enter low stock alert threshold (default: 5)",
    defaultValue: 5,
    min: 0,
  },
  {
    label: "Allow Backorders",
    name: "allowBackorders",
    componentType: "select",
    options: [
      {
        id: "false",
        label: "No - Show as out of stock when inventory is zero",
      },
      { id: "true", label: "Yes - Allow customers to order when out of stock" },
    ],
    defaultValue: "false",
  },
  {
    label: "Show When Out of Stock",
    name: "showOutOfStock",
    componentType: "select",
    options: [
      { id: "true", label: "Yes - Show product even when out of stock" },
      { id: "false", label: "No - Hide product when out of stock" },
    ],
    defaultValue: "true",
  },
  {
    label: "Product Status",
    name: "isActive",
    componentType: "select",
    options: [
      { id: "true", label: "Active - Product is visible to customers" },
      { id: "false", label: "Inactive - Product is hidden from customers" },
    ],
    defaultValue: "true",
  },
];

// ================= HEADER MENU =================
export const shopingViewHeaderMenuItems = [
  { id: "home", label: "Home", path: "/shop/home" },
  { id: "men", label: "Men", path: "/shop/listing" },
  { id: "women", label: "Women", path: "/shop/listing" },
  { id: "kids", label: "Kids", path: "/shop/listing" },
  { id: "accessories", label: "Accessories", path: "/shop/listing" },
  { id: "footwear", label: "Footwear", path: "/shop/listing" },
];

// ================= MAPS =================
export const categoryOptionsMap = {
  men: "Men",
  women: "Women",
  kids: "Kids",
  accessories: "Accessories",
  footwear: "Footwear",
};
export const brandOptionsMap = {
  nike: "Nike",
  adidas: "Adidas",
  puma: "Puma",
  levi: "Levi's",
  zara: "Zara",
  hm: "H&M",
};

// ================= FILTERS =================
export const filterOptions = {
  category: Object.entries(categoryOptionsMap).map(([id, label]) => ({
    id,
    label,
  })),
  brand: Object.entries(brandOptionsMap).map(([id, label]) => ({ id, label })),
};

export const sortOptions = [
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
  { id: "newest", label: "Newest First" },
  { id: "stock-hightolow", label: "Stock: High to Low" },
  { id: "stock-lowtohigh", label: "Stock: Low to High" },
];

// ================= ADDRESS FORM =================
export const addressFormControls = [
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
    required: true,
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
    required: true,
  },
  {
    label: "Digital Address",
    name: "digitalAddress",
    componentType: "input",
    type: "text",
    placeholder: "Enter your digital address e.g NT-123-4567",
    required: true,
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
    required: true,
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any additional notes (optional)",
  },
];

// ================= SEARCH CONFIG =================
export const searchConfig = {
  api: {
    baseUrl: "http://localhost:5000/api",
    endpoints: {
      suggestions: "/shop/search/suggestions",
      search: "/shop/search",
      popular: "/shop/search/popular",
      filters: "/shop/search/filters",
      autocomplete: "/shop/search/autocomplete",
    },
  },
  settings: {
    debounceTime: 300,
    maxRecentSearches: 5,
    maxSuggestions: 8,
    minQueryLength: 2,
    cacheDuration: 300000,
  },
  popularSearches: [
    "Men's Cologne",
    "Women's Perfume",
    "Gift Sets",
    "Luxury Fragrances",
    "New Arrivals",
    "Best Sellers",
    "Summer Scents",
    "Winter Perfumes",
  ],
  searchCategories: [
    {
      id: "men",
      label: "Men's",
      icon: "👔",
      path: "/shop/listing?category=men",
    },
    {
      id: "women",
      label: "Women's",
      icon: "👗",
      path: "/shop/listing?category=women",
    },
    {
      id: "unisex",
      label: "Unisex",
      icon: "⚧️",
      path: "/shop/listing?category=unisex",
    },
    {
      id: "gift-sets",
      label: "Gift Sets",
      icon: "🎁",
      path: "/shop/search?q=gift+sets",
    },
    {
      id: "luxury",
      label: "Luxury",
      icon: "💎",
      path: "/shop/listing?collection=luxury",
    },
    {
      id: "new",
      label: "New Arrivals",
      icon: "🆕",
      path: "/shop/listing?sort=newest",
    },
  ],
  priceRanges: [
    { id: "under-50", label: "Under ₵50", min: 0, max: 50 },
    { id: "50-100", label: "₵50 - ₵100", min: 50, max: 100 },
    { id: "100-200", label: "₵100 - ₵200", min: 100, max: 200 },
    { id: "200-500", label: "₵200 - ₵500", min: 200, max: 500 },
    { id: "500-plus", label: "₵500+", min: 500, max: 10000 },
  ],
  sortOptions: [
    { id: "relevance", label: "Relevance", value: "relevance" },
    { id: "price-low", label: "Price: Low to High", value: "price_asc" },
    { id: "price-high", label: "Price: High to Low", value: "price_desc" },
    { id: "newest", label: "Newest First", value: "newest" },
    { id: "popular", label: "Most Popular", value: "popular" },
    { id: "rating", label: "Highest Rated", value: "rating_desc" },
  ],
  viewModes: [
    { id: "grid", label: "Grid View", icon: "Grid" },
    { id: "list", label: "List View", icon: "List" },
  ],
  defaultFilters: {
    category: [],
    brand: [],
    priceRange: [],
    rating: 0,
    inStock: true,
  },
};

// ================= SEARCH UTILS =================
export const searchUtils = {
  parseSearchParams: (searchParams) => {
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      if (["category", "brand", "priceRange"].includes(key))
        params[key] = value.split(",");
      else if (
        ["minPrice", "maxPrice", "rating", "page", "limit"].includes(key)
      )
        params[key] = Number(value);
      else if (key === "inStock") params[key] = value === "true";
      else params[key] = value;
    }
    return params;
  },
  buildSearchParams: (params) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (Array.isArray(v) && v.length > 0) sp.set(k, v.join(","));
      else if (v !== undefined && v !== null && v !== "")
        sp.set(k, v.toString());
    });
    return sp.toString();
  },
  generateCacheKey: (params) =>
    `search_${JSON.stringify(
      Object.keys(params)
        .sort()
        .reduce((acc, k) => ((acc[k] = params[k]), acc), {})
    )}`,
  validateSearchQuery: (query) =>
    typeof query === "string" &&
    query.trim().length >= searchConfig.settings.minQueryLength,
  formatSuggestions: (suggestions) =>
    suggestions.map((s) => ({
      ...s,
      highlighted: s.text
        .replace(/(<mark>|<\/mark>)/g, '<strong class="text-primary">')
        .replace(/<\/mark>/g, "</strong>"),
    })),
};

// ================= HELPERS =================
export const getRequiredFields = (formControls = []) =>
  formControls.filter((c) => c.required).map((c) => c.name);

// ================= INVENTORY STATUS =================
export const inventoryStatus = {
  "in-stock": {
    label: "In Stock",
    color: "text-green-600",
    badgeColor: "bg-green-100 text-green-800",
    icon: "✓",
  },
  "low-stock": {
    label: "Low Stock",
    color: "text-amber-600",
    badgeColor: "bg-amber-100 text-amber-800",
    icon: "⚠️",
  },
  "out-of-stock": {
    label: "Out of Stock",
    color: "text-red-600",
    badgeColor: "bg-red-100 text-red-800",
    icon: "✗",
  },
  backorder: {
    label: "Backorder",
    color: "text-amber-600",
    badgeColor: "bg-amber-100 text-amber-800",
    icon: "⏳",
  },
};
