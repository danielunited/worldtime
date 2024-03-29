<template>
  <Accordion :title="weatherTitle">
    <div class="weather-forecast" v-if="forecasts.length">
      <div v-for="(forecast, index) in forecasts" :key="index" class="forecast">
        <p class="description">{{ forecast.dayOfWeek }}</p>
        <div class="temperature">
          <img :src="forecast.icon" alt="weather-icon" class="weather-icon" />
          <p>{{ forecast.temp }}°</p>
        </div>
        <p class="description timezone-label">{{ forecast.description }}</p>
      </div>
    </div>
  </Accordion>
</template>

<script setup>
import {computed, onBeforeMount, ref} from 'vue';

const {entityInfo} = defineProps({
  entityInfo: Object,
});

const forecasts = ref([]);

const weatherTitle = computed(() => {
  return entityInfo.capital ? `מזג האוויר ב${entityInfo.capital}, ${entityInfo.name}` : `מזג האוויר ב${entityInfo.name}`;
});

const apiKey = '5647cf2f6f1bb3b1935afd19352bb579';
// const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

async function fetchWeatherData(lat, lon) {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&lang=he&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    forecasts.value = data.daily.slice(0, 4).map((day) => ({
      dayOfWeek: new Date(day.dt * 1000).toLocaleDateString('he-IL', { weekday: 'long' }),
      temp: Math.round(day.temp.day),
      description: day.weather[0].description,
      icon: `http://openweathermap.org/img/wn/${day.weather[0].icon}.png`,
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
