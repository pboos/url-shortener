<script lang="ts" setup>
import type { Link } from "~/model/api/link";
import type { LinkQrConfig } from "~/server/db/model/LinkQrConfig";

const props = defineProps<{ link: Link; qrConfig?: LinkQrConfig }>();
const shortUrl = useLinkShortUrl(props.link);

const defaultDotsOptions: LinkQrConfig["dotsOptions"] = {
  type: "square",
  color: "#000000",
};
const defaultBackgroundOptions: LinkQrConfig["backgroundOptions"] = {
  color: "#ffffff",
};
const defaultCornersSquareOptions: LinkQrConfig["cornersSquareOptions"] = {
  type: "square",
  color: "#000000",
};
const defaultCornersDotOptions: LinkQrConfig["cornersDotOptions"] = {
  type: undefined,
  color: "#000000",
};
const defaultQrConfig: LinkQrConfig = {
  image: undefined,
  imageOptions: undefined,
  dotsOptions: defaultDotsOptions,
  backgroundOptions: defaultBackgroundOptions,
  cornersSquareOptions: defaultCornersSquareOptions,
  cornersDotOptions: defaultCornersDotOptions,
};
const qrConfig = props.qrConfig ?? props.link.qrConfig ?? defaultQrConfig;
</script>

<template>
  <ClientOnly>
    <QRCodeVue3
      v-if="shortUrl"
      :value="shortUrl"
      :width="300"
      :height="300"
      :image="qrConfig.image"
      :qr-options="
        qrConfig.image
          ? { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' }
          : undefined
      "
      :image-options="qrConfig.imageOptions"
      :dots-options="qrConfig.dotsOptions ?? defaultDotsOptions"
      :background-options="
        qrConfig.backgroundOptions ?? defaultBackgroundOptions
      "
      :corners-square-options="
        qrConfig.cornersSquareOptions ?? defaultCornersSquareOptions
      "
      :corners-dot-options="
        qrConfig.cornersDotOptions ?? defaultCornersDotOptions
      "
    />
  </ClientOnly>
</template>
