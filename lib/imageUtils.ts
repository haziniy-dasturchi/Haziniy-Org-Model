/**
 * Client-side image compression utility.
 * Resizes large images (e.g. 5-10MB phone camera photos) to max 1200px and 0.85 quality,
 * yielding high-resolution images of ~150-250KB that upload in milliseconds
 * and persist smoothly in Supabase.
 */
/**
 * Checks whether a URL, data URI or filename represents a PDF document.
 */
export function isPdf(url?: string | null): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.startsWith("data:application/pdf") ||
    lower.endsWith(".pdf") ||
    lower.includes(".pdf?") ||
    lower.includes("/pdf") ||
    lower.includes("application/pdf")
  );
}

export async function compressImageFile(
  file: File,
  maxDimension = 1000,
  quality = 0.8
): Promise<File> {
  // If PDF, non-image, SVG or GIF, return file as-is without canvas compression
  const isPdfFile =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  if (
    isPdfFile ||
    !file.type.startsWith("image/") ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            const compressedFile = new File([blob], cleanName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
