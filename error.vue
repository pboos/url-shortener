<script setup lang="ts">
defineProps({
  error: Object,
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <h2 class="text-9xl">{{ error?.statusCode }}</h2>
  </div>
</template>
