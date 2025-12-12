'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updatePropertyAction } from '@/actions/properties';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ActionResult } from '@/types/forms';

const PROPERTY_TYPES = ['House', 'Flat', 'Bungalow', 'Cottage', 'Commercial', 'Land'];
const TENURE_OPTIONS = ['Freehold', 'Leasehold', 'Commonhold', 'Share of freehold', 'Unknown'];

export type EditableProperty = {
  id: string;
  display_address: string;
  uprn: string;
  public_visibility?: boolean | null;
  property_type?: string | null;
  tenure?: string | null;
  title?: string | null;
  tags?: string[] | null;
};

type PropertyEditFormProps = {
  property: EditableProperty;
};

export function PropertyEditForm({ property }: PropertyEditFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(async (_prevState: ActionResult, formData: FormData) => {
    return updatePropertyAction(formData);
  }, {});

  useEffect(() => {
    if (state?.success && property.id) {
      router.push(`/properties/${property.id}`);
      router.refresh();
    }
  }, [property.id, router, state]);

  const tagString = (property.tags ?? []).join(', ');

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <form className="space-y-5" action={formAction} data-testid="property-edit-form">
          <input type="hidden" name="propertyId" value={property.id} />

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={property.title ?? ''}
              placeholder="e.g., Elgin Avenue Apartment"
              data-testid="property-edit-input-title"
              required
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Display address</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={property.display_address}
              placeholder="12 Elgin Avenue, London, W9 3QP"
              data-testid="property-edit-input-address"
              required
              disabled={pending}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              This is shown publicly if visibility is enabled.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property type</Label>
              <select
                id="propertyType"
                name="propertyType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                data-testid="property-edit-input-type"
                defaultValue={property.property_type ?? ''}
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
                data-testid="property-edit-input-tenure"
                defaultValue={property.tenure ?? ''}
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
                defaultValue={property.uprn}
                placeholder="Unique Property Reference Number"
                data-testid="property-edit-input-uprn"
                required
                disabled={pending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={tagString}
                placeholder="Comma separated e.g., Prime, Chain-free"
                data-testid="property-edit-input-tags"
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
              defaultChecked={Boolean(property.public_visibility)}
              disabled={pending}
            />
            <Label htmlFor="public_visibility">Publicly visible passport</Label>
          </div>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={pending} data-testid="property-edit-submit">
              {pending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
