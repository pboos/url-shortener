export const useIsAuthenticated = () => {
  const authToken = useAuthToken();
  return computed(() => !!authToken.value);
};
