<template>
  <div class="time-converter rtl" :style="backgroundStyle">
    <div class="card-container">
      <div class="card">
        <h1 class="time-difference">{{ timeDifferenceMessage }}</h1>
        <location-row type="local" :title="isUserInIsrael ? 'ישראל' : 'זמן מקומי'" :timezone="timezone" :time="localDateTime" @change="updateTimes" />
        <location-row type="other" :title="entityName" :timezone="otherTimezone" :time="otherDateTime" @change="updateTimes" />
        <Accordion :title="tourGuideTitle">
          <div v-if="description" class="description tour-guide" v-html="description"></div>
          <p v-else class="description">המידע בטעינה...</p>
        </Accordion>
        <hr />
        <weather-forecast :entity-info="entityInfo" />
        <hr />
        <shabbat-times :entity-info="entityInfo" :entity-type="props.entityType" />
        <hr />
        <Accordion title="מחשבון המרת זמן | Worldtime" isLink />
      </div>
    </div>
    <related-locations :entity-slug="props.entitySlug" :entity-type="props.entityType" />
  </div>
</template>

<script setup>
import { DateTime } from 'luxon';
import { computed, defineProps, onBeforeMount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ShabbatTimes from '~/components/shabbat-times/ShabbatTimes.vue';
import WeatherForecast from '~/components/weather-forecast/WeatherForecast.vue';
import { getLocationTime, getUserTimezone } from '~/utils/timeUtils.js';
import { default as locationData } from '../public/data.json';
import emojis from '../public/emoji.json';

const props = defineProps({
  entitySlug: String,
  entityType: String,
});

const edgeCases = ['הפיליפינים', 'האיים המלדיביים'];

const removeLeadingHe = (name) => {
  return edgeCases.includes(name) ? name.slice(1) : name;
};

const isPlural = (name) => {
  return edgeCases.includes(name);
};

const tourGuideTitle = computed(() => {
  return `מדריך למטייל ב${removeLeadingHe(entityName.value)}`;
});

let timezone = ref('Asia/Jerusalem');

onBeforeMount(async () => {
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
  const pluralSuffix = isPlural(entityName.value) ? 'ים' : 'ה';

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
      diffMessage = isUserInIsrael.value ? `${displayName} מקדימ${pluralSuffix} את ישראל ${hoursText}` : `${displayName} מקדימ${pluralSuffix} אותך ${hoursText}`;
    } else {
      diffMessage = isUserInIsrael.value ? `${displayName} מפגר${pluralSuffix} אחר ישראל ${hoursText}` : `${displayName} מפגר${pluralSuffix} אחריך ${hoursText}`;
    }
  }

  return diffMessage;
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
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return '';
  }
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
    let descriptionHtml = '';
    let valuableParagraphsIncluded = 0;
    for (let i = 0; i < paragraphs.length; i++) {
      // Check if the paragraph is likely to be informative
      if (paragraphs[i].textContent.trim().length > 50 || (paragraphs[i].querySelector('a') && paragraphs[i].textContent.trim().length > 30)) {
        descriptionHtml += paragraphs[i].outerHTML; // Include this paragraph
        valuableParagraphsIncluded++;
        if (valuableParagraphsIncluded === 3) break;
      }
    }
    return descriptionHtml; // Returns filtered and formatted HTML content
  } catch (error) {
    console.error('Failed to fetch description:', error);
    return '';
  }
}

const entityTimezoneEmoji = computed(() => {
  return emojis[otherTimezone.value] || ''; // Fallback to empty string if not found
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
    const adjustedEntityName = removeLeadingHe(entityName);
    const titleAndContentSuffix = entityInfo.country ? `${adjustedEntityName}, ${entityInfo.country}` : `${adjustedEntityName}`;
    const titleEmoji = entityTimezoneEmoji.value;

    useHead({
      htmlAttrs: {
        lang: 'he',
      },
      title: `מה השעה ב${titleAndContentSuffix}?${titleEmoji ? ' ' + titleEmoji : ''} הפרש השעות בין ${adjustedEntityName} לישראל`,
      meta: [
        {
          name: 'description',
          content: `מצא את הזמן המדויק ב${titleAndContentSuffix}. הכלי מאפשר חישוב זמנים ומציאת שעות מתאימות שמתאימות לשני האזורים.`,
        },
        {
          property: 'og:title',
          content: `מה השעה ב${titleAndContentSuffix}?${titleEmoji ? ' ' + titleEmoji : ''} הפרש השעות בין ${adjustedEntityName} לישראל`,
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
