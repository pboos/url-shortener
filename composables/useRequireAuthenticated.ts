export const useRequireAuthenticated = () => {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated.value) {
    throw createError({
      statusCode: 404,
      statusMessage: "Page Not Found",
      data: {
        myCustomField: true,
      },
    });
  }
};
