<template>
  <div class="time-converter rtl" :style="backgroundStyle">
    <div class="card-container">
      <div class="card">
        <h1 class="time-difference">{{ timeDifferenceMessage }}</h1>
        <div class="location-row">
          <div class="location-info">
            <div class="location-text">
              <h3 class="location-title">{{ isUserInIsrael ? 'ישראל' : 'זמן מקומי' }}</h3>
              <p class="timezone-label">{{ localOffset }}</p>
            </div>
            <p class="location-time">{{ formattedLocalTime }}</p>
          </div>
          <input
            type="range"
            min="0"
            max="47"
            step="1"
            class="slider"
            v-model="localHour"
            @input="updateTimes(localHour, 'local')"
            :style="{ background: meetingTimeGradient }"
            aria-label="מחוון זמן מקומי"
          />
        </div>
        <div class="location-row">
          <div class="location-info">
            <div class="location-text">
              <h3 class="location-title">{{ entityName }}</h3>
              <p class="timezone-label">{{ otherOffset }}</p>
            </div>
            <p class="location-time">{{ formattedOtherTime }}</p>
          </div>
          <input
            type="range"
            min="0"
            max="47"
            step="1"
            class="slider"
            v-model="otherHour"
            @input="updateTimes(otherHour, 'other')"
            :style="{ background: meetingTimeGradient }"
            :aria-label="'מחוון זמן ל' + entityName"
          />
        </div>
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

    <div class="related-locations-bar">
      <span class="related-locations-span">ייעדים קרובים:</span>
      <ul class="related-locations-container">
        <li v-for="location in relatedLocations" :key="location.slug" class="related-location-item">
          <NuxtLink :to="`/${location.type === 'city' ? 'city' : 'country'}/${location.slug}`"> {{ location.name }} </NuxtLink>
        </li>
      </ul>
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
const forecasts = ref([]);

// fetchTimezoneData
const { data } = await useFetch('https://worldtimeapi.org/api/ip');

const localTimezone = computed(() => data.value.timezone);

const isUserInIsrael = computed(() => {
  return localTimezone.value === 'Asia/Jerusalem';
});

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

const backgroundStyle = computed(() => {
  if (image.value) {
    return {
      backgroundImage: `url(${image.value})`,
    };
  } else {
    return {};
  }
});

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

const { data: description } = await useAsyncData('description', () => fetchDescription(entityName.value));

async function fetchDescription(entityName) {
  const baseUrl = 'https://he.wikivoyage.org/w/api.php';
  const params = new URLSearchParams({
    action: 'parse',
    page: entityName,
    format: 'json',
    prop: 'text',
    section: 0,
    origin: '*',
  });

  try {
    const response = await fetch(`${baseUrl}?${params}`);
    const data = await response.json();
    const text = data.parse.text['*'];
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const paragraphs = doc.querySelectorAll('p');
    let description = '';
    for (let i = 0; i < paragraphs.length && i < 3; i++) {
      description += paragraphs[i].textContent + '\n';
    }
    return description.trim();
  } catch (error) {
    console.error('Failed to fetch description:', error);
    return '';
  }
}

const accordionTitle = computed(() => {
  const title = entityInfo.capital ? `מזג האוויר ב${entityInfo.capital}, ${entityName.value}` : `מזג האוויר ב${entityName.value}`;
  return title;
});

const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

async function fetchWeatherData(lat, lon) {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&lang=he&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    forecasts.value = data.daily.slice(0, 4).map((day) => ({
      dayOfWeek: new Date(day.dt * 1000).toLocaleDateString('he-IL', { weekday: 'long' }),
      temp: Math.round(day.temp.day),
      description: day.weather[0].description,
      icon: `http://openweathermap.org/img/wn/${day.weather[0].icon}.png`,
    }));
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

const { data: relatedLocations } = useAsyncData('relatedLocations', () => findRelatedLocations(props.entitySlug, props.entityType));

async function findRelatedLocations(entitySlug, entityType) {
  const entityInfo = locationData.find((c) => c.slug === entitySlug && c.type === entityType);

  if (!entityInfo || !entityInfo.lat || !entityInfo.lon) {
    return [];
  }

  return locationData
    .filter((c) => c.slug !== entitySlug)
    .map((location) => {
      const distance = calculateDistance(entityInfo.lat, entityInfo.lon, location.lat, location.lon);
      return { ...location, distance: Math.round(distance) };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 15);
}

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
    const titleAndContentSuffix = entityInfo.country ? `${entityName}, ${entityInfo.country}` : `${entityName}`;

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
