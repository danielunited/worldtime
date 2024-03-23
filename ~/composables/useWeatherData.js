import { ref, onMounted } from 'vue';
import { fetchCurrentWeather } from '~/utils/weatherData.js';

export function useWeatherData(latitude, longitude) {
  const weatherData = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  async function loadWeatherData() {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await fetchCurrentWeather(latitude, longitude);
      weatherData.value = data;
    } catch (err) {
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  }

  onMounted(() => {
    if (latitude && longitude) {
      loadWeatherData();
    }
  });

  return {
    weatherData,
    isLoading,
    error,
    reload: loadWeatherData,
  };
}
