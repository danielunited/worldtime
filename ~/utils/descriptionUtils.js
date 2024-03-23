// ~/utils/descriptionUtils.js

/**
 * Fetches a location description from Wikivoyage or a similar service.
 * @param {String} location The name of the location to fetch the description for.
 * @returns {Promise<String>} A promise that resolves to the location's description.
 */
export async function fetchDescription(location) {
  // Construct the URL for the API endpoint. This is a placeholder URL and should be replaced with the actual API endpoint.
  const apiUrl = `https://example.com/api/description?location=${encodeURIComponent(location)}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch description for ${location}: ${response.statusText}`);
    }
    const data = await response.json();
    // Assuming the API returns a JSON object with a 'description' field.
    // This should be adjusted based on the actual API response structure.
    return data.description;
  } catch (error) {
    console.error(`Error fetching description for ${location}:`, error);
    throw error; // Rethrow to allow caller to handle the error.
  }
}
