<template>
  <div class="weather-forecast">
    <div v-if="forecasts.length" class="forecasts-container">
      <div v-for="(forecast, index) in forecasts" :key="index" class="forecast">
        <div class="day-of-week">{{ forecast.dayOfWeek }}</div>
        <div class="temperature">
          <img :src="forecast.icon" alt="Weather icon" class="weather-icon" />
          <span>{{ forecast.temp }}°C</span>
        </div>
        <div class="description">{{ forecast.description }}</div>
      </div>
    </div>
    <div v-else class="no-forecast">Weather forecast is not available.</div>
  </div>
</template>

<script setup>
import { defineProps, onMounted, ref } from 'vue';

const props = defineProps({
  lat: Number,
  lon: Number,
});

const forecasts = ref([]);

const fetchWeatherData = async (lat, lon) => {
  const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    forecasts.value = data.daily.map((day) => ({
      dayOfWeek: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
      temp: Math.round(day.temp.day),
      description: day.weather[0].description,
      icon: `http://openweathermap.org/img/wn/${day.weather[0].icon}.png`,
    }));
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
};

onMounted(() => {
  if (props.lat && props.lon) {
    fetchWeatherData(props.lat, props.lon);
  }
});
</script>

<style scoped>
.weather-forecast {
  display: flex;
  flex-direction: column;
}

.forecasts-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.forecast {
  flex-basis: calc(33.333% - 10px);
  margin-bottom: 20px;
  text-align: center;
}

.day-of-week {
  font-weight: bold;
}

.temperature {
  display: flex;
  align-items: center;
  justify-content: center;
}

.weather-icon {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.no-forecast {
  text-align: center;
  color: #666;
}
</style>
