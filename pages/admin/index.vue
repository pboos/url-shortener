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

const {data: links} = await useFetchWithAuth("/api/links");

</script>

<template>
  <div>
    MAIN SITE
    {{ isAuthenticated ? "authenticated" : "not authenticated" }}
    <div>
      <button class="btn btn-primary" @click="createLink">Create Link</button>
      <div v-for="test in links">
        {{test.key}}
      </div>
    </div>
  </div>
</template>
