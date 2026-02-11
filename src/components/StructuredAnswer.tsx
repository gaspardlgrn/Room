type StructuredAnswer = {
  title?: string;
  summary?: string;
  sections?: Array<{
    heading?: string;
    paragraphs?: string[];
    bullets?: string[];
  }>;
  tables?: Array<{
    title?: string;
    columns?: string[];
    rows?: string[][];
  }>;
  conclusion?: string;
};

type StructuredAnswerProps = {
  answer: StructuredAnswer;
};

export default function StructuredAnswer({ answer }: StructuredAnswerProps) {
  return (
    <div className="ai-answer">
      {answer.title ? <h2 className="ai-answer__h2">{answer.title}</h2> : null}
      {answer.summary ? <p className="ai-answer__p">{answer.summary}</p> : null}

      {(answer.sections || []).map((section, index) => (
        <div key={`${section.heading || "section"}-${index}`}>
          {section.heading ? (
            <h2 className="ai-answer__h2">{section.heading}</h2>
          ) : null}
          {(section.paragraphs || []).map((paragraph, pIndex) => (
            <p key={`${index}-p-${pIndex}`} className="ai-answer__p">
              {paragraph}
            </p>
          ))}
          {section.bullets && section.bullets.length > 0 ? (
            <ul className="ai-answer__ul">
              {section.bullets.map((bullet, bIndex) => (
                <li key={`${index}-b-${bIndex}`} className="ai-answer__li">
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}

      {(answer.tables || []).map((table, index) => (
        <div key={`${table.title || "table"}-${index}`}>
          {table.title ? (
            <h3 className="ai-answer__h3">{table.title}</h3>
          ) : null}
          {table.columns && table.columns.length > 0 ? (
            <div className="ai-answer__table-wrap">
              <table className="ai-answer__table">
                <thead>
                  <tr>
                    {table.columns.map((column, cIndex) => (
                      <th key={`${index}-c-${cIndex}`} className="ai-answer__th">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(table.rows || []).map((row, rIndex) => (
                    <tr key={`${index}-r-${rIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`${index}-cell-${rIndex}-${cellIndex}`}
                          className="ai-answer__td"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ))}

      {answer.conclusion ? (
        <div>
          <h3 className="ai-answer__h3">Conclusion</h3>
          <p className="ai-answer__p">{answer.conclusion}</p>
        </div>
      ) : null}
    </div>
  );
}
