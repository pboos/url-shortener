<script setup lang="ts">
const login = async () => {
  try {
    const response = await useFetchWithAuth('/api/auth', {
      method: 'POST',
      body: {username: 'admin', password: 'admin'}
    });
    const authToken = useAuthToken();
    authToken.value = response.data.value.token;
    navigateTo('/');
  } catch (e) {
    // TODO handle login error (wrong credentials)
  }
};
</script>

<template>
  <div>
    LOGIN
    <button class="btn btn-primary" @click="login()">Login</button>
  </div>
</template>
