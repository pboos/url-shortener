<script lang="ts" setup>
import type { LinkQrConfig } from "~/model/api/link";
import TextInput from "~/components/form/TextInput.vue";

const model = defineModel<LinkQrConfig>({ required: true });

const imageOptions = ref<NonNullable<Required<LinkQrConfig["imageOptions"]>>>({
  hideBackgroundDots: model.value.imageOptions?.hideBackgroundDots ?? true,
  imageSize: model.value.imageOptions?.imageSize ?? 0.4,
  margin: model.value.imageOptions?.margin ?? 0,
  crossOrigin: model.value.imageOptions?.crossOrigin ?? "use-credentials",
});

// imageOptions
watch(
  () => ({
    image: model.value.image,
    hideBackgroundDots: imageOptions.value.hideBackgroundDots,
    imageSize: imageOptions.value.imageSize,
    margin: imageOptions.value.margin,
  }),
  ({ image: newImage, hideBackgroundDots, imageSize, margin }) => {
    if (!newImage) {
      if (model.value.image === "") {
        model.value.image = undefined;
      }
      model.value.imageOptions = undefined;
      return;
    }
    const requiresCrossOrigin =
      newImage.startsWith("http") &&
      !newImage.startsWith(window.location.origin);
    if (
      !requiresCrossOrigin &&
      (hideBackgroundDots === undefined || hideBackgroundDots === true) &&
      (!imageSize || imageSize === 0.4) &&
      !margin
    ) {
      model.value.imageOptions = undefined;
      return;
    }

    model.value.imageOptions = {
      ...imageOptions.value,
      crossOrigin: requiresCrossOrigin ? "anonymous" : undefined,
    };
  },
);
</script>

<template>
  <div>
    <TextInput
      v-model="model.image"
      type="text"
      label="Logo image URL"
      placeholder="https://..."
    />
    <div class="form-control">
      <label class="label cursor-pointer justify-start gap-4">
        <input
          v-model="imageOptions.hideBackgroundDots"
          type="checkbox"
          class="checkbox"
        />
        <span class="label-text">Hide background dots</span>
      </label>
    </div>
    <TextInput
      v-model="imageOptions.imageSize"
      type="number"
      label="Image size"
      placeholder="0.4"
    />
    <TextInput
      v-model="imageOptions.margin"
      type="number"
      label="Margin"
      placeholder="0"
    />
  </div>
</template>

<style scoped></style>
