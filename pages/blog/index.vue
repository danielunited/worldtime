<template>
  <main>
    <!-- Only attempt to access articles if it's truthy -->
    <div v-if="articles" v-for="article in articles" :key="article.slug">
      <h2>{{ article.title }}</h2>
      <p>{{ article.description }}</p>
      <NuxtLink :to="article._path">Read more...</NuxtLink>
    </div>
    <p v-if="!articles || articles.length === 0">No articles found.</p>
  </main>
</template>

<script setup>
import { useAsyncData } from 'nuxt/app';

// Properly handle default values by checking the resolved data
const { data: articlesData } = useAsyncData('getArticles', () => queryContent('blog').find());

// Use a computed property to provide a default value if articlesData is null
const articles = computed(() => articlesData.value || []);
</script>
