export interface EmptyStateProps {
  title: string;
  hint: string;
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[9rem] flex-col items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 p-6 text-center shadow-glass backdrop-blur-md"
    >
      <p className="text-base font-medium text-white">{title}</p>
      <p className="text-sm text-white/60">{hint}</p>
    </div>
  );
}
