export type RiskLevel = "low" | "medium" | "high";

export type GenerateReportMode = "production" | "sandbox" | "debug" | "premium";

export type GenerateReportInput = {
  mode?: GenerateReportMode;
  shopId: string;
  userId: string;
  vehicle: {
    year?: number;
    make?: string;
    model?: string;
    trim?: string;
    mileage?: number;
  };
  codes: string[];
  complaint: string;
  notes?: string;
};

export type GenerateReportOutput = {
  techView: string;
  customerView: string;
  maintenanceSuggestions: string[];
  riskAssessment?: {
    safety: RiskLevel;
    drivability: RiskLevel;
    longTermDamage: RiskLevel;
  };
  estimateRange?: {
    laborMin: number;
    laborMax: number;
    partsMin: number;
    partsMax: number;
    totalMin: number;
    totalMax: number;
  };
};