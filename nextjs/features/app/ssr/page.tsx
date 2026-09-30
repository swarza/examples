import { cookies, headers } from "next/headers";

export const metadata = { title: "SSR" };

export default async function Ssr() {
  const h = await headers();
  const visits = Number((await cookies()).get("visits")?.value ?? 0);
  return (
    <main>
      <h1>Server-rendered on every request</h1>
      <p>
        Rendered at <time id="now">{new Date().toISOString()}</time> for{" "}
        <span id="host">{h.get("host")}</span>.
      </p>
      <p>Country from the proxy: {h.get("x-country")}</p>
      <p>Visits cookie: {visits}</p>
    </main>
  );
}
