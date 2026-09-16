export interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex min-h-[9rem] flex-col items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/5 p-6 text-center shadow-glass backdrop-blur-md"
    >
      <p className="text-sm text-white/80">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl bg-accent-500 px-4 py-2 font-medium text-night-900 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
      >
        Tentar novamente
      </button>
    </div>
  );
}
