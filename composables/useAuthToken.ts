import type { Ref } from "vue";

export const useAuthToken = (): Ref<string | undefined> => {
  return useCookie("AUTH_TOKEN");
};
