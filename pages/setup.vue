<script setup lang="ts">
import {useFetchWithAuth} from "~/composables/fetch-with-auth";

const getIsSetup = async () => {
  try {
    return await useFetchWithAuth('/api/setup');
  } catch(e) {
    console.log('e', e);
  }
};

const isSetupResponse = await getIsSetup();
if (isSetupResponse?.data?.value?.isSetup) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    data: {
      myCustomField: true
    }
  });
}

const createUser = () => {
  useFetch('/api/setup', {
    method: 'POST',
    body: JSON.stringify({
      username: 'admin',
      password: 'admin',
    }),
  });
};
</script>

<template>
  <div>
    SETUP
    <button class="btn btn-primary" @click="createUser()">SETUP</button>
  </div>
</template>
