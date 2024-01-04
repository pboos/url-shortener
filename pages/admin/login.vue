<script setup lang="ts">
import type { AuthResponse } from "~/model/api/response/AuthResponse";
useHead({
  title: "Login",
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

const handleLogin = async () => {
  isLoading.value = true;
  try {
    const response = await useFetchWithAuth<AuthResponse>("/api/auth", {
      method: "POST",
      body: { username: form.value.username, password: form.value.password },
    });
    if (response.error.value) {
      err.value = "Login failed";
    }
    if (response.data.value) {
      const authToken = useAuthToken();
      authToken.value = response.data.value.token;
      navigateTo("/admin");
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
      <h2 class="card-title">Login</h2>

      <div v-if="err" class="my-2 text-error">
        {{ err }}
      </div>
      <div>
        <form action="" @submit.prevent="handleLogin">
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
            Login
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
