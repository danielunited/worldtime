import {DateTime} from 'luxon';
import {getUserLocation} from '~/utils/locationUtils.js';

export const getUserTimezone = async() => {
  const location = await getUserLocation();

  return location.timezone ||  'Asia/Jerusalem';
}

export const getLocationTime = (timezone, value) => {
  const currentTime = DateTime.now().setZone(timezone);
  if(!value) {
    return currentTime;
  }

  // Calculate the hour and minute based on the slider value
  const hour = Math.floor(value / 2);
  const minute = (value % 2) * 30;

  return currentTime.set({hour, minute});
}
