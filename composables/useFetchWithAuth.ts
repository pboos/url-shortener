import type { UseFetchOptions } from "#app";

export const useFetchWithAuth = <ResT = void>(
  url: string,
  options?: UseFetchOptions<ResT>,
) => {
  return useFetch<ResT>(url, {
    ...options as any,
    onRequest({ options }): Promise<void> | void {
      const authToken = useAuthToken();
      if (authToken.value) {
        options.headers = options.headers || {};
        // @ts-ignore
        options.headers.Authorization = `Bearer ${authToken.value}`;
      }
    },
  });
};
