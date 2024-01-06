import type { Ref } from "vue";
import type { Link } from "~/model/api/link";

export const useLinkShortUrl = (linkRef: Ref<Link | null> | Link | null) => {
  return computed(() => {
    const link = unref(linkRef);
    if (!link) {
      return null;
    }
    const requestUrl = useRequestURL();
    const config = useRuntimeConfig();
    let baseUrl = config.app.baseURL.startsWith("http")
      ? config.app.baseURL
      : `${requestUrl.origin}${config.app.baseURL}`;
    baseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    return `${baseUrl}${link.key}`;
  });
};
