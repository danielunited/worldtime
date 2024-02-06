<script setup>
import { useRoute } from 'vue-router';
import TimeConverter from '../../components/TimeConverter.vue';

const route = useRoute();
const slug = route.params.countryName;
</script>

<template>
  <TimeConverter :entitySlug="slug" entityType="country" />
</template>
