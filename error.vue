<script setup lang="ts">
const error = useError();

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold underline">
      {{ error.statusCode }}
    </h1>
    <button @click="handleError">Clear errors</button>
  </div>
</template>
