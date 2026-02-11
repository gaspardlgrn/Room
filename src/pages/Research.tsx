export default function Research() {
  const sources = [
    {
      id: 1,
      name: "FactSet Research Systems Inc.",
      ticker: "FDS",
      summary: "Financials, market cap, EV/EBITDA",
    },
    {
      id: 2,
      name: "S&P Global Inc.",
      ticker: "SPGI",
      summary: "Market data, EV/Sales, EV/EBITDA",
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-xs text-gray-500">Working...</div>
        <h1 className="mt-2 text-lg font-semibold text-gray-900">
          Legal AI Fundraising: Harvey AI vs. The Field
        </h1>
        <p className="mt-3 text-sm text-gray-700">
          Harvey AI has executed a remarkably aggressive fundraising strategy,
          raising $806M since inception in 2022 and achieving a $5.0B implied
          valuation. This trajectory significantly outpaces the venture path of
          key startup competitors.
        </p>

        <h2 className="mt-6 text-sm font-semibold text-gray-900">
          Harvey AI: Fundraising History
        </h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
          <div className="grid grid-cols-4 gap-2 bg-gray-50 px-4 py-2 text-xs text-gray-500">
            <div>Round</div>
            <div>Date</div>
            <div>Amount (USD)</div>
            <div>Lead Investors</div>
          </div>
          {[
            { round: "Series E", date: "2025-06-23", amount: "$300M", lead: "Kleiner Perkins, Coatue" },
            { round: "Series D", date: "2025-02-12", amount: "$300M", lead: "Sequoia Capital" },
            { round: "Series C", date: "2024-07-23", amount: "$100M", lead: "GV" },
          ].map((row) => (
            <div
              key={row.round}
              className="grid grid-cols-4 gap-2 px-4 py-2 text-sm text-gray-700"
            >
              <div>{row.round}</div>
              <div>{row.date}</div>
              <div>{row.amount}</div>
              <div>{row.lead}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-500">
          Ask a follow up...
        </div>
      </section>

      <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900">Sources</div>
          <div className="text-xs text-gray-400">{sources.length}</div>
        </div>
        <div className="mt-3 space-y-3">
          {sources.map((source) => (
            <div
              key={source.id}
              className="rounded-lg border border-gray-100 bg-gray-50/60 p-3 text-sm"
            >
              <div className="font-semibold text-gray-900">
                {source.name}
              </div>
              <div className="text-xs text-gray-500">{source.ticker}</div>
              <div className="mt-2 text-xs text-gray-600">{source.summary}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
