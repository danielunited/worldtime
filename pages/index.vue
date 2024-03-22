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
          <h4>{{ location.name }}</h4>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import locationData from '/public/data.json';

const searchQuery = ref(''); // Reactive variable for search input
const locations = ref(locationData); // Original locations array

// Computed property for filtered locations
const filteredLocations = computed(() => {
  if (!searchQuery.value) {
    return locations.value; // Return all locations if searchQuery is empty
  }
  return locations.value.filter((location) => location.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

useHead({
  htmlAttrs: {
    lang: 'he',
  },
  title: 'Worldtime | מחשבון המרת זמן בינלאומי | מה השעה בערים שונות בעולם',
  meta: [
    {
      hid: 'description',
      name: 'description',
      content: 'מצא/י את הפרשי זמנים בין ערים שונות בעולם וההפרש ביחס לישראל, כולל זמני פגישות בוחים גם לשעון כאן בארץ.',
    },
    {
      hid: 'og:title',
      property: 'og:title',
      content: 'Worldtime | מחשבון המרת זמן בינלאומי | מה השעה בערים שונות בעולם',
    },
    {
      hid: 'og:description',
      property: 'og:description',
      content: 'השווה/י הפרשי זמנים עם כלי אונליין חינמי להמרת הזמן בין ערים שונות כמו ניו יורק, לונדון ופריז ביחס לישראל.',
    },
    {
      property: 'og:url',
      content: `https://worldtime.co.il`,
    },
  ],
});
</script>

<style scoped>
.rtl {
  direction: rtl;
  text-align: right;
}

.logo {
  color: #737373;
  font-weight: 600;
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  margin: auto;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 48px;
  margin: auto;
  /* background-image: radial-gradient(at 40% 20%, rgba(255, 184, 122, 0.558) 0, transparent 40%), radial-gradient(at 80% 0, rgba(31, 221, 255, 0.725) 0, transparent 30%),
    radial-gradient(at 0 50%, #ffdbde 0, transparent 40%), radial-gradient(at 68% 50%, rgba(255, 133, 174, 0.583) 0, transparent 40%), radial-gradient(at 0 100%, #fff 0, transparent 40%),
    radial-gradient(at 80% 100%, #fff 0, transparent 40%), radial-gradient(at 0 0, rgba(255, 202, 217, 0.738) 0, transparent 40%); */
  /* background-color: #fff; */
  max-width: 1080px;
  padding-left: 20px;
  padding-right: 20px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.search-input {
  max-width: 1020px;
  width: 100%;
  background-color: white;
  border: 1px solid #d7d7d7;
  border-radius: 8px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  min-height: 40px;
  padding-left: 15px;
  padding-right: 15px;
  margin: auto;
}
h1 {
  text-align: center;
  font-size: 40px;
  line-height: 48px;
  font-weight: 700;
  margin-top: -2px;
  margin-bottom: 24px;
}

h4 {
  font-weight: 600;
}
.city-card {
  background-color: #f3f5f9;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  border-radius: 5px;
  text-align: right;
  width: 240px;
  margin: 10px;
  @media (max-width: 768px) {
    width: 100%; /* 100% width on devices <= 768px */
    margin: 10px 0; /* Adjust margin as needed for mobile */
  }
}

.city-image {
  height: 150px;
  background-color: #ccc;
  background-size: cover;
  background-position: center;
  border-radius: 5px 5px 0 0;
}

.city-card-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
}

.city-card h4 {
  margin: 10px;
}
</style>
