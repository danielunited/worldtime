<template>
  <div class="time-converter" :style="backgroundStyle">
    <!-- User's Local Time Slider Row -->
    <div class="location-row my-4">
      <div class="location-info">
        <h3 class="location-title">Local Time</h3>
        <p class="timezone-label">(UTC {{ localOffset }})</p>
        <p class="location-time">{{ formattedLocalTime }}</p>
      </div>
      <input type="range" min="0" max="23" step="1" class="slider" v-model="localHour" @input="updateTimes(localHour, 'local')" />
    </div>
    <!-- Other Location's Time Slider Row -->
    <div class="location-row my-4">
      <div class="location-info">
        <h3 class="location-title">{{ cityName }}</h3>
        <p class="timezone-label">(UTC {{ otherOffset }})</p>
        <p class="location-time">{{ formattedOtherTime }}</p>
      </div>
      <input type="range" min="0" max="23" step="1" class="slider" v-model="otherHour" @input="updateTimes(otherHour, 'other')" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { DateTime } from 'luxon';

// Reactive states
const localHour = ref(DateTime.local().hour);
const otherHour = ref(DateTime.local().hour);
const localTimezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone);
const otherTimezone = ref('');
const cityName = ref('');
const image = ref(''); // Use 'image' as the reactive variable for the city's image
const formattedLocalTime = ref('');
const formattedOtherTime = ref('');

// Fetch the city's timezone from data.json based on the route parameter
async function fetchCityTimezone(city) {
  const mappings = await $fetch('/data.json');
  const cityInfo = mappings.find((c) => c.name.toLowerCase() === city.toLowerCase() && c.type === 'city');
  if (cityInfo) {
    otherTimezone.value = cityInfo.timezone;
    image.value = cityInfo.image; // Assign the city's image URL from the data.json
  } else {
    throw new Error('City timezone not found');
  }
}

// Computed properties for UTC offsets
const localOffset = computed(() => {
  return DateTime.local().setZone(localTimezone.value).offset / 60;
});

const otherOffset = computed(() => {
  return DateTime.local().setZone(otherTimezone.value).offset / 60;
});

// Update times based on the slider's values and origin
function updateTimes(hour, origin) {
  // Convert hour to a number to ensure calculations are correct
  hour = Number(hour);

  // Determine the reference time for the slider that was changed
  let referenceTime = DateTime.local().set({ hour, minute: 0, second: 0 });

  if (origin === 'local') {
    // Update the local hour and format the time
    localHour.value = hour;
    formattedLocalTime.value = referenceTime.setZone(localTimezone.value).toFormat('h:mm a');
    // Calculate and update the other hour
    referenceTime = referenceTime.setZone(otherTimezone.value);
    otherHour.value = referenceTime.hour;
    formattedOtherTime.value = referenceTime.toFormat('h:mm a');
  } else {
    // Update the other hour and format the time
    otherHour.value = hour;
    formattedOtherTime.value = referenceTime.setZone(otherTimezone.value).toFormat('h:mm a');
    // Calculate and update the local hour
    referenceTime = referenceTime.setZone(localTimezone.value);
    localHour.value = referenceTime.hour;
    formattedLocalTime.value = referenceTime.toFormat('h:mm a');
  }
}

const backgroundStyle = computed(() => ({
  backgroundImage: `url(${image.value})`, // Use 'image' reactive variable here
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
}));

const route = useRoute();
onMounted(async () => {
  cityName.value = decodeURIComponent(route.params.cityName).replace(/-/g, ' ');
  await fetchCityTimezone(cityName.value);
  // Set the initial times without rounding
  const now = DateTime.local();
  formattedLocalTime.value = now.setZone(localTimezone.value).toFormat('h:mm a');
  formattedOtherTime.value = now.setZone(otherTimezone.value).toFormat('h:mm a');
});
</script>
