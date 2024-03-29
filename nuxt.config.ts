export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/sitemap',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/robots',
    '~/server/middleware/timezoneFetcher',
  ],
  site: {
    url: 'https://worldtime.co.il',
  },
  sitemap: {
    sources: ['/api/sitemap'],
  },
});
