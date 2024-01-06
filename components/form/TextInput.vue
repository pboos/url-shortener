<script lang="ts" setup>
const model = defineModel<string | number | undefined | null>({
  required: true,
});

defineProps<{
  label?: string;
  placeholder?: string;
  type?: "text" | "password" | "email" | "number" | "url" | "tel";
}>();
</script>
<template>
  <div class="form-control w-full max-w-xs">
    <div v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
    </div>
    <input
      v-model="model"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      class="input input-bordered w-full max-w-xs"
    />
  </div>
</template>
