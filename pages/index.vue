<template>
  <div class="rtl">
    <h1 class="page-title">מה השעה ב...</h1>
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
</script>

<style scoped>
.rtl {
  direction: rtl; /* Ensures text and layout flow right-to-left */
  text-align: right; /* Aligns text to the right */
}
.page-title {
  text-align: center;
  margin-top: 20px;
  margin-bottom: 40px; /* Adjust spacing as needed */
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
