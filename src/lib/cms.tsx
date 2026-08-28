import type { ReactNode } from "react";

export function CmsBody({ content }: { content: string }) {
  const blocks = content.replaceAll("\r\n", "\n").split("\n");
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flushList = () => {
    if (!list.length) return;
    out.push(
      <ul key={`ul-${out.length}`} className="mt-3 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-[#3f3a34]">
        {list.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    );
    list = [];
  };
  blocks.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (line.startsWith("- ")) {
      list.push(line.slice(2));
      return;
    }
    flushList();
    if (!line.trim()) {
      out.push(<div key={`br-${i}`} className="h-3" />);
      return;
    }
    if (line.startsWith("## ")) {
      out.push(
        <h2 key={i} className="mt-10 font-serif text-3xl">
          {line.slice(3)}
        </h2>
      );
      return;
    }
    if (line.startsWith("### ")) {
      out.push(
        <h3 key={i} className="mt-6 font-serif text-2xl">
          {line.slice(4)}
        </h3>
      );
      return;
    }
    out.push(
      <p key={i} className="mt-4 text-[15px] leading-relaxed text-[#3f3a34]">
        {line}
      </p>
    );
  });
  flushList();
  return <>{out}</>;
}
