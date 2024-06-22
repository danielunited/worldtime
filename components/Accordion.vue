<template>
  <div class="accordion">
    <template v-if="isLink">
      <a class="accordion-title link" :href="siteUrl" tabindex="0">
        <div class="title-container">
          <img v-if="icon" :src="icon" class="icon" />
          <h2>{{ title }}</h2>
        </div>
        <img src="/assets/chevron-left.svg" class="chevron" />
      </a>
    </template>
    <template v-else>
      <div class="accordion-title" @click="toggle" tabindex="0" @keyup.enter="toggle" @keyup.space.prevent="toggle">
        <div class="title-container">
          <img v-if="icon" :src="icon" class="icon" />
          <h2>{{ title }}</h2>
        </div>
        <img src="/assets/chevron-down.svg" class="chevron" :class="{ 'is-open': isOpen }" />
      </div>
      <div v-if="isOpen" class="accordion-content">
        <slot></slot>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useRuntimeConfig } from '#app';

const props = defineProps({
  title: String,
  icon: String,
  isLink: Boolean,
});

const isOpen = ref(false);
const config = useRuntimeConfig();
const siteUrl = config.public.siteUrl;

function toggle() {
  isOpen.value = !isOpen.value;
}
</script>

<style scoped>
.accordion-title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  font-weight: 600;
  font-size: 16px;
}

.accordion-title.link {
  text-decoration: none;
}

.title-container {
  display: flex;
  align-items: center;
}

.icon {
  margin-left: 8px;
  width: 24px;
  height: 24px;
}

.chevron.is-open {
  transform: rotate(180deg);
}

.accordion-content {
  padding-top: 10px;
}

.accordion-content > *:first-child {
  margin-top: 0;
}

.accordion-content > *:last-child {
  margin-bottom: 0;
}
</style>
