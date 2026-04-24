// Lightweight in-process cache
const cacheMap = new Map();

/**
 * Gets an item from the cache.
 * @param {string} key 
 * @returns {any|null} The cached value or null if expired/not found
 */
export const cacheGet = (key) => {
  const item = cacheMap.get(key);
  if (!item) return null;

  if (Date.now() > item.expiry) {
    cacheMap.delete(key);
    return null;
  }

  return item.value;
};

/**
 * Sets an item in the cache.
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttlSeconds Time to live in seconds
 */
export const cacheSet = (key, value, ttlSeconds = 300) => {
  cacheMap.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000
  });
};

/**
 * Deletes an item from the cache.
 * @param {string} key 
 */
export const cacheDelete = (key) => {
  cacheMap.delete(key);
};

/**
 * Clears all items from the cache.
 */
export const cacheClear = () => {
  cacheMap.clear();
};
