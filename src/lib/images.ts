export type CloudinaryImageOptions = {
   /** Maximum width in pixels (uses c_limit so it won't upscale). */
   width?: number;
};

function insertCloudinaryTransform(url: string, transform: string) {
   // Cloudinary delivery URLs look like:
   // https://res.cloudinary.com/<cloud>/image/upload/<transformations>/v123/file.jpg
   if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;

   const [prefix, rest] = url.split("/upload/");
   if (!rest) return url;

   // Avoid double-inserting if already transformed
   if (rest.startsWith(transform + "/") || rest.startsWith(transform + ",")) return url;

   return `${prefix}/upload/${transform}/${rest}`;
}

/**
 * Produces a smaller Cloudinary delivery URL using auto-format + auto-quality.
 * Keeps the original upload intact on Cloudinary; only delivery is transformed.
 */
export function toOptimizedImageUrl(src: string, options: CloudinaryImageOptions = {}) {
   const transforms: string[] = [
      "f_auto", // serve best format (webp/avif when supported)
      "q_auto:good", // smaller while keeping good visual quality
      "dpr_auto", // device pixel ratio aware
      "fl_progressive", // progressive JPEG when applicable
   ];

   if (options.width && Number.isFinite(options.width)) {
      transforms.push(`c_limit,w_${Math.round(options.width)}`);
   }

   const transform = transforms.join(",");
   return insertCloudinaryTransform(src, transform);
}
