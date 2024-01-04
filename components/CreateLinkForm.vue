<script lang="ts" setup>
const emits = defineEmits(["created"]);

const createLink = async () => {
  await useFetchWithAuth("/api/links", {
    method: "POST",
    body: JSON.stringify({
      key: "google",
      url: "https://google.com",
    }),
  });

  emits("created");
};
</script>

<template>
  <div>
    <div>
      <button class="btn btn-primary" @click="createLink">Create Link</button>
    </div>
  </div>
</template>
