// ~/utils/timeUtils.js

/**
 * Formats a time offset from minutes into a string representation.
 * @param {number} offset - The time offset in minutes.
 * @returns {string} A formatted string representing the time offset.
 */
function formatOffset(offset) {
  // Determine the sign of the offset
  const sign = offset < 0 ? '-' : '+';
  
  // Convert the absolute offset to hours and minutes
  const absoluteOffset = Math.abs(offset);
  const hours = Math.floor(absoluteOffset / 60);
  const minutes = absoluteOffset % 60;
  
  // Format the hours and minutes with leading zeros if necessary
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  
  // Combine the sign, hours, and minutes into the final formatted string
  return `${sign}${formattedHours}:${formattedMinutes}`;
}

// Export the formatOffset function for use in other parts of the application
export { formatOffset };
