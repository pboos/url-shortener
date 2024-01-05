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

useHead({
  title: "Setup",
});

const form = ref<{
  username: string;
  password: string;
}>({
  username: "",
  password: "",
});

const err = ref<string | null>(null);
const isLoading = ref(false);

const handleSetup = async () => {
  isLoading.value = true;
  try {
    const response = await useFetch("/api/setup", {
      method: "POST",
      body: {
        username: form.value.username,
        password: form.value.password,
      },
    });
    if (response.error.value) {
      err.value = "Setup failed";
    }
    if (response.data.value) {
      navigateTo("/admin/login");
    }
  } catch (e) {
  } finally {
    isLoading.value = false;
  }
};

const isFormValid = computed(
  () => form.value.username.length > 0 && form.value.password.length > 0,
);
</script>

<template>
  <div class="card w-full md:w-96 bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Setup</h2>
      <div class="my-2">
        Setup your server by setting a username and password for your login.
      </div>
      <div v-if="err" class="my-2 text-error">
        {{ err }}
      </div>
      <div>
        <form action="" @submit.prevent="handleSetup">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              class="input input-bordered w-full max-w-xs block"
              placeholder="admin"
            />
          </div>
          <div class="form-group mt-2">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="input input-bordered w-full max-w-xs block"
            />
          </div>
          <button
            class="btn btn-primary w-full max-w-xs my-5 text-sm"
            type="submit"
            :disabled="!isFormValid"
          >
            Setup
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
