'use client';

/* eslint-disable ppuk/no-sync-dynamic-api */

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SearchFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="grid gap-4 rounded-lg border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            min={0}
            defaultValue={searchParams?.get('bedrooms') ?? ''}
            onBlur={(e) => updateParam('bedrooms', e.target.value)}
            data-testid="filter-bedrooms"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            min={0}
            defaultValue={searchParams?.get('bathrooms') ?? ''}
            onBlur={(e) => updateParam('bathrooms', e.target.value)}
            data-testid="filter-bathrooms"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price-min">Min price</Label>
          <Input
            id="price-min"
            type="number"
            min={0}
            defaultValue={searchParams?.get('minPrice') ?? ''}
            onBlur={(e) => updateParam('minPrice', e.target.value)}
            data-testid="filter-price-min"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price-max">Max price</Label>
          <Input
            id="price-max"
            type="number"
            min={0}
            defaultValue={searchParams?.get('maxPrice') ?? ''}
            onBlur={(e) => updateParam('maxPrice', e.target.value)}
            data-testid="filter-price-max"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="epc-min">Min EPC</Label>
          <Input
            id="epc-min"
            type="text"
            maxLength={2}
            defaultValue={searchParams?.get('minEPC') ?? ''}
            onBlur={(e) => updateParam('minEPC', e.target.value)}
            data-testid="filter-epc-min"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="epc-max">Max EPC</Label>
          <Input
            id="epc-max"
            type="text"
            maxLength={2}
            defaultValue={searchParams?.get('maxEPC') ?? ''}
            onBlur={(e) => updateParam('maxEPC', e.target.value)}
            data-testid="filter-epc-max"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <FilterToggle
          label="Has documents"
          param="hasDocuments"
          searchParams={searchParams}
          updateParam={updateParam}
          testId="filter-documents"
        />
        <FilterToggle
          label="Has media"
          param="hasMedia"
          searchParams={searchParams}
          updateParam={updateParam}
          testId="filter-media"
        />
        <FilterToggle
          label="Has issues"
          param="hasIssues"
          searchParams={searchParams}
          updateParam={updateParam}
          testId="filter-issues"
        />
      </div>
    </div>
  );
}

function FilterToggle({
  label,
  param,
  searchParams,
  updateParam,
  testId,
}: {
  label: string;
  param: string;
  searchParams: ReturnType<typeof useSearchParams> | null;
  updateParam: (key: string, value: string) => void;
  testId: string;
}) {
  const value = searchParams?.get(param) === 'true';
  return (
    <label className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        className="h-4 w-4"
        checked={value}
        onChange={(e) => updateParam(param, e.target.checked ? 'true' : '')}
        data-testid={testId}
      />
    </label>
  );
}
