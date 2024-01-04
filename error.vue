<script setup lang="ts">
const error = useError();

const handleError = () => clearError({ redirect: "/" });
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold underline">{{ error.statusCode }}</h2>
    <button @click="handleError">Clear errors</button>
  </div>
</template>
