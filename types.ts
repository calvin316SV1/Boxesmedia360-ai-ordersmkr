
export enum OrderStatus {
  NUEVO = 'NUEVO',
  PENDIENTE = 'PENDIENTE',
  EN_PROGRESO = 'EN_PROGRESO',
  TERMINADO = 'TERMINADO',
}

export enum ServiceType {
    DIGITAL = 'Digital',
    PRE_PRENSA = 'Pre-Prensa',
    DIGITAL_TEXTIL = 'Digital + Textil',
    DIGITAL_IMPRESION = 'Digital + Impresión',
    OTROS = 'Otros',
}

export interface ProductionLogEntry {
    timestamp: string;
    note: string;
}

export interface ProgressStep {
    id: number;
    label: string;
    weight: number; // Percentage weight (e.g., 20 for 20%)
    completed: boolean;
}

export interface AIPhase {
  name: string;
  description: string;
  duration: string;
}

export interface AIMilestone {
    name: string;
    description: string;
}

export interface AIRisk {
    risk: string;
    mitigation: string;
}

export interface AISuggestion {
    type: 'Creative' | 'Technological' | 'Strategic';
    suggestion: string;
}

export interface AIProjectPlan {
  phases: AIPhase[];
  milestones: AIMilestone[];
  risks: AIRisk[];
  suggestions: AISuggestion[];
}

export interface AIProgressReport {
  progressPercentage: number;
  contextualObservation: string;
  motivationalQuote: string;
  quoteAuthor: string;
}

export interface Order {
  id: number;
  projectId: string;
  projectName: string;
  clientName: string;
  receptionDate: string;
  deliveryDate: string;
  amount: number;
  description: string;
  status: OrderStatus;
  serviceType: ServiceType;
  productionLog: ProductionLogEntry[];
  aiProjectPlan: AIProjectPlan | null;
  progressSteps: ProgressStep[];
}