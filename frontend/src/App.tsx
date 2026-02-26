import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Network, Search } from 'lucide-react';
import { fetchRoot, MIN_SEARCH_LENGTH } from './api';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import TreeView from './components/TreeView';

export default function App() {
  const [query, setQuery] = useState('');
  const isSearching = query.trim().length >= MIN_SEARCH_LENGTH;
  const { data: root } = useQuery({ queryKey: ['root'], queryFn: fetchRoot });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
              <Network className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900">ImageNet Taxonomy Explorer</h1>
              <p className="text-xs text-slate-500">ImageNet 2011 Fall Release</p>
            </div>
            {root && (
              <div className="ml-auto flex gap-4 text-right">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {(root.size + 1).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">total synsets</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 flex items-center gap-2">
          <SearchBar value={query} onChange={setQuery} placeholder="Search synsets by name…" />
          {isSearching && (
            <button
              onClick={() => setQuery('')}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-500 hover:bg-slate-50"
            >
              <Search className="h-3.5 w-3.5" />
              Browse tree
            </button>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {isSearching ? (
            <div className="px-4 py-4">
              <SearchResults query={query} />
            </div>
          ) : (
            <div className="px-2 py-2">
              <TreeView />
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Children are loaded on demand — only visible nodes are fetched from the API.
        </p>
      </main>
    </div>
  );
}
