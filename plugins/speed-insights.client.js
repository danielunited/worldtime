export default defineNuxtPlugin((nuxtApp) => {
  const scriptUrl = '/_vercel/speed-insights/script.js';
  useHead({
    script: [
      {
        src: scriptUrl,
        async: true,
      },
    ],
  });
});
