export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface TestCase {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  section?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'active' | 'deprecated';
  type: 'manual' | 'automated';
  preconditions?: string;
  steps: Array<{ stepNumber: number; instruction: string; expectedResult: string }>;
  createdAt: string;
}

export interface TestRun {
  id: string;
  projectId: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

export interface TestExecution {
  id: string;
  testRunId: string;
  testCaseId: string;
  status: 'untested' | 'passed' | 'failed' | 'blocked';
  comment?: string;
  executedBy?: string;
  executedAt?: string;
}
