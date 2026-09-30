import { connection } from "next/server";
import { Suspense } from "react";

export const metadata = { title: "Streaming" };

async function Slow({ ms }: { ms: number }) {
  await new Promise((r) => setTimeout(r, ms));
  return <p id={`slow-${ms}`}>Arrived after {ms} ms.</p>;
}

export default async function Streaming() {
  await connection();
  return (
    <main>
      <h1>Streaming with Suspense</h1>
      <p>The shell arrives at once; each part streams in when it is ready.</p>
      <Suspense fallback={<p>Loading 500 ms…</p>}>
        <Slow ms={500} />
      </Suspense>
      <Suspense fallback={<p>Loading 1500 ms…</p>}>
        <Slow ms={1500} />
      </Suspense>
    </main>
  );
}
