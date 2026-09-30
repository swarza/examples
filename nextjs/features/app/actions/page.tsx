import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export const metadata = { title: "Server Actions" };

async function increment() {
  "use server";
  const jar = await cookies();
  jar.set("visits", String(Number(jar.get("visits")?.value ?? 0) + 1));
  revalidatePath("/actions");
}

export default async function Actions() {
  const visits = Number((await cookies()).get("visits")?.value ?? 0);
  return (
    <main>
      <h1>Server Actions</h1>
      <form action={increment}>
        <p id="count">Count: {visits}</p>
        <button type="submit">Increment</button>
      </form>
    </main>
  );
}
