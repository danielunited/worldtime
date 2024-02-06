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
            <h3 class="location-title">{{ entityName }}</h3>
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
import { computed, defineProps, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  entitySlug: String,
  entityType: String,
});

const localHour = ref(DateTime.local().hour);
const otherHour = ref(DateTime.local().hour);
const entityName = ref('');
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

const fetchEntityData = async (slug, entityType) => {
  const nuxtApp = useNuxtApp(); // Get access to Nuxt app instance
  try {
    const mappings = await $fetch('/data.json'); // Fetch your data source
    const entityInfo = mappings.find((c) => c.slug === slug && c.type === entityType);

    if (!entityInfo) {
      // If no matching entity is found, use Nuxt's error handling to show the default 404 page
      nuxtApp.$nuxt.error({ statusCode: 404, message: 'Page not found' });
      return; // Prevent further execution
    }

    // If entity is found and matches the type, proceed with setting the data
    entityName.value = entityInfo.name;
    otherTimezone.value = entityInfo.timezone;
    image.value = entityInfo.image;
  } catch (error) {
    console.error('Failed to fetch entity data:', error);
    // Optionally, handle the error more gracefully here
    nuxtApp.$nuxt.error({ statusCode: 404, message: 'Page not found' });
  }
};

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
  return `${entityName.value} is ${diffMessage} your location`;
});

const backgroundStyle = computed(() => ({
  backgroundImage: `url(${image.value})`,
}));

const meetingTimeGradient = computed(() => {
  const morningStartPct = (6 / 24) * 100;
  const workStartPct = (9 / 24) * 100;
  const workEndPct = (18 / 24) * 100;
  const eveningEndPct = (21 / 24) * 100;

  const nightColor = '#FF4F64';
  const earlyLateColor = '#FFAB00';
  const workColor = '#00E28D';

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
  await fetchTimezoneData();
  await fetchEntityData(props.entitySlug, props.entityType);
  updateTimes(localHour.value, 'local', false);
});

watch([localTimezone, otherTimezone], () => {
  updateTimes(localHour.value, 'local');
});
</script>

<style scoped src="./TimeConverter.styles.css" />
