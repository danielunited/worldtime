export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/sitemap', '@nuxtjs/tailwindcss', '@nuxtjs/robots', '@nuxt/content'],
  site: {
    url: 'https://worldtime.co.il',
  },
  sitemap: {
    sources: ['/api/sitemap'],
  },
  content: {
    sources: {
      blog: {
        driver: 'fs',
        base: 'content/blog',
      },
    },
  },
});
