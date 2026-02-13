import { ExternalLink } from "lucide-react";

export type Source = {
  title?: string;
  url?: string;
  publishedDate?: string;
  author?: string;
  excerpt?: string;
};

function getHost(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

type SourceCardProps = {
  source: Source;
  index: number;
};

export default function SourceCard({ source, index }: SourceCardProps) {
  const host = getHost(source.url);
  const faviconUrl = host
    ? `https://www.google.com/s2/favicons?domain=${host}&sz=32`
    : null;
  const title = source.title || "Source";
  const formattedDate = formatDate(source.publishedDate);

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      className="group block rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
    >
      <div className="flex gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            {faviconUrl && (
              <img
                src={faviconUrl}
                alt=""
                className="mt-0.5 h-4 w-4 shrink-0 rounded"
              />
            )}
            <div className="min-w-0 flex-1">
              <h4 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-emerald-700">
                {title}
              </h4>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
                {host && (
                  <span className="truncate">{host.replace(/^www\./, "")}</span>
                )}
                {formattedDate && (
                  <>
                    {host && <span>·</span>}
                    <span>{formattedDate}</span>
                  </>
                )}
              </div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-emerald-600" />
          </div>
          {source.excerpt && (
            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-gray-600">
              {source.excerpt}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}
