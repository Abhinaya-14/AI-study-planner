import React, { useState } from 'react';
import { Calendar, CheckCircle2, Circle, Clock, Sparkles, RefreshCw } from 'lucide-react';
import { Task, Subject, Exam } from '../types';
import { generateStudyPlan } from '../services/geminiService';

interface TimetableProps {
  userId: number;
  tasks: Task[];
  subjects: Subject[];
  exams: Exam[];
  onToggleTask: (id: number, completed: boolean) => void;
  onBulkAddTasks: (tasks: any[]) => void;
}

export default function Timetable({ userId, tasks, subjects, exams, onToggleTask, onBulkAddTasks }: TimetableProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableHours, setAvailableHours] = useState(4);

  const handleGenerate = async () => {
    if (subjects.length === 0) {
      alert("Please add some subjects first!");
      return;
    }
    setIsGenerating(true);
    try {
      const plan = await generateStudyPlan({
        subjects: subjects.map(s => ({ id: s.id, name: s.name, priority: s.priority })),
        exams: exams.map(e => ({ subjectName: e.subject_name || '', date: e.exam_date })),
        availableHoursPerDay: availableHours
      });

      // Flatten the plan into tasks for the next 7 days
      const newTasks: any[] = [];
      const today = new Date();
      
      plan.forEach((dayPlan: any, index: number) => {
        const date = new Date(today);
        date.setDate(today.getDate() + index);
        const dateString = date.toISOString().split('T')[0];
        
        dayPlan.tasks.forEach((task: any) => {
          newTasks.push({
            subjectId: task.subjectId,
            title: task.title,
            dueDate: dateString,
            durationMinutes: task.durationMinutes
          });
        });
      });

      onBulkAddTasks(newTasks);
    } catch (err) {
      console.error(err);
      alert("Failed to generate plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const tasksByDate = tasks.reduce((acc: any, task) => {
    const date = task.due_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  const sortedDates = Object.keys(tasksByDate).sort();

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 rounded-3xl text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              AI Study Planner
            </h2>
            <p className="text-indigo-100">Generate a personalized 7-day study schedule optimized for your exams.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-indigo-200 mb-1">Daily Study Hours</label>
              <input 
                type="number" 
                value={availableHours}
                onChange={e => setAvailableHours(parseInt(e.target.value))}
                className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg outline-none focus:bg-white/20 transition-colors"
                min="1" max="16"
              />
            </div>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {isGenerating ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sortedDates.length > 0 ? sortedDates.map(date => (
          <div key={date} className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 sticky top-0 bg-slate-50/80 backdrop-blur-sm py-2 z-10">
              <Calendar className="w-5 h-5 text-indigo-600" />
              {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasksByDate[date].map((task: Task) => (
                <div 
                  key={task.id} 
                  className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    task.completed ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200'
                  }`}
                >
                  <button 
                    onClick={() => onToggleTask(task.id, !task.completed)}
                    className={`transition-colors ${task.completed ? 'text-emerald-500' : 'text-slate-300 group-hover:text-indigo-400'}`}
                  >
                    {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </button>
                  <div className="flex-1">
                    <div className={`font-semibold ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                      {task.title}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {task.duration_minutes}m
                      </span>
                      <span 
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${task.subject_color}20`, color: task.subject_color }}
                      >
                        {task.subject_name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="max-w-xs mx-auto space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No study plan yet</h3>
              <p className="text-sm text-slate-500">Add your subjects and exams, then use the AI generator to create your personalized schedule.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
