'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ban } from 'lucide-react';

type AccessUnavailableProps = {
  title: string;
  description: string;
  optionalActionLabel?: string;
  optionalActionHref?: string;
};

export function AccessUnavailable({ title, description, optionalActionLabel, optionalActionHref }: AccessUnavailableProps) {
  return (
    <Card className="border-border/60 bg-card/80" data-testid="access-unavailable">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Ban className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>{description}</p>
        {optionalActionLabel && optionalActionHref && (
          <Link
            href={optionalActionHref}
            className="inline-flex text-primary transition-colors hover:text-primary/80 hover:underline"
          >
            {optionalActionLabel} →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
