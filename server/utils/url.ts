export const isValidUrl = (url: string): boolean => {
  try {
    const createdUrl = new URL(url);
    return !!createdUrl;
  } catch (err) {
    return false;
  }
};
