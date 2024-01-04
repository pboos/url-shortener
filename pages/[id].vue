<script lang="ts" setup>
const params = useRoute().params;
const urlKey = params.id;

const linkData = await useAsyncData(async () => {
  try {
    const response = await useFetch(`/api/links/${urlKey}`);
    if (response.error.value) {
      return null;
    }
    return response.data.value;
  } catch (e) {
    console.error(e);
    return null;
  }
});

if (linkData.data.value) {
  await useFetch(`/api/links/${urlKey}/track`, { method: "POST" });
  navigateTo(linkData.data.value.url, { external: true });
} else {
  throw createError({ statusCode: 404 });
}
</script>

<template>
  <div class="grid place-content-center h-screen">Redirecting...</div>
</template>
