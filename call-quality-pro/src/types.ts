export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  points: number;
  notes?: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  icon?: string;
  items: ChecklistItem[];
}

export interface AssessmentSession {
  id: string;
  date: string;
  score: number;
  points: string;
  sections: ChecklistSection[];
}

export interface AssessmentState {
  agentName: string;
  caseNumber: string;
  sections: ChecklistSection[];
  overallNotes: string;
}
