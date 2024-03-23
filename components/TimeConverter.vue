<template>
  <div class="time-converter rtl" :style="backgroundStyle">
    <div class="card">
      <div class="time-difference">{{ timeDifferenceMessage }}</div>
      <LocationRow
        :title="isUserInIsrael ? 'ישראל' : 'זמן מקומי'"
        :timezone-label="localOffset"
        :formatted-time="formattedLocalTime"
        :hour="localHour"
        :update-times="updateTimes"
        :background-style="meetingTimeGradient"
        aria-label="מחוון זמן מקומי"
      />
      <LocationRow
        :title="entityName"
        :timezone-label="otherOffset"
        :formatted-time="formattedOtherTime"
        :hour="otherHour"
        :update-times="updateTimes"
        :background-style="meetingTimeGradient"
        :aria-label="'מחוון זמן ל' + entityName"
      />
      <Accordion :title="`מדריך למטייל ב${entityName}`">
        <p v-if="description" class="description">{{ description }}</p>
        <p v-else class="description">המידע אינו זמין כעת. נסו שוב מאוחר יותר</p>
      </Accordion>
      <hr />
      <Accordion :title="accordionTitle">
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
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useTimezoneData } from '@/composables/useTimezoneData';
import LocationRow from '@/components/LocationRow.vue';
import Accordion from '@/components/Accordion.vue';

const props = defineProps({
  entitySlug: String,
  entityType: String,
});

const localHour = ref(DateTime.local().hour);
const otherHour = ref(DateTime.local().hour);
const formattedLocalTime = ref('');
const formattedOtherTime = ref('');
const forecasts = ref([]);
const accordionTitle = ref('');

// fetchTimezoneData
const { fetchTimezoneData, formatOffset, fetchDescription, fetchWeatherData } = useTimezoneData();

const localTimezone = computed(() => fetchTimezoneData().localTimezone);

const isUserInIsrael = computed(() => {
  return localTimezone.value === 'Asia/Jerusalem';
});

const { entityInfo, entityName, otherTimezone, image } = useTimezoneData(props.entitySlug, props.entityType);

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

const localOffset = computed(() => formatOffset(fetchTimezoneData().localOffset));
const otherOffset = computed(() => formatOffset(fetchTimezoneData().otherOffset));

const timeDifferenceMessage = computed(() => {
  const localDateTime = DateTime.now().setZone(localTimezone.value);
  const otherDateTime = DateTime.now().setZone(otherTimezone.value);
  const differenceInHours = Math.abs(otherDateTime.offset / 60 - localDateTime.offset / 60);
  let diffMessage;

  const displayName = entityInfo.country ? `${entityName.value} (${entityInfo.country})` : entityName.value;

  if (differenceInHours === 0) {
    diffMessage = 'זהה לאזור הזמן שלך';
  } else {
    let hoursText;
    switch (differenceInHours) {
      case 1:
        hoursText = 'בשעה';
        break;
      case 2:
        hoursText = 'בשעתיים';
        break;
      default:
        hoursText = `ב-${differenceInHours} שעות`;
    }

    if (otherDateTime.offset > localDateTime.offset) {
      diffMessage = isUserInIsrael.value ? `מקדימה את ישראל ${hoursText}` : `מקדימה אותך ${hoursText}`;
    } else {
      diffMessage = isUserInIsrael.value ? `מפגרת אחר ישראל ${hoursText}` : `מפגרת אחריך ${hoursText}`;
    }
  }

  return `${displayName} ${diffMessage}`;
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

const description = computed(() => fetchDescription(entityName.value));

// Removed the fetchDescription function as it's now handled by the useTimezoneData composable.

accordionTitle.value = `תחזית מזג האוויר ל${entityName.value}`;

// Removed the fetchWeatherData function as it's now handled by the useTimezoneData composable.

onMounted(() => {
  if (entityInfo.lat && entityInfo.lon) {
    fetchWeatherData(entityInfo.lat, entityInfo.lon);
  } else {
    console.error('Latitude or longitude is undefined');
  }
});

watch(
  entityName,
  async (newName) => {
    description.value = await fetchDescription(newName);
  },
  { immediate: true }
);

// SEO metadata
watch(
  entityName,
  (entityName) => {
    const optimizedImageUrl = image.value?.replace('w=2000', 'w=1200');
    const titleAndContentSuffix = entityInfo.country ? `${entityName}, ${entityInfo.country}` : `ב${entityName}`;

    useHead({
      htmlAttrs: {
        lang: 'he',
      },
      title: `מה השעה ב${titleAndContentSuffix}? הפרש השעות בין ${entityName} לישראל`,
      meta: [
        {
          name: 'description',
          content: `מצא את הזמן המדויק ב${titleAndContentSuffix}. הכלי מאפשר חישוב זמנים ומציאת שעות מתאימות שמתאימות לשני האזורים.`,
        },
        {
          property: 'og:title',
          content: `מה השעה ב${titleAndContentSuffix}? הפרש השעות בין ${entityName} לישראל`,
        },
        {
          property: 'og:description',
          content: `מצא והשווה זמנים ב${titleAndContentSuffix} וברחבי העולם. אידיאלי לתכנון פגישות בינלאומיות.`,
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

<style scoped src="./TimeConverter.styles.scss" />
