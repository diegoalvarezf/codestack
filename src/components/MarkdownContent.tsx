"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownContent({ content, className }: { content: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-2 mt-4 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold text-white mb-2 mt-4 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-200 mb-1.5 mt-3 first:mt-0">{children}</h3>,
          p: ({ children }) => <p className="text-sm text-gray-300 leading-relaxed mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-gray-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-gray-300">{children}</ol>,
          li: ({ children }) => <li className="text-sm text-gray-300 leading-relaxed">{children}</li>,
          code: ({ inline, children }: any) =>
            inline ? (
              <code className="bg-gray-800 text-green-400 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
            ) : (
              <code className="block bg-gray-800 text-gray-200 px-3 py-2 rounded-lg text-xs font-mono whitespace-pre-wrap my-2">{children}</code>
            ),
          pre: ({ children }) => <div className="my-2">{children}</div>,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-400">{children}</em>,
          hr: () => <hr className="border-gray-700 my-4" />,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-gray-600 pl-3 my-2 text-gray-400 italic">{children}</blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
