<script setup>
import { useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import { useAsyncData } from 'nuxt/app';

const route = useRoute();
const cityName = ref('');
const timeData = ref(null);
const error = ref(null);
const pending = ref(true);

// Function to fetch city information and time
async function fetchTimeData(cityName) {
  pending.value = true;
  try {
    const mappings = await $fetch('/data.json');
    const cityInfo = mappings.find((city) => city.name.toLowerCase() === cityName.toLowerCase() && city.type === 'city');
    if (cityInfo && cityInfo.timezone) {
      const data = await $fetch(`https://www.worldtimeapi.org/api/timezone/${cityInfo.timezone}`);
      timeData.value = data;
    }
  } catch (e) {
    error.value = e;
  } finally {
    pending.value = false;
  }
}

// Use onMounted to ensure the route is available
onMounted(() => {
  cityName.value = route.params.cityName;
  fetchTimeData(cityName.value);
});
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold">{{ cityName }} Time Conversion</h1>
    <p v-if="pending">Loading time data...</p>
    <p v-else-if="error">Failed to load time data.</p>
    <p v-else>The current time in {{ cityName }} is: {{ new Date(timeData.datetime).toLocaleString() }}</p>
  </div>
</template>
