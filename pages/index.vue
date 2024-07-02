<template>
  <div class="rtl container">
    <span class="logo">Worldtime</span>
    <h1>השעה עכשיו ב...</h1>
    <label for="search" class="sr-only">חפש עיר או מדינה</label>
    <input v-model="searchQuery" type="text" placeholder="חפש עיר או מדינה..." class="search-input" autofocus />

    <div class="city-card-container">
      <div class="city-card" v-for="location in filteredLocations" :key="location.slug">
        <NuxtLink :to="`${location.type === 'city' ? '/city' : '/country'}/${location.slug}`">
          <div class="city-image" :style="`background-image: url(${location.image ? location.image.replace('w=2000', 'w=500').replace('q=80', 'q=50') : ''})`"></div>
          <h4>
            {{ location.name }}<span v-if="location.country">, {{ location.country }}</span>
          </h4>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import locationData from '/public/data.json';

const searchQuery = ref('');
const locations = ref(locationData);

const filteredLocations = computed(() => {
  if (!searchQuery.value.trim()) {
    return locations.value.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name, 'he');
      }
      return a.type === 'country' ? -1 : 1;
    });
  }
  const queryLower = searchQuery.value.toLowerCase().trim();
  const filtered = locations.value.filter((location) => {
    const nameMatch = location.name && typeof location.name === 'string' && location.name.toLowerCase().includes(queryLower);
    const countryMatch = location.country && typeof location.country === 'string' && location.country.toLowerCase().includes(queryLower);
    const slugMatch = location.slug && typeof location.slug === 'string' && location.slug.toLowerCase().includes(queryLower);
    return nameMatch || countryMatch || slugMatch;
  });

  return filtered.sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name, 'he');
    }
    return a.type === 'country' ? -1 : 1;
  });
});

useHead({
  htmlAttrs: {
    lang: 'he',
  },
  title: 'Worldtime  | 🗺️ מחשבון המרת זמן בינלאומי | מה השעה בערים שונות בעולם ',
  meta: [
    {
      hid: 'description',
      name: 'description',
      content: 'מצאו את השעה בערים ומדינות ברחבי העולם והפרש השעות בינן לבין ישראל. נסו את הכלי החינמי שלנו כדי לדעת את השעה, מזג האוויר וזמני כניסת השבת ביעד.  🕒',
    },
    {
      hid: 'og:title',
      property: 'og:title',
      content: 'Worldtime  | 🗺️ מחשבון המרת זמן בינלאומי | מה השעה בערים שונות בעולם ',
    },
    {
      hid: 'og:description',
      property: 'og:description',
      content: 'מצאו את השעה בערים ומדינות ברחבי העולם והפרש השעות בינן לבין ישראל - כולל לונדון, פריז, ניו יורק, יוון עוד. 🕒',
    },
    {
      property: 'og:image',
      content: '/cover.jpg',
    },
    {
      property: 'og:url',
      content: `https://worldtime.co.il`,
    },
  ],
});
</script>

<style scoped src="./index.styles.scss" />
