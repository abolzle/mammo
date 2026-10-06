import { cn } from "@/lib/utils";

/** Render a small Markdown subset. Imported text is treated as untrusted: no HTML, scripts, or raw URLs as markup. */
export function renderSafeMarkdown(input: string): string {
  const escaped = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const withBreaks = escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br />");
  return `<p>${withBreaks}</p>`;
}

export function SafeMarkdown({ text, className }: { text: string; className?: string }) {
  return (
    <div
      className={cn("prose-mammo text-[1.05rem] leading-7", className)}
      dangerouslySetInnerHTML={{ __html: renderSafeMarkdown(text) }}
    />
  );
}
