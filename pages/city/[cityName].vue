<template>
  <div class="time-converter" :style="backgroundStyle">
    <div class="card">
      <div class="time-difference">{{ timeDifferenceMessage }}</div>
      <div class="location-row">
        <div class="location-info">
          <div class="location-text">
            <h3 class="location-title">Local Time</h3>
            <p class="timezone-label">{{ localOffset }}</p>
          </div>

          <p class="location-time">{{ formattedLocalTime }}</p>
        </div>
        <input type="range" min="0" max="23" step="1" class="slider" v-model="localHour" @input="updateTimes(localHour, 'local')" />
      </div>
      <div class="location-row">
        <div class="location-info">
          <div class="location-text">
            <h3 class="location-title">{{ cityName }}</h3>
            <p class="timezone-label">{{ otherOffset }}</p>
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
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

// Reactive states for UI
const localHour = ref(DateTime.local().hour);
const otherHour = ref(DateTime.local().hour);
const cityName = ref('');
const localTimezone = ref('');
const otherTimezone = ref('');
const formattedLocalTime = ref('');
const formattedOtherTime = ref('');
const image = ref('');

const fetchTimezoneData = async () => {
  const response = await fetch('https://worldtimeapi.org/api/ip');
  const data = await response.json();
  localTimezone.value = data.timezone;
};

const fetchCityData = async (slug) => {
  const mappings = await $fetch('/data.json');
  const cityInfo = mappings.find((c) => c.slug === slug);
  if (cityInfo) {
    cityName.value = cityInfo.name; // Update the city name based on fetched data
    otherTimezone.value = cityInfo.timezone;
    image.value = cityInfo.image;
  } else {
    throw new Error('City data not found');
  }
};

// Update times based on slider movement and round to the nearest hour
const updateTimes = (hour, origin, round = true) => {
  const originHourRef = origin === 'local' ? localHour : otherHour;
  if (round) {
    originHourRef.value = hour;
  }

  const originTimezone = origin === 'local' ? localTimezone.value : otherTimezone.value;
  const targetTimezone = origin === 'local' ? otherTimezone.value : localTimezone.value;

  let originDateTime = DateTime.now().setZone(originTimezone);
  if (round) {
    originDateTime = originDateTime.set({ hour: Number(hour), minute: 0 });
  }
  const targetDateTime = originDateTime.setZone(targetTimezone);

  if (origin === 'local') {
    formattedLocalTime.value = originDateTime.toFormat('h:mm a');
    otherHour.value = targetDateTime.hour;
    formattedOtherTime.value = targetDateTime.toFormat('h:mm a');
  } else {
    formattedOtherTime.value = originDateTime.toFormat('h:mm a');
    localHour.value = targetDateTime.hour;
    formattedLocalTime.value = targetDateTime.toFormat('h:mm a');
  }
};

const formatOffset = (offset) => {
  const hours = offset / 60;
  const sign = hours >= 0 ? '+' : '-';
  return `UTC ${sign}${Math.abs(hours).toString().padStart(2, '0')}:00`;
};

const localOffset = computed(() => formatOffset(DateTime.now().setZone(localTimezone.value).offset));
const otherOffset = computed(() => formatOffset(DateTime.now().setZone(otherTimezone.value).offset));

const timeDifferenceMessage = computed(() => {
  const localDateTime = DateTime.now().setZone(localTimezone.value);
  const otherDateTime = DateTime.now().setZone(otherTimezone.value);
  const differenceInHours = otherDateTime.offset / 60 - localDateTime.offset / 60;
  const diffMessage = differenceInHours === 0 ? 'the same time as' : `${Math.abs(differenceInHours)} hours ${differenceInHours > 0 ? 'ahead of' : 'behind'}`;
  return `${cityName.value} is ${diffMessage} your location`;
});

const backgroundStyle = computed(() => ({
  backgroundImage: `url(${image.value})`,
}));

const route = useRoute();

onMounted(async () => {
  const slug = route.params.cityName; // Assuming the route parameter is still called cityName for compatibility
  await fetchTimezoneData();
  await fetchCityData(slug); // Fetch city data using slug
  // Initial time setup
  updateTimes(localHour.value, 'local', false);
});

// Watchers to ensure the UI updates correctly when the timezones are known
watch([localTimezone, otherTimezone], () => {
  updateTimes(localHour.value, 'local');
});
</script>

<style scoped src="./cityName.styles.css"></style>
