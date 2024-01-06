<script lang="ts" setup>
import type { Link, LinkQrConfig } from "~/model/api/link";
import LinkQrCodeConfigForm from "~/components/LinkQrCodeConfigForm.vue";

const props = defineProps<{ link: Link }>();
const emit = defineEmits<{
  (e: "updated", config: LinkQrConfig): void;
}>();

const isEditing = ref(false);
const qrConfigForm = reactive<LinkQrConfig>(props.link.qrConfig ?? {});

const updateQrConfig = async () => {
  isEditing.value = false;
  const response = await useFetchWithAuth(`/api/links/${props.link.key}`, {
    watch: false,
    method: "PUT",
    body: {
      qrConfig: qrConfigForm,
    } satisfies Partial<Link>,
  });
  if (!response.error.value) {
    emit("updated", qrConfigForm);
  }
};
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title mb-4">QR Code</h2>
      <div>
        <div class="md:flex justify-between gap-5 transition-all duration-200">
          <div class="md:w-1/2">
            <LinkQrCode
              :link="link"
              :qr-config="isEditing ? qrConfigForm : undefined"
            />
          </div>
          <div class="md:w-1/2">
            <div v-if="isEditing">
              <LinkQrCodeConfigForm v-model="qrConfigForm" />
              <div class="flex gap-4 mt-4">
                <button class="btn" @click="isEditing = false">Cancel</button>
                <button class="btn btn-primary" @click="updateQrConfig">
                  Save
                </button>
              </div>
            </div>
            <button v-else class="btn btn-primary" @click="isEditing = true">
              <svg
                width="800px"
                height="800px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 6L8 12V16H12L18 10M14 6L17 3L21 7L18 10M14 6L18 10M10 4L4 4L4 20L20 20V14"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
svg {
  height: 30px;
  width: 30px;
}
</style>
