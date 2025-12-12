import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearAllCachedUrls,
  clearCachedSignedUrl,
  getCacheStats,
  getCachedSignedUrl,
  setCachedSignedUrl,
} from '@/lib/signed-url-cache';

const BUCKET = 'property-documents';
const PATH = 'prop-1/doc.pdf';
const URL = 'https://example.com/doc.pdf?token=abc';

describe('signed-url-cache', () => {
  afterEach(() => {
    clearAllCachedUrls();
    vi.useRealTimers();
  });

  it('returns null when nothing cached', () => {
    expect(getCachedSignedUrl(BUCKET, PATH)).toBeNull();
  });

  it('stores and retrieves an unexpired URL', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    setCachedSignedUrl(BUCKET, PATH, URL);
    expect(getCachedSignedUrl(BUCKET, PATH)).toBe(URL);
    const stats = getCacheStats();
    expect(stats.size).toBe(1);
    expect(stats.keys).toContain(`${BUCKET}:${PATH}`);
  });

  it('expires cached entries after TTL', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    setCachedSignedUrl(BUCKET, PATH, URL);
    vi.setSystemTime(new Date('2024-01-01T01:00:01Z'));
    expect(getCachedSignedUrl(BUCKET, PATH)).toBeNull();
    expect(getCacheStats().size).toBe(0);
  });

  it('clears a specific cached entry', () => {
    setCachedSignedUrl(BUCKET, PATH, URL);
    clearCachedSignedUrl(BUCKET, PATH);
    expect(getCachedSignedUrl(BUCKET, PATH)).toBeNull();
  });
});
