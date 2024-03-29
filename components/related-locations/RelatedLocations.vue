<template>
  <div class="related-locations-bar">
    <span class="related-locations-span">ייעדים קרובים:</span>
    <ul class="related-locations-container">
      <li v-for="location in relatedLocations" :key="location.slug" class="related-location-item">
        <NuxtLink :to="`/${location.type === 'city' ? 'city' : 'country'}/${location.slug}`"> {{ location.name }} </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { default as locationData } from '../../public/data.json';

const props = defineProps({
  entitySlug: String,
  entityType: String,
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

const { data: relatedLocations } = useAsyncData('relatedLocations', () => findRelatedLocations(props.entitySlug, props.entityType));

async function findRelatedLocations(entitySlug, entityType) {
  const entityInfo = locationData.find((c) => c.slug === entitySlug && c.type === entityType);

  if (!entityInfo || !entityInfo.lat || !entityInfo.lon) {
    return [];
  }

  return locationData
    .filter((c) => c.slug !== entitySlug)
    .map((location) => {
      const distance = calculateDistance(entityInfo.lat, entityInfo.lon, location.lat, location.lon);
      return { ...location, distance: Math.round(distance) };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 15);
}
</script>

<style scoped src="./RelatedLocations.styles.scss" />
