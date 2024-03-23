<template>
  <div class="accordion">
    <div class="accordion-title" @click="toggle">
      <div class="title-container">
        <img v-if="icon" :src="icon" class="icon" />
        <div>{{ title }}</div>
      </div>
      <img src="/assets/chevron-down.svg" class="chevron" :class="{ 'is-open': isOpen }" />
    </div>
    <div class="accordion-content" v-if="isOpen">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  icon: String,
});

const isOpen = ref(false);

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
  padding: 10px;
}

.accordion-content > *:first-child {
  margin-top: 0;
}

.accordion-content > *:last-child {
  margin-bottom: 0;
}
</style>
