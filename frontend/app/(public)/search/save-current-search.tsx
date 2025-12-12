'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveSearch } from '@/lib/search/saved';
import type { SearchQuery } from '@/lib/search/types';

export default function SaveCurrentSearch({ query }: { query: SearchQuery }) {
  const [name, setName] = useState('');
  const disabled = !query.text;

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name) return;
        saveSearch(name, query);
        setName('');
      }}
    >
      <Input
        placeholder="Save this search as…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="sm:max-w-xs"
      />
      <Button type="submit" size="sm" disabled={disabled}>
        Save search
      </Button>
    </form>
  );
}
