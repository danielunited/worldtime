<script setup>
import { DateTime } from 'luxon';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const cityName = ref('');
const timeData = ref(null);
const formattedDateTime = ref('');
const error = ref(null);
const pending = ref(true);

async function fetchTimeData(city) {
  pending.value = true;
  try {
    const mappings = await $fetch('/data.json');
    const normalizedCityName = city.replace(/-/g, ' ').toLowerCase(); // Adjust for URL to name matching
    const cityInfo = mappings.find((c) => c.name.toLowerCase() === normalizedCityName && c.type === 'city');
    if (cityInfo && cityInfo.timezone) {
      // Fetch time data from WorldTimeAPI
      const data = await $fetch(`https://www.worldtimeapi.org/api/timezone/${cityInfo.timezone}`);
      timeData.value = data;
      // Parse and format the datetime with timezone using Luxon
      const dt = DateTime.fromISO(data.datetime, { zone: data.timezone });
      formattedDateTime.value = dt.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
    } else {
      throw new Error('City not found');
    }
  } catch (e) {
    error.value = e.message;
  } finally {
    pending.value = false;
  }
}

const route = useRoute();
onMounted(() => {
  cityName.value = decodeURIComponent(route.params.cityName).replace(/-/g, ' ');
  fetchTimeData(cityName.value);
});
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold">{{ cityName }} Time Conversion</h1>
    <p v-if="pending">Loading time data...</p>
    <p v-else-if="error">Failed to load time data: {{ error }}</p>
    <p v-else>{{ formattedDateTime }}</p>
  </div>
</template>
