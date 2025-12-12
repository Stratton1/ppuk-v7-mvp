'use client';

import type { SearchQuery } from './types';

const KEY = 'ppuk_saved_searches';

type SavedSearch = {
  name: string;
  query: SearchQuery;
};

function getStorage(): SavedSearch[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SavedSearch[];
  } catch {
    return [];
  }
}

function setStorage(items: SavedSearch[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function saveSearch(name: string, query: SearchQuery) {
  const items = getStorage().filter((s) => s.name !== name);
  items.push({ name, query });
  setStorage(items);
}

export function getSavedSearches(): SavedSearch[] {
  return getStorage();
}

export function deleteSavedSearch(name: string) {
  const items = getStorage().filter((s) => s.name !== name);
  setStorage(items);
}
