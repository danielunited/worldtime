<template>
  <div class="accordion">
    <div class="accordion-title" @click="toggle">
      <h2>{{ title }}</h2>
    </div>
    <div class="accordion-content" v-if="isOpen">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
});

const isOpen = ref(false);

function toggle() {
  isOpen.value = !isOpen.value;
}
</script>

<style scoped>
.accordion-title h2 {
  cursor: pointer;
  user-select: none;
}

.accordion-content {
  padding: 10px;
  border-top: 1px solid #ccc;
}
</style>
