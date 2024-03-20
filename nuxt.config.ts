export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/sitemap', '@nuxtjs/tailwindcss'],
  site: {
    url: 'https://worldtime.co.il',
  },
  sitemap: {
    sources: ['/api/sitemap'],
  },
});
