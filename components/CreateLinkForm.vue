<script lang="ts" setup>
import { nanoid } from "nanoid";
import { isValidUrl } from "~/server/utils/url";

const emits = defineEmits(["created"]);

const isSubmitting = ref<boolean>(false);
const form = ref<{
  url: string;
  key: string;
}>({ url: "", key: "" });

const errors = ref<{
  url: string | null;
  key: string | null;
}>({ url: null, key: null });

onMounted(() => {
  form.value.key = nanoid(6);
});

const createLink = async () => {
  const body: { url: string; key?: string } = { url: form.value.url };
  if (form.value.key) {
    body.key = form.value.key;
  }

  isSubmitting.value = true;

  try {
    const response = await useFetchWithAuth("/api/links", {
      method: "POST",
      body,
    });
    if (!response.error.value) {
      form.value.url = "";
      form.value.key = nanoid(6);
    }
  } finally {
    isSubmitting.value = false;
  }

  emits("created");
};

const isFormValid = computed(
  () =>
    form.value.url.length > 0 &&
    isValidUrl(form.value.url) &&
    form.value.key.length >= 6,
);
</script>

<template>
  <form class="card bg-base-100 shadow-xl" @submit.prevent="createLink">
    <div class="card-body">
      <h2 class="card-title mb-4">Create Link</h2>
      <div
        class="flex flex-wrap sm:flex-nowrap justify-between items-middle gap-5"
      >
        <div class="form-group w-full sm:w-6/12">
          <label for="url" class="text-xs mb-1 block">Long URL</label>
          <input
            v-model="form.url"
            class="input input-bordered w-full max-w-xs block"
            for="url"
            type="text"
            placeholder="enter or paste long URL"
          />
          <span v-if="errors.url" class="text-xs py-1 text-red-500">
            {{ errors.url }}</span
          >
        </div>
        <div class="form-group w-full sm:w-4/12">
          <label for="key" class="text-xs mb-1 block">Short Key</label>
          <input
            v-model="form.key"
            class="input input-bordered w-full max-w-xs block"
            for="key"
            type="text"
            placeholder="enter a key (optional)"
            min="6"
          />
          <span v-if="errors.key" class="text-xs py-1 text-red-500">{{
            errors.key
          }}</span>
        </div>
        <div class="w-full sm:w-2/12 flex self-end">
          <button
            type="submit"
            class="btn btn-primary flex items-center w-full max-w-xs transition-all duration-200"
            :disabled="!isFormValid || isSubmitting"
          >
            Shorten
          </button>
        </div>
      </div>
    </div>
  </form>
</template>
