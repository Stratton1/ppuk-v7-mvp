'use client';

import { useEffect, useState } from 'react';

type DevRoleBannerProps = {
  userId: string | null;
  role: string | null;
  propertyCount: number;
};

export function DevRoleBanner({ userId, role, propertyCount }: DevRoleBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-2 left-1/2 z-30 -translate-x-1/2 rounded-full border bg-muted/80 px-4 py-2 text-xs text-muted-foreground shadow-sm"
      data-testid="dev-role-banner"
    >
      <span className="font-medium">User:</span> {userId ?? 'n/a'} | <span className="font-medium">Role:</span>{' '}
      {role ?? 'unknown'} | <span className="font-medium">Properties:</span> {propertyCount}
    </div>
  );
}
