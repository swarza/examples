/**
 * Covers live in the Storage bucket bound as MEDIA (public): the app gets MEDIA_ENDPOINT,
 * MEDIA_BUCKET, MEDIA_ACCESS_KEY_ID, MEDIA_SECRET_ACCESS_KEY and, for a public bucket,
 * MEDIA_PUBLIC_URL (the bucket's CDN address, or its own domain when it has one).
 */
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

let client: S3Client | null = null;

export const hasMedia = () => Boolean(process.env.MEDIA_BUCKET && process.env.MEDIA_ACCESS_KEY_ID);

function s3() {
  client ??= new S3Client({
    endpoint: process.env.MEDIA_ENDPOINT,
    region: process.env.MEDIA_REGION ?? "eu-central-1",
    credentials: {
      accessKeyId: process.env.MEDIA_ACCESS_KEY_ID!,
      secretAccessKey: process.env.MEDIA_SECRET_ACCESS_KEY!,
    },
  });
  return client;
}

/** Keys never change once written (a new cover gets a new key), so the CDN may keep them a year. */
export async function putMedia(key: string, body: Uint8Array | string, contentType: string) {
  await s3().send(
    new PutObjectCommand({
      Bucket: process.env.MEDIA_BUCKET!,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

/** The public address of a key, or null without a public bucket. */
export function mediaUrl(key: string | null | undefined): string | null {
  const base = process.env.MEDIA_PUBLIC_URL;
  if (!key || !base) return null;
  return `${base.replace(/\/$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export const imageTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
