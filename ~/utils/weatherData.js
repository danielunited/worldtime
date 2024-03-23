// ~/utils/weatherData.js

// Placeholder base URL for the weather API
const BASE_URL = 'https://api.weatherapi.com/v1';

// API key for the weather service - this should be securely stored and not hard-coded in production
const API_KEY = 'YOUR_API_KEY_HERE';

/**
 * Fetches current weather data for a given location.
 * @param {number} latitude - The latitude of the location.
 * @param {number} longitude - The longitude of the location.
 * @returns {Promise<Object>} The weather data for the location.
 */
async function fetchCurrentWeather(latitude, longitude) {
  const endpoint = `${BASE_URL}/current.json?key=${API_KEY}&q=${latitude},${longitude}&aqi=no`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch current weather data:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

// Export the utility functions
export { fetchCurrentWeather };
