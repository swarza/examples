import { measure } from "@/lib/timing";

export const metadata = { title: "Database timings" };
export const dynamic = "force-dynamic";

export default async function DatabaseTimings() {
  const n = 30;
  const timings = await measure(n);
  return (
    <main>
      <h1>Database timings</h1>
      <p>
        Measured just now, inside this app: each call {n} times in a row. Milliseconds as the app sees them
        (network, database and client together); CPU is the app&apos;s own time per call. JSON:{" "}
        <a href="/api/db">/api/db</a>.
      </p>
      <table id="timings">
        <thead>
          <tr>
            <th align="left">Call</th>
            <th>p50</th>
            <th>p90</th>
            <th>max</th>
            <th>CPU</th>
          </tr>
        </thead>
        <tbody>
          {timings.map((t) => (
            <tr key={t.name}>
              <td>{t.name}</td>
              <td align="right">{t.p50.toFixed(2)} ms</td>
              <td align="right">{t.p90.toFixed(2)} ms</td>
              <td align="right">{t.max.toFixed(2)} ms</td>
              <td align="right">{t.cpu.toFixed(2)} ms</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        On a small plan the app gets part of a CPU core: a burst of many calls can use its share and wait for
        the next 100 ms, which shows as a higher max.
      </p>
    </main>
  );
}
