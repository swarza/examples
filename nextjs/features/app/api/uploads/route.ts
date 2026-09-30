import { PutObjectCommand } from "@aws-sdk/client-s3";
import { bucket, storage } from "@/lib/storage";

/** POST from the form on /uploads: stores the file in the bucket, then goes back to the page. */
export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.size) return new Response("Choose a file.", { status: 400 });
  if (file.size > 10 * 1024 * 1024) return new Response("Up to 10 MB here.", { status: 413 });
  const name = file.name.replace(/[^\w.-]+/g, "_").slice(-80) || "file";
  const started = performance.now();
  await storage().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: `uploads/${Date.now()}-${name}`,
      Body: new Uint8Array(await file.arrayBuffer()),
      ContentType: file.type || "application/octet-stream",
    }),
  );
  const ms = (performance.now() - started).toFixed(1);
  return Response.redirect(new URL(`/uploads?stored=${encodeURIComponent(name)}&ms=${ms}`, request.url), 303);
}
