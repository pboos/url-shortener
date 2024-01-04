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
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>
