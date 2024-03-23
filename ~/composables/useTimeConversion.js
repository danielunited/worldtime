import { ref, computed } from 'vue';

export function useTimeConversion() {
  const currentTime = ref(new Date());

  // Function to convert the current time to a different timezone
  const convertTimezone = (timezoneOffset) => {
    const localTime = currentTime.value.getTime();
    const localOffset = currentTime.value.getTimezoneOffset() * 60000;
    const utc = localTime + localOffset;
    const targetTime = new Date(utc + (3600000 * timezoneOffset));
    return targetTime;
  };

  // Function to format the time for display
  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Computed property to get the current time in a formatted string
  const formattedCurrentTime = computed(() => formatTime(currentTime.value));

  return {
    currentTime,
    convertTimezone,
    formatTime,
    formattedCurrentTime
  };
}
