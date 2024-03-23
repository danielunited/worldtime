<template>
  <div class="location-row">
    <div class="location-info">
      <div class="location-text">
        <h3 class="location-title">{{ name }}</h3>
        <p class="timezone-label">{{ timezone }}</p>
      </div>
      <p class="location-time">{{ formattedTime }}</p>
    </div>
    <input
      type="range"
      min="0"
      max="47"
      step="1"
      class="slider"
      v-model="sliderValue"
      @input="emitSliderChange"
      :style="{ background: sliderBackground }"
      aria-label="Adjust time slider"
    />
  </div>
</template>

<script setup>
import { ref, computed, defineProps, emit } from 'vue';

const props = defineProps({
  name: String,
  timezone: String,
  formattedTime: String,
});

const sliderValue = ref(0);

const emitSliderChange = () => {
  emit('slider-change', sliderValue.value);
};

const sliderBackground = computed(() => {
  // Assuming a similar logic for the slider background as in the TimeConverter component
  const morningStartPct = (6 / 24) * 100;
  const workStartPct = (9 / 24) * 100;
  const workEndPct = (18 / 24) * 100;
  const eveningEndPct = (21 / 24) * 100;

  const nightColor = '#FF4F64';
  const earlyLateColor = '#FFAB00';
  const workColor = '#00E28D';

  return `linear-gradient(to right,
      ${nightColor} 0%,
      ${nightColor} ${morningStartPct}%,
      ${earlyLateColor} ${morningStartPct}%,
      ${earlyLateColor} ${workStartPct}%,
      ${workColor} ${workStartPct}%,
      ${workColor} ${workEndPct}%,
      ${earlyLateColor} ${workEndPct}%,
      ${earlyLateColor} ${eveningEndPct}%,
      ${nightColor} ${eveningEndPct}%,
      ${nightColor} 100%)`;
});
</script>

<style scoped>
.location-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.location-info {
  display: flex;
  flex-direction: column;
}

.location-text {
  display: flex;
  flex-direction: column;
}

.location-title {
  font-size: 16px;
  font-weight: bold;
}

.timezone-label {
  font-size: 14px;
}

.location-time {
  font-size: 16px;
  font-weight: bold;
}

.slider {
  width: 100%;
  margin-left: 20px;
}
</style>
