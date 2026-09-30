import "./(site)/globals.css";

export const metadata = { title: "Not found · Dispatch" };

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <main className="wrap page">
          <div className="page-head">
            <span className="kicker">404</span>
            <h1>Not in this edition.</h1>
            <p className="dek">
              That page doesn&apos;t exist. <a href="/">Back to the front page</a>.
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
