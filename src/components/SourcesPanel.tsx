import { useState } from "react";
import SourceCard, { type Source } from "./SourceCard";

const INITIAL_VISIBLE = 5;

type SourcesPanelProps = {
  sources: Source[];
  onClose?: () => void;
};

export default function SourcesPanel({ sources, onClose }: SourcesPanelProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? sources : sources.slice(0, INITIAL_VISIBLE);
  const hasMore = sources.length > INITIAL_VISIBLE;

  return (
    <aside className="fixed right-0 top-0 z-30 hidden h-screen w-[340px] flex-col border-l border-gray-200 bg-gray-50/80 px-4 pt-5 backdrop-blur-sm lg:flex">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800">Sources</h3>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            {sources.length}
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
            aria-label="Fermer la colonne sources"
          >
            ×
          </button>
        )}
      </div>
      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pb-6 pr-1">
        {sources.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Aucune source pour le moment
          </p>
        ) : (
          <>
            {visible.map((source, index) => (
              <SourceCard
                key={source.url || source.title || index}
                source={source}
                index={index}
              />
            ))}
            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="w-full rounded-lg border border-dashed border-gray-300 bg-white py-2.5 text-xs font-medium text-gray-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700"
              >
                {showAll ? "Voir moins" : `Voir les ${sources.length - INITIAL_VISIBLE} autres`}
              </button>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
