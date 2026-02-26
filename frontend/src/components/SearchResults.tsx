import { memo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { fetchSearch, PAGE_SIZE, MIN_SEARCH_LENGTH } from '../api';
import type { NodeItem } from '../api';

const Highlight = memo(function Highlight({ text, term }: { text: string; term: string }) {
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-yellow-100 px-0.5 text-yellow-800">
        {text.slice(idx, idx + term.length)}
      </mark>
      {text.slice(idx + term.length)}
    </>
  );
});

const Breadcrumb = memo(function Breadcrumb({ path }: { path: string }) {
  const parts = path.split(' > ');
  return (
    <p className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-slate-400">
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
          <span className={clsx(i === parts.length - 1 && 'font-medium text-slate-600')}>
            {part}
          </span>
        </span>
      ))}
    </p>
  );
});

export default function SearchResults({ query }: { query: string }) {
  const [offset, setOffset] = useState(0);
  const [accumulated, setAccumulated] = useState<NodeItem[]>([]);

  useEffect(() => {
    setOffset(0);
    setAccumulated([]);
  }, [query]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['search', query, offset],
    queryFn: () => fetchSearch(query, offset),
    enabled: query.trim().length >= MIN_SEARCH_LENGTH,
  });

  useEffect(() => {
    if (data) {
      setAccumulated((prev) => (offset === 0 ? data.results : [...prev, ...data.results]));
    }
  }, [data, offset]);

  if (query.trim().length < MIN_SEARCH_LENGTH) {
    return (
      <p className="py-10 text-center text-sm text-slate-400">
        Type at least 2 characters to search.
      </p>
    );
  }

  if (isLoading && offset === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Searching…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-red-400">
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm">{(error as Error).message}</span>
      </div>
    );
  }

  if (!data || accumulated.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-400">
        No results for &ldquo;{query}&rdquo;.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs text-slate-400">
        {data.total.toLocaleString()} result{data.total !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        {' — showing '}
        {accumulated.length.toLocaleString()}
      </p>

      <ul className="divide-y divide-slate-100">
        {accumulated.map((item) => (
          <li key={item.id} className="py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  <Highlight text={item.name} term={query} />
                </p>
                <Breadcrumb path={item.fullName} />
              </div>
              {item.size > 0 && (
                <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                  {item.size.toLocaleString()}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {data.hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setOffset((o) => o + PAGE_SIZE)}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {isFetching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </>
            ) : (
              'Load more'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
