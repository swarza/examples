/**
 * The bucket bound to this site (swarza Storage buckets): the site's apps get STORAGE_*.
 * One client for reads, writes and signed links: the bucket's address is `<bucket>.s3.<domain>`.
 */
import { S3Client } from "@aws-sdk/client-s3";

let client: S3Client | null = null;

/** Whether a bucket is bound. Pages check this at request time and explain how to bind one. */
export const hasStorage = () => Boolean(process.env.STORAGE_ENDPOINT && process.env.STORAGE_BUCKET);

export function storage() {
  client ??= new S3Client({
    endpoint: process.env.STORAGE_ENDPOINT,
    region: process.env.STORAGE_REGION ?? "eu-central-1",
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
    },
  });
  return client;
}

export const bucket = () => process.env.STORAGE_BUCKET!;
