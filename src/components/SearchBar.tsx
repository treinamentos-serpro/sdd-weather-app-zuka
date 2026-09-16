import { useId, useState } from 'react';

export interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const inputId = useId();
  const validationId = useId();

  const submit = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    onSearch(trimmed);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  return (
    <form role="search" onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-1">
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 shadow-glass backdrop-blur-md">
        <label htmlFor={inputId} className="sr-only">
          Buscar cidade
        </label>
        <input
          id={inputId}
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (showValidation) setShowValidation(false);
          }}
          disabled={disabled}
          placeholder="Buscar cidade..."
          aria-describedby={showValidation ? validationId : undefined}
          className="flex-1 rounded-xl bg-transparent px-3 py-2 text-white placeholder:text-white/50 outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded-xl bg-accent-500 px-4 py-2 font-medium text-night-900 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buscar
        </button>
      </div>
      {showValidation && (
        <p id={validationId} role="alert" className="px-2 text-sm text-sun">
          Digite o nome de uma cidade para buscar.
        </p>
      )}
    </form>
  );
}
