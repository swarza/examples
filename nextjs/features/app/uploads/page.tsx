import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { bucket, storage } from "@/lib/storage";

export const metadata = { title: "Uploads" };
export const dynamic = "force-dynamic";

export default async function Uploads({
  searchParams,
}: {
  searchParams: Promise<{ stored?: string; ms?: string }>;
}) {
  const { stored, ms } = await searchParams;
  const started = performance.now();
  const list = await storage().send(new ListObjectsV2Command({ Bucket: bucket(), Prefix: "uploads/" }));
  const listMs = performance.now() - started;
  // Set when the bucket is public: its files are at <bucket>.s3.<domain>/<key>, as in S3.
  const publicUrl = process.env.STORAGE_PUBLIC_URL;
  const files = (list.Contents ?? []).sort((a, b) => b.Key!.localeCompare(a.Key!)).slice(0, 20);
  const links = await Promise.all(
    files.map((f) =>
      getSignedUrl(storage(), new GetObjectCommand({ Bucket: bucket(), Key: f.Key! }), {
        expiresIn: 600,
      }),
    ),
  );
  return (
    <main>
      <h1>Uploads</h1>
      <p>
        Files go to a swarza Storage bucket with the AWS SDK. Listed in{" "}
        <span id="list-ms">{listMs.toFixed(1)}</span> ms. Timings: <a href="/api/storage">/api/storage</a>.
      </p>
      {stored ? (
        <p id="stored">
          Stored {stored} in {ms} ms.
        </p>
      ) : null}
      <form action="/api/uploads" method="post" encType="multipart/form-data">
        <input type="file" name="file" required />
        <button type="submit">Upload</button>
      </form>
      <ul id="files">
        {files.map((f, i) => {
          const name = f.Key!.slice("uploads/".length);
          return (
            <li key={f.Key}>
              {name} ({f.Size} bytes) · <a href={`/uploads/file/${name}`}>through the app</a> ·{" "}
              <a href={links[i]}>signed link (10 min)</a>
              {publicUrl ? (
                <>
                  {" "}
                  · <a href={`${publicUrl}/${f.Key}`}>public link (CDN)</a>
                </>
              ) : null}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
