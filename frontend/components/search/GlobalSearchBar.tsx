'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchResult } from '@/lib/search/types';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export function GlobalSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!query) {
      setResults([]);
      setOpen(false);
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&pageSize=5`);
        const json = await res.json();
        if (json.ok) {
          setResults(json.results ?? []);
          setOpen(true);
        } else {
          setResults([]);
          setOpen(false);
        }
      } catch {
        setResults([]);
        setOpen(false);
      }
    }, 200);
  }, [query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="relative w-full max-w-md">
      <Input
        ref={inputRef}
        placeholder="Search properties…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        data-testid="global-search-input"
      />
      {open && results.length > 0 && (
        <Card
          ref={panelRef}
          className="absolute left-0 right-0 top-12 z-30 border shadow-lg"
          data-testid="global-search-panel"
        >
          <div className="divide-y">
            {results.map((result) => (
              <button
                key={result.id}
                className="flex w-full items-start gap-3 px-3 py-2 text-left hover:bg-muted"
                onClick={() => {
                  router.push(`/properties/${result.id}`);
                  setOpen(false);
                }}
                data-testid={`global-search-result-${result.id}`}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">{result.address}</div>
                  <div className="text-xs text-muted-foreground">
                    {result.epcRating ? `EPC ${result.epcRating}` : 'No EPC'} • Updated{' '}
                    {new Date(result.updatedAt).toLocaleDateString('en-GB')}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
