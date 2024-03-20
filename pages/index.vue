<template>
  <div class="rtl container">
    <span class="logo">Worldtime</span>
    <h1>השעה עכשיו ב...</h1>
    <div class="city-card-container">
      <div class="city-card" v-for="location in locations" :key="location.slug">
        <NuxtLink :to="`${location.type === 'city' ? '/city' : '/country'}/${location.slug}`">
          <div class="city-image" :style="`background-image: url(${location.image ? location.image.replace('w=2000', 'w=500').replace('q=80', 'q=50') : ''})`"></div>
          <h4>{{ location.name }}</h4>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
const locations = ref([]);

onMounted(async () => {
  locations.value = await $fetch('/data.json');
});

useHead({
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
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://worldtime.co.il/',
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
}
h1 {
  text-align: center;
  font-size: 40px;
  font-weight: 48px;
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
  padding: 20px;
}

.city-card h4 {
  margin: 10px;
}
</style>
