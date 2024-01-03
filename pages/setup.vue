<script setup lang="ts">
// TODO if already setup -> return 404?
// throw createError({
//   statusCode: 404,
//   statusMessage: 'Page Not Found',
//   data: {
//     myCustomField: true
//   }
// });

const createUser = () => {
  useFetch('/api/setup', {
    method: 'POST',
    body: JSON.stringify({
      username: 'admin',
      password: 'admin',
    }),
  });
};

const login = () => {
  useFetch('/api/auth', {
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
    <button class="btn btn-primary" @click="login()">LOGIN</button>
  </div>
</template>
