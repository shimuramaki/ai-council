import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
};

export function MarkdownContent({ content }: Props) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      <style jsx>{`
        .markdown :global(p) {
          margin: 0 0 0.85em;
        }
        .markdown :global(p:last-child) {
          margin-bottom: 0;
        }
        .markdown :global(h1),
        .markdown :global(h2),
        .markdown :global(h3),
        .markdown :global(h4) {
          margin: 1.1em 0 0.5em;
          color: #f4f4f6;
          font-weight: 700;
          line-height: 1.4;
        }
        .markdown :global(h1:first-child),
        .markdown :global(h2:first-child),
        .markdown :global(h3:first-child),
        .markdown :global(h4:first-child) {
          margin-top: 0;
        }
        .markdown :global(h1) {
          font-size: 1.15em;
        }
        .markdown :global(h2) {
          font-size: 1.05em;
        }
        .markdown :global(h3),
        .markdown :global(h4) {
          font-size: 1em;
        }
        .markdown :global(strong) {
          color: #f0f0f5;
          font-weight: 700;
        }
        .markdown :global(ul),
        .markdown :global(ol) {
          margin: 0.5em 0 0.85em;
          padding-left: 1.4em;
        }
        .markdown :global(li) {
          margin: 0.35em 0;
        }
        .markdown :global(li > p) {
          margin: 0;
        }
        .markdown :global(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 0.85em 0;
          font-size: 0.95em;
        }
        .markdown :global(th),
        .markdown :global(td) {
          border: 1px solid #2a2a36;
          padding: 8px 12px;
          text-align: left;
          vertical-align: top;
        }
        .markdown :global(th) {
          background: #1a1a24;
          color: #f0f0f5;
          font-weight: 600;
        }
        .markdown :global(tr:nth-child(even) td) {
          background: rgba(20, 20, 26, 0.6);
        }
        .markdown :global(code) {
          background: #1a1a24;
          border: 1px solid #2a2a36;
          border-radius: 4px;
          padding: 0.1em 0.35em;
          font-size: 0.9em;
        }
        .markdown :global(pre) {
          background: #1a1a24;
          border: 1px solid #2a2a36;
          border-radius: 8px;
          padding: 12px 14px;
          overflow-x: auto;
          margin: 0.75em 0;
        }
        .markdown :global(pre code) {
          background: none;
          border: none;
          padding: 0;
        }
        .markdown :global(blockquote) {
          margin: 0.75em 0;
          padding-left: 12px;
          border-left: 3px solid #3a3a5c;
          color: #b8b8c4;
        }
        .markdown :global(hr) {
          border: none;
          border-top: 1px solid #2a2a36;
          margin: 1em 0;
        }
      `}</style>
    </div>
  );
}
