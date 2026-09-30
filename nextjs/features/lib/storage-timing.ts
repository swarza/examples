/**
 * Times bucket operations from inside the app: PUT, GET and DELETE of objects of a few sizes,
 * then HEAD and a LIST. Each runs `n` times after one untimed warm-up. Milliseconds as the app
 * sees them (network and storage together).
 */
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { bucket, storage } from "./storage";

export type StorageTiming = { name: string; p50: number; p90: number; max: number };

export const SIZES = { "1 KB": 1024, "100 KB": 100 * 1024, "1 MB": 1024 * 1024 } as const;

const summarize = (name: string, times: number[]): StorageTiming => {
  const t = [...times].sort((a, b) => a - b);
  const r = (x: number) => Math.round(x * 10) / 10;
  return {
    name,
    p50: r(t[Math.floor(t.length / 2)]!),
    p90: r(t[Math.floor(t.length * 0.9)]!),
    max: r(t.at(-1)!),
  };
};

const time = async (fn: () => Promise<unknown>) => {
  const s = performance.now();
  await fn();
  return performance.now() - s;
};

export async function measureStorage(n = 10, sizes: (keyof typeof SIZES)[] = ["1 KB", "100 KB", "1 MB"]) {
  const s3 = storage();
  const Bucket = bucket();
  const timings: StorageTiming[] = [];
  for (const label of sizes) {
    const size = SIZES[label];
    const body = new Uint8Array(size).fill(7);
    const put: number[] = [];
    const get: number[] = [];
    const del: number[] = [];
    for (let i = 0; i <= n; i++) {
      const Key = `timings/${size}-${i}.bin`;
      const p = await time(() => s3.send(new PutObjectCommand({ Bucket, Key, Body: body })));
      const g = await time(async () => {
        const r = await s3.send(new GetObjectCommand({ Bucket, Key }));
        await r.Body!.transformToByteArray();
      });
      const d = await time(() => s3.send(new DeleteObjectCommand({ Bucket, Key })));
      if (i === 0) continue;
      put.push(p);
      get.push(g);
      del.push(d);
    }
    timings.push(
      summarize(`PUT ${label}`, put),
      summarize(`GET ${label}`, get),
      summarize(`DELETE ${label}`, del),
    );
  }
  const head: number[] = [];
  const list: number[] = [];
  await s3.send(new PutObjectCommand({ Bucket, Key: "timings/head.txt", Body: "x" }));
  for (let i = 0; i <= n; i++) {
    const h = await time(() => s3.send(new HeadObjectCommand({ Bucket, Key: "timings/head.txt" })));
    const l = await time(() =>
      s3.send(new ListObjectsV2Command({ Bucket, Prefix: "uploads/", MaxKeys: 20 })),
    );
    if (i === 0) continue;
    head.push(h);
    list.push(l);
  }
  timings.push(summarize("HEAD", head), summarize("LIST 20", list));
  return timings;
}
