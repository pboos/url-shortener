<script setup lang="ts">
import {useIsAuthenticated} from "~/composables/is-authenticated";

const isAuthenticated = useIsAuthenticated();

if (!isAuthenticated.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    data: {
      myCustomField: true
    }
  });
}
</script>

<template>
  <div>
    MAIN SITE
    {{ isAuthenticated ? 'authenticated' : 'not authenticated' }}
  </div>
</template>
