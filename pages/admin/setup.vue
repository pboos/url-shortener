<script setup lang="ts">
import type { GetSetupResponse } from "~/model/api/response/GetSetupResponse";

const getIsSetup = async () => {
  try {
    return await useFetchWithAuth<GetSetupResponse>("/api/setup");
  } catch (e) {
    console.error("e", e);
  }
};

const isSetupResponse = await getIsSetup();
if (isSetupResponse?.data?.value?.isSetup) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
    data: {
      myCustomField: true,
    },
  });
}

const setup = () => {
  useFetch("/api/setup", {
    method: "POST",
    body: JSON.stringify({
      username: "admin",
      password: "admin",
    }),
  });
};
</script>

<template>
  <div>
    SETUP
    <button class="btn btn-primary" @click="setup()">SETUP</button>
  </div>
</template>
