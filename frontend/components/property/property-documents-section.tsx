import { PropertyDocuments } from '@/components/property/property-documents';

type PropertyDocumentsSectionProps = {
  propertyId: string;
};

export function PropertyDocumentsSection({ propertyId }: PropertyDocumentsSectionProps) {
  return <PropertyDocuments propertyId={propertyId} />;
}
