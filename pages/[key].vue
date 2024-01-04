<script lang="ts" setup>
const { key: urlKey } = useRoute().params;

const linkResponse = await useFetch(`/api/links/${urlKey}`);

const linkData = computed(() => {
  try {
    if (linkResponse.error.value) {
      return null;
    }
    return linkResponse.data.value;
  } catch (e) {
    console.error(e);
    return null;
  }
});

if (linkData.value) {
  await useFetch(`/api/links/${urlKey}/track`, { method: "POST" });
  navigateTo(linkData.value.url, { external: true });
} else {
  throw createError({ statusCode: 404 });
}
</script>

<template>
  <div class="grid place-content-center h-screen">Redirecting...</div>
</template>
