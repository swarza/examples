import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { bucket, storage } from "@/lib/storage";

export const dynamic = "force-dynamic";

/** GET /api/storage?n=10: bucket operations from inside the app, timed (p50, p90, max in ms). */
export async function GET(request: Request) {
  const n = Math.min(100, Math.max(3, Number(new URL(request.url).searchParams.get("n")) || 10));
  const s3 = storage();
  const Bucket = bucket();
  const timings: Record<string, { p50: number; p90: number; max: number }> = {};
  const record = (name: string, times: number[]) => {
    const t = [...times].sort((a, b) => a - b);
    const r = (x: number) => Math.round(x * 10) / 10;
    timings[name] = {
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
  for (const [label, size] of [
    ["1 KB", 1024],
    ["100 KB", 100 * 1024],
    ["1 MB", 1024 * 1024],
  ] as const) {
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
    record(`PUT ${label}`, put);
    record(`GET ${label}`, get);
    record(`DELETE ${label}`, del);
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
  record("HEAD", head);
  record("LIST 20", list);
  return Response.json({ n, endpoint: process.env.STORAGE_ENDPOINT, timings });
}
