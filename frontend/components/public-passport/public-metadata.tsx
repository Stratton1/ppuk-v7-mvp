type PublicMetadataProps = {
  uprn?: string | null;
  status?: string | null;
};

export const PublicMetadata = ({ uprn, status }: PublicMetadataProps) => {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-primary">Property Metadata</h2>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">UPRN</dt>
          <dd className="font-mono">{uprn || 'Not provided'}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Status</dt>
          <dd className="capitalize">{status || 'Unknown'}</dd>
        </div>
      </dl>
    </div>
  );
};
