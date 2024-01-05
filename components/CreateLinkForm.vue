<script lang="ts" setup>
import { isValidUrl } from "~/server/utils/url";

const emits = defineEmits(["created"]);

const isLoading = ref<boolean>(false);
const form = ref<{
  url: string;
  key: string | null;
}>({ url: "", key: null });

const errors = ref<{
  url: string | null;
  key: string | null;
}>({ url: null, key: null });

const toggleKey = () => {
  form.value.key = form.value.key === null ? "" : null;
};

const createLink = async () => {
  const body: { url: string; key?: string } = { url: form.value.url };
  if (form.value.key) {
    body.key = form.value.key;
  }

  isLoading.value = true;

  try {
    const response = await useFetchWithAuth("/api/links", {
      method: "POST",
      body,
    });
    if (!response.error.value) {
      form.value.url = "";
      form.value.key = null;
    }
  } finally {
    isLoading.value = false;
  }

  emits("created");
};

const isKeyValid = computed(
  () => form.value.key === null || form.value.key.length >= 6,
);
const isFormValid = computed(
  () =>
    form.value.url.length > 0 && isValidUrl(form.value.url) && isKeyValid.value,
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
            type="checkbox"
            :checked="form.key !== null"
            @change="toggleKey"
          />
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
        <div class="w-full sm:w-2/12 flex justify-end self-end">
          <button
            type="submit"
            class="btn btn-primary flex items-center w-full transition-all duration-200"
            :disabled="!isFormValid"
          >
            <template v-if="isLoading">
              <svg
                class="animate-spin h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </template>
            <template v-else>
              Shorten
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                />
              </svg>
            </template>
          </button>
        </div>
      </div>
    </div>
  </form>
</template>
