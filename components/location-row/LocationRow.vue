<template>
  <div class="location-row">
    <div class="location-info">
      <div class="location-text">
        <h3 class="location-title">{{ title }}</h3>
        <p class="timezone-label">{{ offset }}</p>
      </div>
      <p class="location-time">{{ time.toFormat('HH:mm') }}</p>
    </div>
    <input
      type="range"
      min="0"
      max="47"
      step="1"
      class="slider"
      :value="timeInHours"
      @input="change"
      :style="{ background: meetingTimeGradient }"
      aria-label="מחוון זמן מקומי"
    />
  </div>
</template>

<script setup>
import {computed} from 'vue';
import {DateTime} from 'luxon';

const props = defineProps({
  type: String,
  title: String,
  timezone: String,
  time: Object,
});

const emit = defineEmits(['change']);

const change = (event) => {
  emit('change', event.target.value, props.type);
}

const timeInHours = computed(() => {
  return props.time.hour * 2 + (props.time.minute === 30 ? 1 : 0);
});

const formatOffset = (offset) => {
  const hours = offset / 60;
  const sign = hours >= 0 ? '+' : '-';
  return `UTC ${sign}${Math.abs(hours).toString().padStart(2, '0')}:00`;
};

const offset = computed(() => formatOffset(DateTime.now().setZone(props.timezone).offset));

const meetingTimeGradient = computed(() => {
  const morningStartPct = (6 / 24) * 100;
  const workStartPct = (9 / 24) * 100;
  const workEndPct = (18 / 24) * 100;
  const eveningEndPct = (21 / 24) * 100;

  const nightColor = '#FF4F64';
  const earlyLateColor = '#FFAB00';
  const workColor = '#00E28D';

  // Note the change here: `to right` becomes `to left` for RTL
  return `linear-gradient(to left,
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

<style scoped src="./LocationRow.styles.scss" />

