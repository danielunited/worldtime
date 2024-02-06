<template>
  <div class="time-converter" :style="backgroundStyle">
    <div class="card">
      <div class="time-difference">{{ timeDifferenceMessage }}</div>
      <div class="location-row">
        <div class="location-info">
          <div class="location-text">
            <h3 class="location-title">Local Time</h3>
            <p class="timezone-label">({{ localOffset }})</p>
          </div>

          <p class="location-time">{{ formattedLocalTime }}</p>
        </div>
        <input type="range" min="0" max="23" step="1" class="slider" v-model="localHour" @input="updateTimes(localHour, 'local')" />
      </div>
      <div class="location-row">
        <div class="location-info">
          <div class="location-text">
            <h3 class="location-title">{{ cityName }}</h3>
            <p class="timezone-label">({{ otherOffset }})</p>
          </div>
          <p class="location-time">{{ formattedOtherTime }}</p>
        </div>
        <input type="range" min="0" max="23" step="1" class="slider" v-model="otherHour" @input="updateTimes(otherHour, 'other')" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { DateTime } from 'luxon';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

// Reactive states
const localHour = ref(DateTime.local().hour);
const otherHour = ref(DateTime.local().hour);
const localTimezone = ref('');
const otherTimezone = ref('');
const cityName = ref('');
const image = ref('');
const formattedLocalTime = ref('');
const formattedOtherTime = ref('');

// Fetch real-time data for local timezone using WorldTimeAPI
async function fetchLocalTimezone(ip = '125.25.164.185') {
  const response = await fetch(`https://worldtimeapi.org/api/ip/${ip}`);
  const data = await response.json();
  localTimezone.value = data.timezone; // Set the local timezone
  // Update local time formatting based on fetched timezone
  const now = DateTime.now().setZone(data.timezone);
  formattedLocalTime.value = now.toFormat('h:mm a');
}

// Existing function to fetch the city's timezone - keep this unchanged
async function fetchCityTimezone(city) {
  const mappings = await $fetch('/data.json');
  const cityInfo = mappings.find((c) => c.name.toLowerCase() === city.toLowerCase() && c.type === 'city');
  if (cityInfo) {
    otherTimezone.value = cityInfo.timezone;
    image.value = cityInfo.image;
  } else {
    throw new Error('City timezone not found');
  }
}

const timeDifferenceMessage = computed(() => {
  // Ensure the time zones are correctly set for both local and other city times
  const localDateTime = DateTime.now().setZone(localTimezone.value);
  const otherDateTime = DateTime.now().setZone(otherTimezone.value);

  // Calculate the difference in hours
  const differenceInHours = otherDateTime.offset / 60 - localDateTime.offset / 60;

  // Generate the message
  const diffMessage = differenceInHours === 0 ? 'the same time as' : `${Math.abs(differenceInHours)} hours ${differenceInHours > 0 ? 'ahead of' : 'behind'}`;

  return `${cityName.value} is ${diffMessage} your location`;
});

// Ensure updateTimes function correctly reflects changes in hour and timezone
function updateTimes(hour, origin) {
  hour = Number(hour);

  if (origin === 'local') {
    const referenceTime = DateTime.now().setZone(localTimezone.value).set({ hour });
    formattedLocalTime.value = referenceTime.toFormat('h:mm a');

    const otherTime = referenceTime.setZone(otherTimezone.value);
    otherHour.value = otherTime.hour;
    formattedOtherTime.value = otherTime.toFormat('h:mm a');
  } else {
    const referenceTime = DateTime.now().setZone(otherTimezone.value).set({ hour });
    formattedOtherTime.value = referenceTime.toFormat('h:mm a');

    const localTime = referenceTime.setZone(localTimezone.value);
    localHour.value = localTime.hour;
    formattedLocalTime.value = localTime.toFormat('h:mm a');
  }
}

// Adjust the UTC offset formatting
const formatOffset = (offset) => {
  const sign = offset >= 0 ? '+' : '-';
  return `UTC ${sign}${Math.abs(offset).toString().padStart(2, '0')}:00`;
};

const localOffset = computed(() => {
  return formatOffset(DateTime.local().setZone(localTimezone.value).offset / 60);
});

const otherOffset = computed(() => {
  return formatOffset(DateTime.local().setZone(otherTimezone.value).offset / 60);
});

const backgroundStyle = computed(() => ({
  backgroundImage: `url(${image.value})`, // Use 'image' reactive variable here
}));

const route = useRoute();

// Adjusted to include fetching of local timezone on mount
onMounted(async () => {
  cityName.value = decodeURIComponent(route.params.cityName).replace(/-/g, ' ');
  await fetchLocalTimezone(); // Fetch local timezone upon component mount
  await fetchCityTimezone(cityName.value); // Fetch other city's timezone
});
</script>

<style scoped src="./cityName.styles.css"></style>
