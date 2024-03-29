// server/middleware/timezoneFetcher.js
import axios from 'axios';

export default async (req, res, next) => {
  // Check if the request is for a city/country page
  if (req.url.startsWith('/city/') || req.url.startsWith('/country/')) {
    try {
      // Make a request to worldtimeapi.org to get the user's timezone
      const response = await axios.get('http://worldtimeapi.org/api/ip');
      if (response.status === 200 && response.data && response.data.timezone) {
        // Inject the timezone data into the page context
        res.locals.timezone = response.data.timezone;
      } else {
        console.error('Failed to fetch timezone data:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching timezone data:', error);
    }
  }
  next();
};
