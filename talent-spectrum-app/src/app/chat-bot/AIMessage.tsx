interface AIMessageProps {
  text: string;
  source?: "pdf" | "gemini" | "web" | "none";
}

function normalizeMarkdown(text: string): string {
  // Remove markdown bold markers globally
  return text.replace(/\*\*/g, "");
}

// Extract bullet-like lines (starting with "-" or "*")
function extractMarkdownBullets(text: string): string[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const bulletLines = lines
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").trim());

  return bulletLines;
}

// Decide how to render:
// - If clear bullets exist, use only those as bullets
// - Otherwise, if multiple sentences, show as bullets
// - Otherwise, plain text
function toDisplayBulletsOrText(raw: string): {
  bullets: string[];
  plain: string;
} {
  const normalized = normalizeMarkdown(raw).trim();

  // First: look for explicit markdown bullets
  const explicitBullets = extractMarkdownBullets(normalized);
  if (explicitBullets.length > 0) {
    return { bullets: explicitBullets, plain: "" };
  }

  // Second: try to split into meaningful sentence chunks
  const sentences = normalized
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length > 3) {
    // For longer answers, show as bullets for readability
    return { bullets: sentences, plain: "" };
  }

  // Otherwise, keep as plain text
  return { bullets: [], plain: normalized };
}

export default function AIMessage({ text, source }: AIMessageProps) {
  let sourceLabel = "";
  if (source === "pdf") sourceLabel = "From PDF";
  else if (source === "gemini") sourceLabel = "From Gemini";
  else if (source === "web") sourceLabel = "From Web";

  const { bullets, plain } = toDisplayBulletsOrText(text);

  return (
    <div className="w-full flex justify-start">
      <div
        className="
          bg-[#635bff]
          text-white
          px-4 py-3
          rounded-xl rounded-bl-none
          max-w-[75%]
          break-words
          text-sm
          whitespace-pre-wrap
        "
      >
        {bullets.length > 0 ? (
          <ul className="space-y-1">
            {bullets.map((line, i) => (
              <li
                key={i}
                className="
                  relative
                  pl-4
                  before:content-['•']
                  before:absolute
                  before:left-0
                  before:top-0
                "
              >
                {line}
              </li>
            ))}
          </ul>
        ) : (
          <div>{plain}</div>
        )}

        {sourceLabel && (
          <div className="mt-1 text-[10px] text-white/70">{sourceLabel}</div>
        )}
      </div>
    </div>
  );
}
