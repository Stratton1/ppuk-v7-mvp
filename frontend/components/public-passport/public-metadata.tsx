type PublicMetadataProps = {
  uprn?: string | null;
  status?: string | null;
};

export const PublicMetadata = ({ uprn, status }: PublicMetadataProps) => {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm shadow-glow-xs backdrop-blur transition-shadow duration-200 hover:shadow-glow-sm md:p-6">
      <h2 className="text-lg font-semibold text-foreground">Property Metadata</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
          <dt className="text-muted-foreground">UPRN</dt>
          <dd className="font-mono text-foreground">{uprn || 'Not provided'}</dd>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
          <dt className="text-muted-foreground">Status</dt>
          <dd className="font-medium capitalize text-foreground">{status || 'Unknown'}</dd>
        </div>
      </dl>
    </div>
  );
};
