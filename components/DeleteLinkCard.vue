<script lang="ts" setup>
import type { Link } from "~/model/api/link";

const props = defineProps<{
  link: Link;
}>();

const deleteLink = async () => {
  const response = await useFetchWithAuth(`/api/links/${props.link.key}`, {
    method: "DELETE",
  });
  if (!response.error.value) {
    navigateTo("/admin");
  }
};
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Delete Link</h2>
      <div class="flex justify-between gap-5 transition-all duration-200">
        <div class="w-1/2">
          <div class="text-xs sm:text-base">
            Delete the link by clicking on the button. This can not be undone.
          </div>
        </div>
        <div class="w-1/2 flex justify-end">
          <button
            class="btn btn-warning items-center w-full max-w-48 transition-all duration-200"
            @click="deleteLink"
          >
            Delete Link
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
