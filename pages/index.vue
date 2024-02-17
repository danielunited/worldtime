<template>
  <div class="rtl container">
    <span class="logo">Worldtime</span>
    <h1>השעה עכשיו ב</h1>
    <div class="city-card-container">
      <div class="city-card" v-for="city in cities" :key="city.slug">
        <NuxtLink :to="`/city/${city.slug}`">
          <div class="city-image" :style="city.image ? `background-image: url(${city.image})` : ''"></div>
          <h4>{{ city.name }}</h4>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
const cities = ref([]);

onMounted(async () => {
  cities.value = await $fetch('/data.json');
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
  height: 150px; /* Adjust based on your design */
  background-color: #ccc; /* Gray background */
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
