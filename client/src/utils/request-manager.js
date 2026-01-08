class RequestManager {
  constructor() {
    this.pendingRequests = new Map();
    this.cache = new Map();
    this.cacheDuration = 30000; // 30 seconds cache
    this.minRequestInterval = 1000; // 1 second between same requests
    this.requestCounts = new Map();
    this.maxRequestsPerMinute = 30;
  }

  async makeRequest(key, requestFn, options = {}) {
    const { forceRefresh = false, cacheDuration = this.cacheDuration } = options;
    
    // Check rate limiting
    const now = Date.now();
    const requestCount = this.requestCounts.get(key) || { count: 0, timestamp: now };
    
    // Reset count if more than a minute has passed
    if (now - requestCount.timestamp > 60000) {
      requestCount.count = 0;
      requestCount.timestamp = now;
    }
    
    // Check if rate limited
    if (requestCount.count >= this.maxRequestsPerMinute) {
      throw new Error(`Rate limit exceeded for key: ${key}. Please wait a moment.`);
    }
    
    requestCount.count++;
    this.requestCounts.set(key, requestCount);

    // Check cache first
    const cached = this.cache.get(key);
    if (cached && !forceRefresh && (now - cached.timestamp < cacheDuration)) {
      return cached.data;
    }

    // Check if same request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Create new request
    const requestPromise = requestFn()
      .then(response => {
        // Cache the response
        this.cache.set(key, {
          data: response,
          timestamp: Date.now()
        });
        return response;
      })
      .catch(error => {
        // Clear cache on error
        this.cache.delete(key);
        throw error;
      })
      .finally(() => {
        // Clean up after delay to prevent immediate duplicate requests
        setTimeout(() => {
          this.pendingRequests.delete(key);
        }, this.minRequestInterval);
      });

    this.pendingRequests.set(key, requestPromise);
    return requestPromise;
  }

  clearCache() {
    this.cache.clear();
    this.pendingRequests.clear();
    this.requestCounts.clear();
  }

  invalidateCache(key) {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
    for (const key of this.pendingRequests.keys()) {
      if (regex.test(key)) {
        this.pendingRequests.delete(key);
      }
    }
  }
}

export const requestManager = new RequestManager();