<template>
  <div class="time-converter rtl" :style="backgroundStyle">
    <div class="card">
      <div class="time-difference">{{ timeDifferenceMessage }}</div>
      <div class="location-row">
        <div class="location-info">
          <div class="location-text">
            <h3 class="location-title">זמן מקומי</h3>
            <p class="timezone-label">{{ localOffset }}</p>
          </div>
          <p class="location-time">{{ formattedLocalTime }}</p>
        </div>
        <input type="range" min="0" max="47" step="1" class="slider" v-model="localHour" @input="updateTimes(localHour, 'local')" :style="{ background: meetingTimeGradient }" />
      </div>
      <div class="location-row">
        <div class="location-info">
          <div class="location-text">
            <h3 class="location-title">{{ entityName }}</h3>
            <p class="timezone-label">{{ otherOffset }}</p>
          </div>
          <p class="location-time">{{ formattedOtherTime }}</p>
        </div>
        <input type="range" min="0" max="47" step="1" class="slider" v-model="otherHour" @input="updateTimes(otherHour, 'other')" :style="{ background: meetingTimeGradient }" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { DateTime } from 'luxon';
import { computed, defineProps, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { default as locationData } from '../public/data.json';

const props = defineProps({
  entitySlug: String,
  entityType: String,
});

const localHour = ref(DateTime.local().hour);
const otherHour = ref(DateTime.local().hour);
const formattedLocalTime = ref('');
const formattedOtherTime = ref('');

// fetchTimezoneData
const { data } = await useFetch('https://worldtimeapi.org/api/ip');
const localTimezone = computed(() => data.value.timezone);

const entityInfo = locationData.find((c) => c.slug === props.entitySlug && c.type === props.entityType);
const entityName = computed(() => entityInfo.name);
const otherTimezone = computed(() => entityInfo.timezone);
const image = computed(() => entityInfo.image);

const updateTimes = (sliderValue, origin) => {
  const isLocal = origin === 'local';
  const originHourRef = isLocal ? localHour : otherHour;
  originHourRef.value = sliderValue;

  // Calculate the hour and minute based on the slider value
  const hour = Math.floor(sliderValue / 2);
  const minute = (sliderValue % 2) * 30;

  const originTimezone = isLocal ? localTimezone.value : otherTimezone.value;
  const targetTimezone = isLocal ? otherTimezone.value : localTimezone.value;

  let originDateTime = DateTime.now().setZone(originTimezone).set({ hour, minute });
  const targetDateTime = originDateTime.setZone(targetTimezone);

  if (isLocal) {
    formattedLocalTime.value = originDateTime.toFormat('HH:mm');
    // Convert targetDateTime's hour and minute back to slider value for the other slider
    otherHour.value = targetDateTime.hour * 2 + (targetDateTime.minute === 30 ? 1 : 0);
    formattedOtherTime.value = targetDateTime.toFormat('HH:mm');
  } else {
    formattedOtherTime.value = originDateTime.toFormat('HH:mm');
    // Convert targetDateTime's hour and minute back to slider value for the local slider
    localHour.value = targetDateTime.hour * 2 + (targetDateTime.minute === 30 ? 1 : 0);
    formattedLocalTime.value = targetDateTime.toFormat('HH:mm');
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
  let diffMessage;

  if (differenceInHours === 0) {
    diffMessage = 'זהה לאזור הזמן שלך';
  } else if (differenceInHours > 0) {
    diffMessage = `מקדימה אותך ב-${Math.abs(differenceInHours)} שעות`;
  } else {
    diffMessage = `מפגרת אחריך ב-${Math.abs(differenceInHours)} שעות`;
  }

  return `${entityName.value} ${diffMessage}`;
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

  // Note the change here: `to right` becomes `to left` for RTL
  return `linear-gradient(to left,
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
  const now = DateTime.local();
  const initialSliderValue = now.hour * 2 + (now.minute >= 30 ? 1 : 0);
  localHour.value = initialSliderValue;
  formattedLocalTime.value = now.toFormat('HH:mm');
  const otherNow = now.setZone(otherTimezone.value);
  otherHour.value = otherNow.hour * 2 + (otherNow.minute >= 30 ? 1 : 0);
  formattedOtherTime.value = otherNow.toFormat('HH:mm');
});

watch([localTimezone, otherTimezone], () => {
  updateTimes(localHour.value, 'local');
});

// SEO metadata
watch(
  entityName,
  (entityName) => {
    const optimizedImageUrl = image.value.replace('w=2000', 'w=1200');

    useHead({
      htmlAttrs: {
        lang: 'he',
      },
      title: `מה השעה ב${entityName}? הפרש השעות בין ${entityName} לישראל`,
      meta: [
        {
          name: 'description',
          content: `מצא את הזמן המדויק ב${entityName}. הכלי מאפשר חישוב זמנים ומציאת שעות מתאימות שמתאימות לשני האזורים.`,
        },
        {
          property: 'og:title',
          content: `מה השעה ב${entityName}? הפרש השעות בין ${entityName} לישראל`,
        },
        {
          property: 'og:description',
          content: `מצא והשווה זמנים ב${entityName} וברחבי העולם. אידיאלי לתכנון פגישות בינלאומיות.`,
        },
        {
          property: 'og:image',
          content: optimizedImageUrl,
        },
        {
          property: 'og:url',
          content: `https://worldtime.co.il${route.path}`,
        },
      ],
    });
  },
  { immediate: true }
);
</script>

<style scoped src="./TimeConverter.styles.css" />
