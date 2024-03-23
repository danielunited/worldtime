import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';

export function useTimezoneData() {
  const state = reactive({
    timezoneData: [],
    isLoading: false,
    error: null,
  });

  const fetchTimezoneData = async () => {
    state.isLoading = true;
    state.error = null;
    try {
      const response = await axios.get('https://worldtimeapi.org/api/timezone');
      state.timezoneData = response.data;
    } catch (error) {
      state.error = error;
    } finally {
      state.isLoading = false;
    }
  };

  const calculateTimeDifference = (timezone) => {
    const localTime = new Date();
    const targetTime = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
    const difference = targetTime.getTime() - localTime.getTime();
    return difference;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  onMounted(() => {
    fetchTimezoneData();
  });

  return {
    state,
    fetchTimezoneData,
    calculateTimeDifference,
    formatTime,
  };
}
