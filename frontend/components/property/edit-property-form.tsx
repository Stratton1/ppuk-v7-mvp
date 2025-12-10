/**
 * File: edit-property-form.tsx
 * Purpose: Form for editing existing properties
 * Type: Client Component
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Property = Database['public']['Tables']['properties']['Row'];

/**
 * UK Postcode validation regex
 */
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;

/**
 * UPRN validation regex
 */
const UPRN_REGEX = /^\d{1,12}$/;

interface FormData {
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  uprn: string;
  latitude: string;
  longitude: string;
  status: 'draft' | 'active' | 'archived' | 'withdrawn';
}

interface FormErrors {
  line1?: string;
  city?: string;
  postcode?: string;
  uprn?: string;
  latitude?: string;
  longitude?: string;
  general?: string;
}

interface EditPropertyFormProps {
  property: Property;
}

export function EditPropertyForm({ property }: EditPropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  // Parse existing display_address to populate form fields
  const parseAddress = (displayAddress: string) => {
    const parts = displayAddress.split(',').map((p) => p.trim());
    return {
      line1: parts[0] || '',
      line2: parts[1] || '',
      city: parts[parts.length - 2] || '',
      postcode: parts[parts.length - 1] || '',
    };
  };

  const addressParts = parseAddress(property.display_address);

  const [formData, setFormData] = useState<FormData>({
    line1: addressParts.line1,
    line2: addressParts.line2,
    city: addressParts.city,
    postcode: addressParts.postcode,
    uprn: property.uprn,
    latitude: property.latitude?.toString() || '',
    longitude: property.longitude?.toString() || '',
    status: property.status as 'draft' | 'active' | 'archived' | 'withdrawn',
  });

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.line1.trim()) {
      newErrors.line1 = 'Address line 1 is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.postcode.trim()) {
      newErrors.postcode = 'Postcode is required';
    } else if (!UK_POSTCODE_REGEX.test(formData.postcode.trim())) {
      newErrors.postcode = 'Invalid UK postcode format';
    }

    if (!formData.uprn.trim()) {
      newErrors.uprn = 'UPRN is required';
    } else if (!UPRN_REGEX.test(formData.uprn.trim())) {
      newErrors.uprn = 'UPRN must be 1-12 digits';
    }

    if (formData.latitude.trim()) {
      const lat = parseFloat(formData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = 'Latitude must be between -90 and 90';
      }
    }

    if (formData.longitude.trim()) {
      const lng = parseFloat(formData.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.longitude = 'Longitude must be between -180 and 180';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Build display address
      const displayAddress = [
        formData.line1.trim(),
        formData.line2.trim(),
        formData.city.trim(),
        formData.postcode.trim().toUpperCase(),
      ]
        .filter(Boolean)
        .join(', ');

      // Parse coordinates
      const latitude = formData.latitude.trim() ? parseFloat(formData.latitude) : null;
      const longitude = formData.longitude.trim() ? parseFloat(formData.longitude) : null;

      // Call update RPC
      const updateArgs: Database['public']['Functions']['update_property_with_event']['Args'] = {
        p_property_id: property.id,
        p_uprn: formData.uprn.trim(),
        p_display_address: displayAddress,
        p_latitude: latitude ?? undefined,
        p_longitude: longitude ?? undefined,
        p_status: formData.status,
      };

      const { error: rpcError } = await supabase.rpc('update_property_with_event', updateArgs);

      if (rpcError) {
        console.error('RPC error:', rpcError);
        setErrors({ general: rpcError.message || 'Failed to update property' });
        setLoading(false);
        return;
      }

      // Success!
      setSuccess(true);
      setTimeout(() => {
        router.push(`/properties/${property.id}`);
        router.refresh();
      }, 1000);
    } catch (error: unknown) {
      console.error('Update error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      setLoading(false);
    }
  };

  /**
   * Handle input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>Edit Property</CardTitle>
        <CardDescription>Update property details and metadata</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Message */}
          {success && (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300">
              ✓ Property updated successfully! Redirecting...
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              {errors.general}
            </div>
          )}

          {/* Property Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Address</h3>

            {/* Line 1 */}
            <div className="space-y-2">
              <Label htmlFor="line1">
                Address Line 1 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="line1"
                name="line1"
                value={formData.line1}
                onChange={handleChange}
                placeholder="e.g., 12 Elgin Avenue"
                disabled={loading || success}
              />
              {errors.line1 && <p className="text-sm text-destructive">{errors.line1}</p>}
            </div>

            {/* Line 2 */}
            <div className="space-y-2">
              <Label htmlFor="line2">Address Line 2 (Optional)</Label>
              <Input
                id="line2"
                name="line2"
                value={formData.line2}
                onChange={handleChange}
                placeholder="e.g., Maida Vale"
                disabled={loading || success}
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., London"
                disabled={loading || success}
              />
              {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
            </div>

            {/* Postcode */}
            <div className="space-y-2">
              <Label htmlFor="postcode">
                Postcode <span className="text-destructive">*</span>
              </Label>
              <Input
                id="postcode"
                name="postcode"
                value={formData.postcode}
                onChange={handleChange}
                placeholder="e.g., W9 3QP"
                disabled={loading || success}
              />
              {errors.postcode && <p className="text-sm text-destructive">{errors.postcode}</p>}
            </div>
          </div>

          {/* Property Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Details</h3>

            {/* UPRN */}
            <div className="space-y-2">
              <Label htmlFor="uprn">
                UPRN <span className="text-destructive">*</span>
              </Label>
              <Input
                id="uprn"
                name="uprn"
                value={formData.uprn}
                onChange={handleChange}
                placeholder="e.g., 100023408819"
                disabled={loading || success}
              />
              <p className="text-xs text-muted-foreground">
                Unique Property Reference Number (1-12 digits)
              </p>
              {errors.uprn && <p className="text-sm text-destructive">{errors.uprn}</p>}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading || success}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>

          {/* Coordinates Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Coordinates (Optional)</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Latitude */}
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="e.g., 51.5224"
                  disabled={loading || success}
                />
                {errors.latitude && <p className="text-sm text-destructive">{errors.latitude}</p>}
              </div>

              {/* Longitude */}
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g., -0.1838"
                  disabled={loading || success}
                />
                {errors.longitude && <p className="text-sm text-destructive">{errors.longitude}</p>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading || success}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || success}>
              {loading ? 'Updating...' : success ? 'Updated!' : 'Update Property'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
