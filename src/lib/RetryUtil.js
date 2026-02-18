// Utility for retry logic with exponential backoff
export const fetchWithRetry = async (fetchFn, maxRetries = 2) => {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await fetchFn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      attempt++;
      // Exponential backoff: 250ms * (attempt + 1)
      await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
};

// Retry logic specifically for axios calls
export const axiosRetry = async (axiosCall, maxRetries = 2) => {
  return fetchWithRetry(() => axiosCall, maxRetries);
};
