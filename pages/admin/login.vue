<script setup lang="ts">
import type { AuthResponse } from "~/model/api/response/AuthResponse";

const login = async () => {
  try {
    const response = await useFetchWithAuth<AuthResponse>("/api/auth", {
      method: "POST",
      body: { username: "admin", password: "admin" },
    });
    const authToken = useAuthToken();
    authToken.value = response.data.value?.token;
    navigateTo("/admin");
  } catch (e) {
    // TODO handle login error (wrong credentials)
    console.error(e);
  }
};
</script>

<template>
  <div>
    LOGIN
    <button class="btn btn-primary" @click="login()">Login</button>
  </div>
</template>
