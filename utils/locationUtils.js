export const getUserLocation = async() => {
  return await fetch('https://worldtimeapi.org/api/ip')
    .then((response) => response.json());
}
