import type {UseFetchOptions} from "#app";

export const useFetchWithAuth = (url: string, options?: UseFetchOptions<any>) => {
  return useFetch(url, {
    ...options,
    onRequest({request, options}): Promise<void> | void {
      const authToken = useAuthToken();
      if (authToken.value) {
        options.headers = options.headers || {}
        // @ts-ignore
        options.headers['Authorization'] = `Bearer ${authToken.value}`;
      }
    }
  });
};
