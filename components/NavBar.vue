<script lang="ts" setup>
const isAuthenticated = useIsAuthenticated();
const authToken = useAuthToken();
const handleLogout = () => {
  try {
    authToken.value = undefined;
    navigateTo("/admin/login");
  } catch (error) {
    console.log(error);
  }
};
</script>

<template>
  <div class="border-b border-black/20">
    <nav class="container mx-auto py-4 flex justify-between items-center">
      <NuxtLink to="/admin" class="navbar-brand text-2xl font-bold"
        >URL Shortener</NuxtLink
      >
      <ul class="flex items-center">
        <li class="mr-6 text-xs">
          <NuxtLink v-if="isAuthenticated" to="/admin" class="btn"
            >Dashboard</NuxtLink
          >
          <NuxtLink v-else to="/admin/login" class="btn">Login</NuxtLink>
        </li>
        <li v-if="isAuthenticated" class="grid place-content-center">
          <button @click="handleLogout">
            <svg
              class="h-5 w-auto"
              fill="#000000"
              width="800px"
              height="800px"
              viewBox="0 0 32 32"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.651 16.989h17.326c0.553 0 1-0.448 1-1s-0.447-1-1-1h-17.264l3.617-3.617c0.391-0.39 0.391-1.024 0-1.414s-1.024-0.39-1.414 0l-5.907 6.062 5.907 6.063c0.196 0.195 0.451 0.293 0.707 0.293s0.511-0.098 0.707-0.293c0.391-0.39 0.391-1.023 0-1.414zM29.989 0h-17c-1.105 0-2 0.895-2 2v9h2.013v-7.78c0-0.668 0.542-1.21 1.21-1.21h14.523c0.669 0 1.21 0.542 1.21 1.21l0.032 25.572c0 0.668-0.541 1.21-1.21 1.21h-14.553c-0.668 0-1.21-0.542-1.21-1.21v-7.824l-2.013 0.003v9.030c0 1.105 0.895 2 2 2h16.999c1.105 0 2.001-0.895 2.001-2v-28c-0-1.105-0.896-2-2-2z"
              ></path>
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped></style>
