<script lang="ts" setup>
import { nanoid } from "nanoid";

const emits = defineEmits(["created"]);

const url = ref<string>("");
const key = ref<string>("");
const isSubmitting = ref<boolean>(false);

const errors = ref<{
  url: string | null;
  key: string | null;
}>({ url: null, key: null });

onMounted(() => (key.value = nanoid(6)));

const createLink = async () => {
  const body: { url: string; key?: string } = { url: url.value };
  if (key.value) {
    body.key = key.value;
  }

  isSubmitting.value = true;

  try {
    const response = await useFetchWithAuth("/api/links", {
      method: "POST",
      body,
    });
    if (!response.error.value) {
      url.value = "";
      key.value = nanoid(6);
      emits("created");
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <LinkForm
    v-model:url="url"
    v-model:link-key="key"
    title="Create Link"
    button="Shorten"
    :errors="errors"
    :is-submitting="isSubmitting"
    @submit="createLink"
  />
</template>
