<script setup lang="ts">
defineProps({
  error: Object,
});

const handleError = () => clearError({ redirect: "/" });
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold underline">{{ error?.statusCode }}</h2>
    <button @click="handleError">Clear errors</button>
    {{ error }}
  </div>
</template>
