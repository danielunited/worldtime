<template>
  <Accordion :title="weatherTitle">
    <div class="weather-forecast" v-if="forecasts.length">
      <div v-for="(forecast, index) in forecasts" :key="index" class="forecast">
        <p class="description">{{ forecast.dayOfWeek }}</p>
        <div class="temperature">
          <span class="weather-icon">{{ forecast.emoji }}</span>
          <p>{{ forecast.temp }}°</p>
        </div>
        <p class="description weather-description">{{ forecast.description }}</p>
      </div>
    </div>
  </Accordion>
</template>

<script setup>
import { computed, onBeforeMount, ref } from 'vue';

const { entityInfo } = defineProps({
  entityInfo: Object,
});

const forecasts = ref([]);

const weatherTitle = computed(() => {
  return entityInfo.capital ? `מזג האוויר ב${entityInfo.capital}, ${entityInfo.name}` : `מזג האוויר ב${entityInfo.name}`;
});

const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

const weatherEmojis = {
  '01d': '☀️', // clear sky day
  '01n': '🌕', // clear sky night
  '02d': '⛅', // few clouds day
  '02n': '🌑', // few clouds night
  '03d': '☁️', // scattered clouds day
  '03n': '☁️', // scattered clouds night
  '04d': '☁️', // broken clouds day
  '04n': '☁️', // broken clouds night
  '09d': '🌧️', // shower rain day
  '09n': '🌧️', // shower rain night
  '10d': '🌦️', // rain day
  '10n': '🌦️', // rain night
  '11d': '⛈️', // thunderstorm day
  '11n': '⛈️', // thunderstorm night
  '13d': '❄️', // snow day
  '13n': '❄️', // snow night
  '50d': '🌫️', // mist day
  '50n': '🌫️', // mist night
};

async function fetchWeatherData(lat, lon) {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&lang=he&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    forecasts.value = data.daily.slice(0, 4).map((day) => ({
      dayOfWeek: new Date(day.dt * 1000).toLocaleDateString('he-IL', { weekday: 'long' }),
      temp: Math.round(day.temp.day),
      description: day.weather[0].description,
      emoji: weatherEmojis[day.weather[0].icon] || '❓',
    }));
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

onBeforeMount(() => {
  if (entityInfo.lat && entityInfo.lon) {
    fetchWeatherData(entityInfo.lat, entityInfo.lon);
  } else {
    console.error('Latitude or longitude is undefined for Weather data');
  }
});
</script>

<style scoped src="./WeatherForecast.styles.scss" />
