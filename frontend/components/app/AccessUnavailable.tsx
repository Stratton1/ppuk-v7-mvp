'use client';

import Link from 'next/link';
import { Ban } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';

type AccessUnavailableProps = {
  title: string;
  description: string;
  optionalActionLabel?: string;
  optionalActionHref?: string;
};

export function AccessUnavailable({
  title,
  description,
  optionalActionLabel,
  optionalActionHref,
}: AccessUnavailableProps) {
  return (
    <EmptyState
      dataTestId="access-unavailable"
      icon={<Ban className="h-5 w-5" />}
      title={title}
      description={description}
      variant="warning"
      action={
        optionalActionLabel && optionalActionHref ? (
          <Button asChild variant="outline" size="sm">
            <Link href={optionalActionHref}>{optionalActionLabel}</Link>
          </Button>
        ) : undefined
      }
    />
  );
}
