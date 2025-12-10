/**
 * File: create-property-form.tsx
 * Purpose: Form for creating new properties
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

/**
 * UK Postcode validation regex
 * Matches: SW1A 1AA, W1A 0AX, CR2 6XH, etc.
 */
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;

/**
 * UPRN validation regex
 * Must be 1-12 digits
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
  status: 'draft' | 'active' | 'archived';
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

export function CreatePropertyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    line1: '',
    line2: '',
    city: '',
    postcode: '',
    uprn: '',
    latitude: '',
    longitude: '',
    status: 'draft',
  });

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Line 1 is required
    if (!formData.line1.trim()) {
      newErrors.line1 = 'Address line 1 is required';
    }

    // City is required
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    // Postcode is required and must be valid UK postcode
    if (!formData.postcode.trim()) {
      newErrors.postcode = 'Postcode is required';
    } else if (!UK_POSTCODE_REGEX.test(formData.postcode.trim())) {
      newErrors.postcode = 'Invalid UK postcode format';
    }

    // UPRN is required and must be numeric
    if (!formData.uprn.trim()) {
      newErrors.uprn = 'UPRN is required';
    } else if (!UPRN_REGEX.test(formData.uprn.trim())) {
      newErrors.uprn = 'UPRN must be 1-12 digits';
    }

    // Latitude validation (optional, but must be valid if provided)
    if (formData.latitude.trim()) {
      const lat = parseFloat(formData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = 'Latitude must be between -90 and 90';
      }
    }

    // Longitude validation (optional, but must be valid if provided)
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
    setLoading(true);
    setErrors({});
    setSuccess(false);

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Create Supabase client
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Build display address
      const addressParts = [
        formData.line1,
        formData.line2,
        formData.city,
        formData.postcode,
      ].filter((part) => part.trim());
      const displayAddress = addressParts.join(', ');

      // Parse coordinates
      const latitude = formData.latitude.trim() ? parseFloat(formData.latitude) : undefined;
      const longitude = formData.longitude.trim() ? parseFloat(formData.longitude) : undefined;

      // Call RPC to create property
      const createPropertyArgs: Database['public']['Functions']['create_property_with_role']['Args'] = {
        p_uprn: formData.uprn.trim(),
        p_display_address: displayAddress,
        p_latitude: latitude,
        p_longitude: longitude,
        p_status: formData.status,
      };

      const { data: propertyId, error } = await supabase.rpc('create_property_with_role', createPropertyArgs);

      if (error) {
        throw error;
      }

      if (!propertyId) {
        throw new Error('Failed to create property');
      }

      // Success!
      setSuccess(true);
      
      // Redirect to the new property page after a brief delay
      setTimeout(() => {
        router.push(`/properties/${propertyId}`);
      }, 1000);
    } catch (error: unknown) {
      console.error('Error creating property:', error);
      const message = error instanceof Error ? error.message : 'Failed to create property. Please try again.';
      setErrors({
        general: message,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update form field
   */
  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl" data-testid="create-property-form">
      <CardHeader>
        <CardTitle>Create New Property</CardTitle>
        <CardDescription>
          Provide the basic information to register a new property in Property Passport UK.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Message */}
          {success && (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300">
              ✓ Property created successfully! Redirecting...
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              {errors.general}
            </div>
          )}

          {/* Address Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Property Address</h3>

            {/* Line 1 */}
            <div className="space-y-2">
              <Label htmlFor="line1">
                Address Line 1 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="line1"
                placeholder="e.g., 12A Elgin Avenue"
                value={formData.line1}
                onChange={(e) => updateField('line1', e.target.value)}
                disabled={loading}
                required
                data-testid="create-property-line1"
              />
              {errors.line1 && <p className="text-xs text-destructive">{errors.line1}</p>}
            </div>

            {/* Line 2 */}
            <div className="space-y-2">
              <Label htmlFor="line2">Address Line 2</Label>
              <Input
                id="line2"
                placeholder="e.g., Maida Vale (optional)"
                value={formData.line2}
                onChange={(e) => updateField('line2', e.target.value)}
                disabled={loading}
                data-testid="create-property-line2"
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                placeholder="e.g., London"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                disabled={loading}
                required
                data-testid="create-property-city"
              />
              {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
            </div>

            {/* Postcode */}
            <div className="space-y-2">
              <Label htmlFor="postcode">
                Postcode <span className="text-destructive">*</span>
              </Label>
              <Input
                id="postcode"
                placeholder="e.g., W9 3QP"
                value={formData.postcode}
                onChange={(e) => updateField('postcode', e.target.value.toUpperCase())}
                disabled={loading}
                required
                data-testid="create-property-postcode"
              />
              {errors.postcode && <p className="text-xs text-destructive">{errors.postcode}</p>}
            </div>
          </div>

          {/* Property Details Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Property Details</h3>

            {/* UPRN */}
            <div className="space-y-2">
              <Label htmlFor="uprn">
                UPRN <span className="text-destructive">*</span>
              </Label>
              <Input
                id="uprn"
                placeholder="e.g., 100023336633"
                value={formData.uprn}
                onChange={(e) => updateField('uprn', e.target.value)}
                disabled={loading}
                required
                data-testid="create-property-uprn"
              />
              <p className="text-xs text-muted-foreground">
                Unique Property Reference Number (1-12 digits)
              </p>
              {errors.uprn && <p className="text-xs text-destructive">{errors.uprn}</p>}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value)}
                disabled={loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="create-property-status"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Set to &quot;Draft&quot; for properties still being prepared
              </p>
            </div>
          </div>

          {/* Coordinates Section (Optional) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Coordinates (Optional)</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Latitude */}
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                id="latitude"
                type="number"
                step="0.000001"
                placeholder="e.g., 51.529899"
                value={formData.latitude}
                onChange={(e) => updateField('latitude', e.target.value)}
                disabled={loading}
                data-testid="create-property-latitude"
              />
                {errors.latitude && <p className="text-xs text-destructive">{errors.latitude}</p>}
              </div>

              {/* Longitude */}
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                id="longitude"
                type="number"
                step="0.000001"
                placeholder="e.g., -0.193567"
                value={formData.longitude}
                onChange={(e) => updateField('longitude', e.target.value)}
                disabled={loading}
                data-testid="create-property-longitude"
              />
                {errors.longitude && <p className="text-xs text-destructive">{errors.longitude}</p>}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Coordinates can be added now or updated later via a postcode lookup service
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading || success}
              className="flex-1"
              data-testid="create-property-submit"
            >
              {loading ? 'Creating...' : success ? 'Created!' : 'Create Property'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading || success}
            >
              Cancel
            </Button>
          </div>

          {/* Info Note */}
          <div className="rounded-md bg-muted p-4 text-xs text-muted-foreground">
            <p className="font-medium">What happens next:</p>
            <ul className="mt-2 space-y-1 list-disc pl-4">
              <li>Property will be created in the system</li>
              <li>You will be automatically assigned as the property owner</li>
              <li>A creation event will be logged in the property timeline</li>
              <li>You can add documents, photos, and assign additional roles after creation</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
