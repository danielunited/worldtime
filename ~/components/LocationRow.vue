<template>
  <div class="location-row">
    <div class="location-info">
      <div class="location-text">
        <h3 class="location-title">{{ title }}</h3>
        <p class="timezone-label">{{ timezoneOffset }}</p>
      </div>
      <p class="location-time">{{ formattedTime }}</p>
    </div>
    <input
      type="range"
      :min="sliderMin"
      :max="sliderMax"
      :step="sliderStep"
      class="slider"
      v-model="sliderModelValue"
      @input="onSliderInput"
      :aria-label="'מחוון זמן ל' + title"
    />
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  title: String,
  timezoneOffset: String,
  formattedTime: String,
  sliderMin: {
    type: Number,
    default: 0,
  },
  sliderMax: {
    type: Number,
    default: 47,
  },
  sliderStep: {
    type: Number,
    default: 1,
  },
  sliderModelValue: Number,
  onSliderInput: Function,
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
  font-size: 1rem;
  margin: 0;
}

.timezone-label, .location-time {
  font-size: 0.875rem;
  margin: 0;
}

.slider {
  margin-left: 1rem;
}
</style>
