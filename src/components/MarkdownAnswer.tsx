import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MarkdownAnswerProps = {
  content: string;
};

export default function MarkdownAnswer({ content }: MarkdownAnswerProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => <h2 className="ai-answer__h2">{children}</h2>,
        h3: ({ children }) => <h3 className="ai-answer__h3">{children}</h3>,
        p: ({ children }) => <p className="ai-answer__p">{children}</p>,
        ul: ({ children }) => <ul className="ai-answer__ul">{children}</ul>,
        ol: ({ children }) => <ol className="ai-answer__ol">{children}</ol>,
        li: ({ children }) => <li className="ai-answer__li">{children}</li>,
        table: ({ children }) => (
          <div className="ai-answer__table-wrap">
            <table className="ai-answer__table">{children}</table>
          </div>
        ),
        th: ({ children }) => <th className="ai-answer__th">{children}</th>,
        td: ({ children }) => <td className="ai-answer__td">{children}</td>,
        hr: () => <hr className="ai-answer__hr" />,
        strong: ({ children }) => <strong className="ai-answer__strong">{children}</strong>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
