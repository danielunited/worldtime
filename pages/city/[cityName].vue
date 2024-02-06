<script setup>
import { useRoute } from 'vue-router';
import TimeConverter from '../../components/TimeConverter.vue';

const route = useRoute();
const slug = route.params.cityName;
</script>

<template>
  <TimeConverter :entitySlug="slug" entityType="city" />
</template>
