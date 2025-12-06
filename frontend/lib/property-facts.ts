/**
 * Stub helpers for property facts integrations (EPC, flood, planning, title).
 * Replace return values with real API calls when wiring integrations.
 */

export type EPCData = {
  rating: string;
  certificateNumber: string;
  validUntil?: string | null;
  summary: string;
};

export type FloodData = {
  riskLevel: 'High' | 'Medium' | 'Low' | 'Very Low';
  zone?: string | null;
  summary: string;
};

export type PlanningApplication = {
  reference: string;
  status: string;
  description?: string;
};

export type PlanningData = {
  status?: string | null;
  recentApplications: PlanningApplication[];
  summary?: string;
};

export type TitleData = {
  titleNumber?: string | null;
  tenure?: string | null;
  updatedAt?: string | null;
  summary: string;
};

type FactResponse<T> = {
  data: T | null;
  loading?: boolean;
  error?: string;
};

export function getEpcDataForProperty(_uprn: string | null | undefined): FactResponse<EPCData> {
  return {
    data: {
      rating: 'C',
      certificateNumber: '1234-5678-9000',
      validUntil: '12 Jan 2030',
      summary: 'Energy performance certificate in place with rating C. Potential to improve to B.',
    },
    loading: false,
    error: undefined,
  };
}

export function getFloodDataForProperty(_uprn: string | null | undefined): FactResponse<FloodData> {
  return {
    data: {
      riskLevel: 'Low',
      zone: 'Zone 1',
      summary: 'Low probability of flooding based on EA data. No flood defences recorded.',
    },
    loading: false,
    error: undefined,
  };
}

export function getPlanningDataForProperty(_uprn: string | null | undefined): FactResponse<PlanningData> {
  return {
    data: {
      status: 'Mixed',
      recentApplications: [
        { reference: '22/PLN/1234', status: 'Approved', description: 'Loft conversion with dormer' },
        { reference: '21/PLN/5678', status: 'Refused', description: 'Front extension' },
      ],
      summary: 'Recent minor applications; one approved loft conversion, one refused front extension.',
    },
    loading: false,
    error: undefined,
  };
}

export function getTitleDataForProperty(_uprn: string | null | undefined): FactResponse<TitleData> {
  return {
    data: {
      titleNumber: 'LN123456',
      tenure: 'Freehold',
      updatedAt: '03 Feb 2025',
      summary: 'Freehold title with no restrictions recorded in mock data. Awaiting LR integration.',
    },
    loading: false,
    error: undefined,
  };
}
