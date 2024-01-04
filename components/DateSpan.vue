<script lang="ts" setup>
defineProps<{
  date: string;
}>();
</script>

<template>
  <span class="text-xs sm:text-sm">{{ new Date(date).toDateString() }}</span>
</template>
