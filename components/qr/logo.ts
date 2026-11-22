export async function resizeLogo(blob: Blob): Promise<string> {
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(blob.type) ||
    blob.size > 2 * 1024 * 1024
  ) {
    throw new Error("Choose a PNG, JPEG, or WebP image under 2 MB.");
  }
  const bitmap = await createImageBitmap(blob);
  try {
    const scale = Math.min(1, 80 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser could not resize the logo.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    bitmap.close();
  }
}
