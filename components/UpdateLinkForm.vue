<script lang="ts" setup>
import type { Link } from "~/model/api/link";

const emit = defineEmits<{
  (e: "updated", link: Link): void;
}>();

const props = defineProps<{ link: Link }>();
const url = ref<string>(props.link.url);
const key = ref<string>(props.link.key);
const isSubmitting = ref<boolean>(false);

const errors = ref<{
  url: string | null;
  key: string | null;
}>({ url: null, key: null });

const updateLink = async () => {
  const body: { url: string; key?: string } = { url: url.value };
  if (key.value) {
    body.key = key.value;
  }

  isSubmitting.value = true;

  try {
    const response = await useFetchWithAuth(`/api/links/${props.link.key}`, {
      method: "PUT",
      body,
    });
    if (!response.error.value) {
      emit("updated", { ...props.link, url: url.value, key: key.value });
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
    title="Update Link"
    button="Save"
    :errors="errors"
    :is-submitting="isSubmitting"
    @submit="updateLink"
  />
</template>
