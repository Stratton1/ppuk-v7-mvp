'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type ComponentCategory = 'buttons' | 'inputs' | 'cards' | 'badges' | 'dialogs' | 'loading';

export default function DevComponentsPage() {
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('buttons');

  const categories: { id: ComponentCategory; label: string }[] = [
    { id: 'buttons', label: 'Buttons' },
    { id: 'inputs', label: 'Inputs' },
    { id: 'cards', label: 'Cards' },
    { id: 'badges', label: 'Badges' },
    { id: 'dialogs', label: 'Dialogs' },
    { id: 'loading', label: 'Loading' },
  ];

  return (
    <div className="space-y-6" data-testid="dev-components-root">
      <div className="rounded-lg border border-amber-500/50 bg-amber-50 p-4 dark:bg-amber-950/20">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
          Component Showcase
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-300">
          A storybook-lite view of PPUK UI components and patterns.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(category.id)}
            data-testid={`category-${category.id}`}
          >
            {category.label}
          </Button>
        ))}
      </div>

      <div className="space-y-6">
        {activeCategory === 'buttons' && <ButtonShowcase />}
        {activeCategory === 'inputs' && <InputShowcase />}
        {activeCategory === 'cards' && <CardShowcase />}
        {activeCategory === 'badges' && <BadgeShowcase />}
        {activeCategory === 'dialogs' && <DialogShowcase />}
        {activeCategory === 'loading' && <LoadingShowcase />}
      </div>
    </div>
  );
}

function ButtonShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Buttons</CardTitle>
        <CardDescription>Button variants and sizes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Variants</Label>
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Sizes</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>States</Label>
          <div className="flex flex-wrap gap-2">
            <Button disabled>Disabled</Button>
            <Button className="animate-pulse">Loading...</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InputShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inputs</CardTitle>
        <CardDescription>Form input components</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="text-input">Text input</Label>
            <Input id="text-input" type="text" placeholder="Enter text..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-input">Email input</Label>
            <Input id="email-input" type="email" placeholder="user@ppuk.test" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-input">Password input</Label>
            <Input id="password-input" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disabled-input">Disabled input</Label>
            <Input id="disabled-input" disabled placeholder="Disabled" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="textarea">Textarea</Label>
          <Textarea id="textarea" placeholder="Enter longer text..." rows={4} />
        </div>
      </CardContent>
    </Card>
  );
}

function CardShowcase() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Basic Card</CardTitle>
          <CardDescription>A simple card with header and content</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Cards are used to group related content and actions.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Card with Action</CardTitle>
            <Button size="sm" variant="outline">
              Action
            </Button>
          </div>
          <CardDescription>Cards can include action buttons</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Action buttons typically appear in the header.
          </p>
        </CardContent>
      </Card>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle>Highlighted Card</CardTitle>
          <CardDescription>Cards with custom styling</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use custom classes to highlight important cards.
          </p>
        </CardContent>
      </Card>

      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle>Error Card</CardTitle>
          <CardDescription>Cards for error states</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Something went wrong!</p>
        </CardContent>
      </Card>
    </div>
  );
}

function BadgeShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges</CardTitle>
        <CardDescription>Badge variants for status and labels</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Variants</Label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge className="bg-destructive text-destructive-foreground">Destructive</Badge>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Property Statuses</Label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Active</Badge>
            <Badge variant="secondary">Draft</Badge>
            <Badge variant="outline">Archived</Badge>
          </div>
        </div>
        <div className="space-y-2">
          <Label>User Roles</Label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Owner</Badge>
            <Badge variant="secondary">Buyer</Badge>
            <Badge variant="outline">Tenant</Badge>
            <Badge variant="secondary">Agent</Badge>
            <Badge variant="secondary">Conveyancer</Badge>
            <Badge variant="secondary">Surveyor</Badge>
            <Badge className="bg-destructive text-destructive-foreground">Admin</Badge>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Permissions</Label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Editor</Badge>
            <Badge variant="outline">Viewer</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DialogShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dialogs</CardTitle>
        <CardDescription>Modal dialogs for user interaction</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Example Dialog</DialogTitle>
              <DialogDescription>
                This is an example dialog. Use dialogs for confirmations, forms, and
                important interactions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="dialog-input">Input in dialog</Label>
                <Input id="dialog-input" placeholder="Enter something..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Confirm</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Destructive Action</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the item.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Cancel</Button>
              <Button variant="destructive">Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function LoadingShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loading States</CardTitle>
        <CardDescription>Skeleton loaders and loading indicators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Skeleton Lines</Label>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Skeleton Card</Label>
          <div className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Avatar Skeleton</Label>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Property Card Skeleton</Label>
          <div className="rounded-lg border p-4">
            <div className="flex gap-4">
              <Skeleton className="h-20 w-20 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
