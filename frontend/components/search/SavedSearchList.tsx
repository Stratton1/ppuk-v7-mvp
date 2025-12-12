'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { deleteSavedSearch, getSavedSearches } from '@/lib/search/saved';
import type { SearchQuery } from '@/lib/search/types';

type SavedItem = { name: string; query: SearchQuery };

export function SavedSearchList() {
  const [saved, setSaved] = useState<SavedItem[]>([]);

  useEffect(() => {
    setSaved(getSavedSearches());
  }, []);

  const remove = (name: string) => {
    deleteSavedSearch(name);
    setSaved(getSavedSearches());
  };

  if (!saved.length) {
    return <div className="text-sm text-muted-foreground">No saved searches.</div>;
  }

  return (
    <div className="space-y-2">
      {saved.map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm"
          data-testid={`saved-search-item-${item.name}`}
        >
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-xs text-muted-foreground">{item.query.text}</div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => remove(item.name)}
            data-testid={`saved-search-delete-${item.name}`}
          >
            Delete
          </Button>
        </div>
      ))}
    </div>
  );
}
