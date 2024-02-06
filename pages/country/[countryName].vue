<script setup>
import TimeConverter from '../../components/TimeConverter.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const slug = route.params.countryName;
</script>

<template>
  <TimeConverter :entitySlug="slug" entityType="country" />
</template>
