import { Bookmark, Building2, FileText, Flag, Home, Image, Inbox, Settings, ShieldCheck } from 'lucide-react';

export type IconName =
  | 'home'
  | 'properties'
  | 'invitations'
  | 'issues'
  | 'documents'
  | 'media'
  | 'watchlist'
  | 'settings'
  | 'admin';

const ICONS: Record<IconName, React.ComponentType<{ className?: string }>> = {
  home: Home,
  properties: Building2,
  invitations: Inbox,
  issues: Flag,
  documents: FileText,
  media: Image,
  watchlist: Bookmark,
  settings: Settings,
  admin: ShieldCheck,
};

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const Component = ICONS[name];
  if (!Component) return null;
  return <Component className={className} aria-hidden />;
}
