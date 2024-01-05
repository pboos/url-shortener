<script lang="ts" setup>
import { isValidUrl } from "~/server/utils/url";

const url = defineModel<string>("url", { required: true });
const linkKey = defineModel<string>("linkKey", { required: true });

defineProps<{
  title: string;
  button: string;
  isSubmitting?: boolean;
  errors?: {
    url: string | null;
    key: string | null;
  };
}>();

const emit = defineEmits<{
  (e: "submit", link: { url: string; key: string | null }): void;
}>();

const isFormValid = computed(
  () =>
    url.value.length > 0 && isValidUrl(url.value) && linkKey.value.length >= 6,
);
</script>

<template>
  <form
    class="card bg-base-100 shadow-xl"
    @submit.prevent="emit('submit', { url, key: linkKey })"
  >
    <div class="card-body">
      <h2 class="card-title mb-4">{{ title }}</h2>
      <div
        class="flex flex-wrap sm:flex-nowrap justify-between items-middle gap-5"
      >
        <div class="form-group w-full sm:w-6/12">
          <label for="url" class="text-xs mb-1 block">Long URL</label>
          <input
            v-model="url"
            class="input input-bordered w-full max-w-xs block"
            for="url"
            type="text"
            placeholder="enter or paste long URL"
          />
          <span v-if="errors?.url" class="text-xs py-1 text-red-500">
            {{ errors?.url }}</span
          >
        </div>
        <div class="form-group w-full sm:w-4/12">
          <label for="key" class="text-xs mb-1 block">Short Key</label>
          <input
            v-model="linkKey"
            class="input input-bordered w-full max-w-xs block"
            for="key"
            type="text"
            placeholder="enter a key (optional)"
            min="6"
          />
          <span v-if="errors?.key" class="text-xs py-1 text-red-500">{{
            errors?.key
          }}</span>
        </div>
        <div class="w-full sm:w-2/12 flex self-end">
          <button
            type="submit"
            class="btn btn-primary flex items-center w-full max-w-xs transition-all duration-200"
            :disabled="!isFormValid || isSubmitting"
          >
            {{ button }}
          </button>
        </div>
      </div>
    </div>
  </form>
</template>
