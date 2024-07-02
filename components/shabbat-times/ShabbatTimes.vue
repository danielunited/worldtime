<template>
  <Accordion :title="shabbatTitle">
    <div v-if="shabbatTimes" class="weather-forecast">
      <div class="forecast">
        <p class="description">כניסת שבת</p>
        <div class="temperature">
          <span class="weather-icon">🕯️</span>
          <p>{{ shabbatTimes.startTime }}</p>
        </div>
        <p class="description weather-description">{{ shabbatTimes.startDate }}</p>
      </div>
      <div class="forecast">
        <p class="description">יציאת שבת</p>
        <div class="temperature">
          <span class="weather-icon">✨</span>
          <p>{{ shabbatTimes.endTime }}</p>
        </div>
        <p class="description weather-description">{{ shabbatTimes.endDate }}</p>
      </div>
      <div class="forecast">
        <p class="description">פרשת השבוע</p>
        <div class="temperature">
          <span class="weather-icon">📜</span>
          <p>{{ shabbatTimes.torahPortion }}</p>
        </div>
      </div>
    </div>
    <p v-else>זמני שבת ופרשת השבוע אינם זמינים כעת.</p>
  </Accordion>
</template>

<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { DateTime } from 'luxon';

const shabbatTimes = ref(null);

const { entityInfo, entityType } = defineProps({
  entityInfo: Object,
  entityType: String,
});

watch(entityInfo.name, () => {
  if (entityInfo.lat && entityInfo.lon) {
    fetchShabbatTimes(entityInfo.lat, entityInfo.lon);
  }
});

onBeforeMount(() => {
  if (entityInfo.lat && entityInfo.lon) {
    fetchShabbatTimes(entityInfo.lat, entityInfo.lon, entityInfo.timezone);
  } else {
    console.error('Latitude or longitude is undefined for Shabbat times');
  }
});

const shabbatTitle = computed(() => {
  if (entityType === 'country' && entityInfo.capital) {
    return `זמני כניסת ויציאת שבת ב${entityInfo.capital}, ${entityInfo.name}`;
  }
  return `זמני כניסת ויציאת שבת ב${entityInfo.name}`;
});

async function fetchShabbatTimes(lat, lon, timezone) {
  const hebcalUrl = `https://www.hebcal.com/shabbat/?cfg=json&latitude=${lat}&longitude=${lon}&tzid=${timezone}`;

  try {
    const response = await fetch(hebcalUrl);
    const data = await response.json();

    if (!data.range) {
      console.error('Invalid response structure:', data);
      return;
    }

    const startDate = DateTime.fromISO(data.range.start, { zone: timezone });
    const endDate = DateTime.fromISO(data.range.end, { zone: timezone });

    const formattedStartDate = startDate.toFormat('d בMMMM, yyyy', { locale: 'he' });
    const formattedEndDate = endDate.toFormat('d בMMMM, yyyy', { locale: 'he' });

    const shabbatStart = data.items.find((item) => item.category === 'candles');
    const shabbatEnd = data.items.find((item) => item.category === 'havdalah');
    const parashah = data.items.find((item) => item.category === 'parashat');

    const formattedShabbatStart = shabbatStart ? DateTime.fromISO(shabbatStart.date, { zone: timezone }).toFormat('HH:mm') : 'לא זמין';
    const formattedShabbatEnd = shabbatEnd ? DateTime.fromISO(shabbatEnd.date, { zone: timezone }).toFormat('HH:mm') : 'לא זמין';

    shabbatTimes.value = {
      startTime: formattedShabbatStart,
      startDate: formattedStartDate,
      endTime: formattedShabbatEnd,
      endDate: formattedEndDate,
      torahPortion: parashah ? parashah.hebrew : 'לא זמין',
    };
  } catch (error) {
    console.error('Error fetching Shabbat times:', error);
  }
}
</script>

<style scoped src="../weather-forecast/WeatherForecast.styles.scss"></style>
