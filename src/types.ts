export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Subject {
  id: number;
  user_id: number;
  name: string;
  priority: number;
  color: string;
}

export interface Exam {
  id: number;
  user_id: number;
  subject_id: number;
  subject_name?: string;
  exam_date: string;
  description: string;
}

export interface Task {
  id: number;
  user_id: number;
  subject_id: number;
  subject_name?: string;
  subject_color?: string;
  title: string;
  due_date: string;
  completed: number;
  duration_minutes: number;
}
