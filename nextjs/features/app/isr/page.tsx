import { getPosts } from "@/lib/posts";

export const revalidate = 30;
export const metadata = { title: "ISR" };

export default async function Isr() {
  const posts = await getPosts();
  return (
    <main>
      <h1>Regenerated at most every 30 seconds</h1>
      <p>
        Generated at <time id="generated">{new Date().toISOString()}</time> with {posts.length} posts.
      </p>
      <p>POST /api/revalidate regenerates it on demand.</p>
    </main>
  );
}
