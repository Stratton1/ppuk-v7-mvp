'use client';

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
    <Card data-testid="access-unavailable">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="rounded-full bg-muted p-2">
          <Ban className="h-4 w-4" />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p>{description}</p>
        {optionalActionLabel && optionalActionHref && (
          <a href={optionalActionHref} className="text-primary underline">
            {optionalActionLabel}
          </a>
        )}
      </CardContent>
    </Card>
  );
}
