<template>
  <div class="time-converter rtl" :style="backgroundStyle">
    <div class="card-container">
      <div class="card">
        <h1 class="time-difference">{{ timeDifferenceMessage }}</h1>
        <location-row
          type="local"
          :title="isUserInIsrael ? 'ישראל' : 'זמן מקומי'"
          :timezone="timezone"
          :time="localDateTime"
          @change="updateTimes"
        />
        <location-row
          type="other"
          :title="entityName"
          :timezone="otherTimezone"
          :time="otherDateTime"
          @change="updateTimes"
        />
        <Accordion :title="`מדריך למטייל ב${entityName}`">
          <p v-if="description" class="description">{{ description }}</p>
          <p v-else class="description">המידע אינו זמין כעת. נסו שוב מאוחר יותר</p>
        </Accordion>
        <hr />
        <weather-forecast :entity-info="entityInfo" />
        <hr />
        <shabbat-times
          :entity-info="entityInfo"
          :entity-type="props.entityType"
        />
      </div>
    </div>

    <related-locations
      :entity-slug="props.entitySlug"
      :entity-type="props.entityType"
    />
  </div>
</template>

<script setup>
import { DateTime } from 'luxon';
import {computed, defineProps, onBeforeMount, onMounted, ref, watch} from 'vue';
import { useRoute } from 'vue-router';
import { default as locationData } from '../public/data.json';
import ShabbatTimes from '~/components/shabbat-times/ShabbatTimes.vue';
import WeatherForecast from '~/components/weather-forecast/WeatherForecast.vue';
import {getLocationTime, getUserTimezone} from '~/utils/timeUtils.js';

const props = defineProps({
  entitySlug: String,
  entityType: String,
});

let timezone = ref('Asia/Jerusalem');

onBeforeMount(async() => {
  timezone.value = await getUserTimezone();
});

const localDateTime = ref(DateTime.now());
const otherDateTime = ref(DateTime.now());

const isUserInIsrael = computed(() => {
  return timezone.value === 'Asia/Jerusalem';
});

const entityInfo = locationData.find((c) => c.slug === props.entitySlug && c.type === props.entityType);
const entityName = computed(() => entityInfo.name);
const otherTimezone = computed(() => entityInfo.timezone);
const image = computed(() => entityInfo.image);

const updateTimes = (sliderValue, origin) => {
  const isLocal = origin === 'local';

  if (isLocal) {
    localDateTime.value = getLocationTime(timezone.value, sliderValue);
    otherDateTime.value = localDateTime.value.setZone(otherTimezone.value);
  } else {
    otherDateTime.value = getLocationTime(otherTimezone.value, sliderValue);
    localDateTime.value = otherDateTime.value.setZone(timezone.value);
  }
};

const timeDifferenceMessage = computed(() => {
  const localDateTime = DateTime.now().setZone(timezone.value);
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

const route = useRoute();

onMounted(async () => {
  localDateTime.value = DateTime.local();
  otherDateTime.value = localDateTime.value.setZone(otherTimezone.value);
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
