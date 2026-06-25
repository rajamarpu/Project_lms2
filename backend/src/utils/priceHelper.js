/**
 * Recursively traverses an object or array, converting any key named 'price' 
 * from integer cents (stored in DB) to decimal units (used by frontend).
 * 
 * @param {any} obj - The object or array to format.
 * @returns {any} The formatted object or array.
 */
function formatPrice(obj) {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(formatPrice);
  }

  if (typeof obj === 'object') {
    // If it's a Date object, return as-is
    if (obj instanceof Date) return obj;

    // Check if the current object has a price property
    if (Object.prototype.hasOwnProperty.call(obj, 'price') && typeof obj.price === 'number') {
      obj.price = obj.price / 100;
    }

    // Recursively handle all nested properties
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (obj[key] !== null && typeof obj[key] === 'object') {
        obj[key] = formatPrice(obj[key]);
      }
    }
  }

  return obj;
}

module.exports = { formatPrice };
