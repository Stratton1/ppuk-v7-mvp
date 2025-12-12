'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPropertyAction } from '@/actions/properties';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ActionResult } from '@/types/forms';

const PROPERTY_TYPES = ['House', 'Flat', 'Bungalow', 'Cottage', 'Commercial', 'Land'];
const TENURE_OPTIONS = ['Freehold', 'Leasehold', 'Commonhold', 'Share of freehold', 'Unknown'];

export function CreatePropertyForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(async (_prevState: ActionResult, formData: FormData) => {
    return createPropertyAction(formData);
  }, {});

  useEffect(() => {
    if (state?.success && state.propertyId) {
      router.push(`/properties/${state.propertyId}`);
      router.refresh();
    }
  }, [router, state]);

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <form className="space-y-5" action={formAction} data-testid="property-create-form">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Elgin Avenue Apartment"
              data-testid="property-create-input-title"
              required
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Display address</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="12 Elgin Avenue, London, W9 3QP"
              data-testid="property-create-input-address"
              required
              disabled={pending}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              This will be shown across the passport and is used for search and matching.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property type</Label>
              <select
                id="propertyType"
                name="propertyType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                data-testid="property-create-input-type"
                defaultValue=""
                required
                disabled={pending}
              >
                <option value="" disabled>
                  Select a property type
                </option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenure">Tenure</Label>
              <select
                id="tenure"
                name="tenure"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                data-testid="property-create-input-tenure"
                defaultValue=""
                required
                disabled={pending}
              >
                <option value="" disabled>
                  Select tenure
                </option>
                {TENURE_OPTIONS.map((tenure) => (
                  <option key={tenure} value={tenure}>
                    {tenure}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="uprn">UPRN</Label>
              <Input
                id="uprn"
                name="uprn"
                placeholder="Unique Property Reference Number"
                data-testid="property-create-input-uprn"
                required
                disabled={pending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="Comma separated e.g., Prime, Chain-free"
                data-testid="property-create-input-tags"
                disabled={pending}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="public_visibility"
              name="public_visibility"
              type="checkbox"
              className="h-4 w-4 rounded border-input"
              defaultChecked
              disabled={pending}
            />
            <Label htmlFor="public_visibility">Publicly visible passport</Label>
          </div>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={pending} data-testid="property-create-submit">
              {pending ? 'Creating…' : 'Create property'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
