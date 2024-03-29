<template>
  <Accordion :title="shabbatTitle">
    <div v-if="shabbatTimes" class="description">
      <p>{{ shabbatTimes.dateGregorian }}</p>
      <p>{{ shabbatTimes.start }}</p>
      <p>{{ shabbatTimes.end }}</p>
      <p>{{ shabbatTimes.torahPortion }}</p>
    </div>
    <p v-else>זמני שבת ופרשת השבוע אינם זמינים כעת.</p>
  </Accordion>
</template>

<script setup>
import {computed, onBeforeMount, ref, watch} from 'vue';
import {DateTime} from 'luxon';

const shabbatTimes = ref(null);

const {entityInfo, entityType} = defineProps({
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
})

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
    const startDate = DateTime.fromISO(data.range.start, { zone: timezone });
    const endDate = DateTime.fromISO(data.range.end, { zone: timezone });

    const formattedStartDate = startDate.toFormat('d לMMMM, yyyy', { locale: 'he' });
    const formattedEndDate = endDate.toFormat('d לMMMM, yyyy', { locale: 'he' });

    const shabbatStart = data.items.find((item) => item.category === 'candles');
    const shabbatEnd = data.items.find((item) => item.category === 'havdalah');
    const parashah = data.items.find((item) => item.category === 'parashat');

    const formattedShabbatStart = DateTime.fromISO(shabbatStart.date, { zone: timezone }).toFormat('HH:mm');
    const formattedShabbatEnd = DateTime.fromISO(shabbatEnd.date, { zone: timezone }).toFormat('HH:mm');

    shabbatTimes.value = {
      start: `כניסת שבת: ${formattedShabbatStart} (${formattedStartDate})`,
      end: `יציאת שבת: ${formattedShabbatEnd} (${formattedEndDate})`,
      torahPortion: `פרשת השבוע: ${parashah ? parashah.hebrew : 'N/A'}`,
    };
  } catch (error) {
    console.error('Error fetching Shabbat times:', error);
  }
}
</script>
