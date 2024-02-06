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
        <input type="range" min="0" max="23" step="1" class="slider" v-model="localHour" @input="updateTimes(localHour, 'local')" :style="{ background: meetingTimeGradient }" />
      </div>
      <div class="location-row">
        <div class="location-info">
          <div class="location-text">
            <h3 class="location-title">{{ cityName }}</h3>
            <p class="timezone-label">{{ otherOffset }}</p>
          </div>
          <p class="location-time">{{ formattedOtherTime }}</p>
        </div>
        <input type="range" min="0" max="23" step="1" class="slider" v-model="otherHour" @input="updateTimes(otherHour, 'other')" :style="{ background: meetingTimeGradient }" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { DateTime } from 'luxon';
import { computed, onMounted, ref, watch } from 'vue';
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

const meetingTimeGradient = computed(() => {
  // Convert hours to percentages of the day
  const morningStartPct = (6 / 24) * 100; // 6 AM start
  const workStartPct = (9 / 24) * 100; // 9 AM start
  const workEndPct = (18 / 24) * 100; // 6 PM end
  const eveningEndPct = (21 / 24) * 100; // 9 PM end

  // Define colors based on the specified times
  const nightColor = '#FF4F64'; // For hours outside 6 AM to 9 PM
  const earlyLateColor = '#FFAB00'; // For 6 AM to 9 AM and 6 PM to 9 PM
  const workColor = '#00E28D'; // For 9 AM to 6 PM

  // Build the gradient with sharp transitions
  return `linear-gradient(to right,
    ${nightColor} 0%, 
    ${nightColor} ${morningStartPct}%, 
    ${earlyLateColor} ${morningStartPct}%, 
    ${earlyLateColor} ${workStartPct}%, 
    ${workColor} ${workStartPct}%, 
    ${workColor} ${workEndPct}%, 
    ${earlyLateColor} ${workEndPct}%, 
    ${earlyLateColor} ${eveningEndPct}%, 
    ${nightColor} ${eveningEndPct}%, 
    ${nightColor} 100%)`;
});

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

<style scoped src="./cityName.styles.css" />
