import MarkdownIt from "markdown-it";

/**
 * Post bodies are Markdown. Raw HTML is off, so whatever an editor types is escaped; links get
 * rel="noopener" and only http(s) and mailto URLs are kept (markdown-it's validateLink).
 */
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
const defaultLink =
  md.renderer.rules.link_open ??
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = tokens[idx]!.attrGet("href") ?? "";
  if (/^https?:\/\//.test(href)) tokens[idx]!.attrSet("rel", "noopener");
  return defaultLink(tokens, idx, options, env, self);
};

export const renderMarkdown = (source: string) => md.render(source);

/** About 230 words a minute, at least one. */
export const readingMinutes = (source: string) =>
  Math.max(1, Math.round(source.split(/\s+/).filter(Boolean).length / 230));
