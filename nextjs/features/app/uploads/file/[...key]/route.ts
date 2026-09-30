import { GetObjectCommand } from "@aws-sdk/client-s3";
import { bucket, storage } from "@/lib/storage";

/** GET /uploads/file/<key>: the file, read from the bucket by the app (for files only signed-in users may see, say). */
export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  try {
    const r = await storage().send(
      new GetObjectCommand({ Bucket: bucket(), Key: `uploads/${key.join("/")}` }),
    );
    return new Response(r.Body!.transformToWebStream(), {
      headers: {
        "content-type": r.ContentType ?? "application/octet-stream",
        "content-length": String(r.ContentLength ?? ""),
        "cache-control": "private, max-age=60",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
