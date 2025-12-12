import { Suspense } from 'react';
import { AppSection } from '@/components/app/AppSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TestDataControls from './test-data-controls';

export default function DevTestDataPage() {
  return (
    <div className="space-y-6" data-testid="dev-test-data-page">
      <AppSection
        title="Test data control panel"
        description="Reset or seed demo data for QA and Playwright flows."
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
              <TestDataControls />
            </Suspense>
          </CardContent>
        </Card>
      </AppSection>
    </div>
  );
}
