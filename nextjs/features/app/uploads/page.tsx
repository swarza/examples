import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FeatureHint } from "@/components/FeatureHint";
import { HowItWorks } from "@/components/HowItWorks";
import { NeedsBucket } from "@/components/Notice";
import { stamp } from "@/lib/program";
import { bucket, hasStorage, storage } from "@/lib/storage";

export const metadata = { title: "Photos" };
export const dynamic = "force-dynamic";

const IMAGE = /\.(jpe?g|png|gif|webp|avif)$/i;

/** Photos and slides from the day, in the bound Storage bucket (uploaded by POST /api/uploads). */
export default async function Uploads({
  searchParams,
}: {
  searchParams: Promise<{ stored?: string; ms?: string }>;
}) {
  const { stored, ms } = await searchParams;
  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Photos and slides</p>
        <h1>Share your photos</h1>
        <p className="lead">
          Took a picture of a slide, or gave a talk? Upload it here, up to 10 MB. Everyone who visits this
          page sees the latest twenty.
        </p>
      </header>
      {hasStorage() ? (
        <Files stored={stored} ms={ms} />
      ) : (
        <NeedsBucket what="Uploads go to a Storage bucket." hint="storage" />
      )}
      <HowItWorks id="photos" />
    </div>
  );
}

async function Files({ stored, ms }: { stored?: string; ms?: string }) {
  const started = performance.now();
  const list = await storage().send(new ListObjectsV2Command({ Bucket: bucket(), Prefix: "uploads/" }));
  const listMs = performance.now() - started;
  // Set when the bucket is public: its files are at <bucket>.s3.<domain>/<key>, as in S3.
  const publicUrl = process.env.STORAGE_PUBLIC_URL;
  const files = (list.Contents ?? []).sort((a, b) => b.Key!.localeCompare(a.Key!)).slice(0, 20);
  const links = await Promise.all(
    files.map((f) =>
      getSignedUrl(storage(), new GetObjectCommand({ Bucket: bucket(), Key: f.Key! }), { expiresIn: 600 }),
    ),
  );
  return (
    <>
      <div className="upload-bar">
        <form action="/api/uploads" method="post" encType="multipart/form-data" className="form form-row">
          <label>
            <span>A photo or your slides</span>
            <input type="file" name="file" required />
          </label>
          <span className="form-submit">
            <button type="submit" className="btn">
              Upload
            </button>
            <FeatureHint id="storage" />
          </span>
        </form>
        <p className="status">
          {stored ? (
            <span id="stored">
              Stored {stored} in {ms} ms.
            </span>
          ) : null}
          <span>
            {files.length} {files.length === 1 ? "file" : "files"}, listed in{" "}
            <span id="list-ms">{listMs.toFixed(1)}</span> ms
          </span>
        </p>
      </div>
      {files.length ? (
        <ul className="files" id="files">
          {files.map((f, i) => {
            const name = f.Key!.slice("uploads/".length);
            const shown = name.replace(/^\d+-/, "");
            return (
              <li key={f.Key}>
                <a href={links[i]} className="file-thumb">
                  {IMAGE.test(name) ? (
                    // A signed link straight to the bucket; next/image would need the bucket's host configured.
                    <img src={links[i]} alt={shown} loading="lazy" />
                  ) : (
                    <span className="file-ext">{name.split(".").pop()?.slice(0, 4) || "file"}</span>
                  )}
                </a>
                <p className="file-name">{shown}</p>
                <p className="meta">
                  {size(f.Size ?? 0)}
                  {f.LastModified ? ` · ${stamp(f.LastModified)}` : ""}
                </p>
                <p className="file-links">
                  <a href={`/uploads/file/${name}`}>Through the app</a>
                  <a href={links[i]}>Signed link, 10 min</a>
                  {publicUrl ? <a href={`${publicUrl}/${f.Key}`}>Public link</a> : null}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="note" id="files">
          Nothing here yet. The first photo is yours.
        </p>
      )}
    </>
  );
}

function size(bytes: number) {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
