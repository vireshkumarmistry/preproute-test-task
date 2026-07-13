export interface Test {
  id: string;
  name: string;
  subject: string;
  topics?: string[];
  status: "Active" | "Draft" | "Completed" | "Live" | "Unpublished";
  createdDate: string;
  questionsCount: number;
  duration: number;
  type?: string;
  difficulty?: string;
}

export interface QuestionItem {
  id: number;
  text: string;
  options: string[];
  correctOptionIdx: number | null;
  solution: string;
  difficulty: string;
  topic: string;
  subtopic: string;
  isCompleted: boolean;
  media_url?: string;
}
