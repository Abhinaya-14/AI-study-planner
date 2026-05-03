import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface StudyPlanParams {
  subjects: { id: number; name: string; priority: number }[];
  exams: { subjectName: string; date: string }[];
  availableHoursPerDay: number;
}

export const generateStudyPlan = async (params: StudyPlanParams) => {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    Generate a detailed study plan for a student with the following details:
    Subjects: ${params.subjects.map(s => `${s.name} (Priority ${s.priority}/5)`).join(", ")}
    Exams: ${params.exams.map(e => `${e.subjectName} on ${e.date}`).join(", ")}
    Available Study Time: ${params.availableHoursPerDay} hours per day.

    Please provide a structured plan for the next 7 days.
    Include:
    1. Specific topics to study for each subject.
    2. Allocation of time based on subject priority and upcoming exam dates.
    3. Suggested break times (Pomodoro style: 25m study, 5m break).
    4. A revision session for subjects with exams in the next 3 days.

    Return the response as a JSON array of daily objects. Each daily object should have:
    - day: string (e.g., "Day 1")
    - tasks: array of objects { subjectId: number, title: string, durationMinutes: number }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.STRING },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subjectId: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER }
                },
                required: ["subjectId", "title", "durationMinutes"]
              }
            }
          },
          required: ["day", "tasks"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const predictWeakSubjects = async (studyHistory: any[]) => {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze the following study history and predict which subjects the student might be struggling with.
    History: ${JSON.stringify(studyHistory)}
    
    Return a brief analysis and suggestions for improvement.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });

  return response.text;
};
