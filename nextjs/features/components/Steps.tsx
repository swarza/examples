/**
 * "How to test it" steps from lib/features.ts: `backticks` become code, a code path that starts
 * with / becomes a link, and {origin} becomes this site's address. Used by the hint popovers and
 * by /under-the-hood.
 */
export function Steps({ steps, origin, className }: { steps: string[]; origin: string; className?: string }) {
  return (
    <ol className={className}>
      {steps.map((s) => (
        <li key={s}>{rich(s.replaceAll("{origin}", origin))}</li>
      ))}
    </ol>
  );
}

function rich(text: string) {
  return text.split(/(`[^`]+`)/).map((part, i) => {
    if (!part.startsWith("`")) return part;
    const code = part.slice(1, -1);
    return /^\/[^\s…]*$/.test(code) ? (
      // A plain link: a full page load shows what the server does (a redirect, a first render).
      <a key={i} href={code}>
        <code>{code}</code>
      </a>
    ) : (
      <code key={i}>{code}</code>
    );
  });
}
