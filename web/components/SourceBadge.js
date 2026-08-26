const SOURCE_STYLES = {
  COGNOS: "bg-amber-100 text-amber-800 ring-amber-600/20",
  TABLEAU: "bg-violet-100 text-violet-800 ring-violet-600/20",
  FABRIC: "bg-sky-100 text-sky-800 ring-sky-600/20",
  GCP: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
};

export default function SourceBadge({ source }) {
  const style = SOURCE_STYLES[source] || "bg-slate-100 text-slate-700 ring-slate-600/20";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {source}
    </span>
  );
}
