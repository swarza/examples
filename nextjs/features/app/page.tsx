export default function Home() {
  return (
    <main>
      <h1>Next.js on swarza</h1>
      <p id="kind">Static page, prerendered at build time.</p>
      <p>
        Built at <time id="built">{new Date().toISOString()}</time>.
      </p>
    </main>
  );
}
