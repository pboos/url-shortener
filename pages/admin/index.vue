<script setup lang="ts">
const isAuthenticated = useIsAuthenticated();

if (!isAuthenticated.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
    data: {
      myCustomField: true,
    },
  });
}

const createLink = async () => {
  await useFetchWithAuth("/api/links", {
    method: "POST",
    body: JSON.stringify({
      key: "google",
      url: "https://google.com",
    }),
  });
};
</script>

<template>
  <div>
    MAIN SITE
    {{ isAuthenticated ? "authenticated" : "not authenticated" }}
    <div>
      <button class="btn btn-primary" @click="createLink">Create Link</button>
    </div>
  </div>
</template>
