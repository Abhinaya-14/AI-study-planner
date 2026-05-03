import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { BookOpen, Calendar, CheckCircle, Clock, AlertCircle, Brain } from 'lucide-react';
import { Task, Subject, Exam } from '../types';
import { predictWeakSubjects } from '../services/geminiService';

interface DashboardProps {
  userId: number;
  tasks: Task[];
  subjects: Subject[];
  exams: Exam[];
}

export default function Dashboard({ userId, tasks, subjects, exams }: DashboardProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const completedTasks = tasks.filter(t => t.completed === 1);
  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
  
  const studyHoursBySubject = subjects.map(s => {
    const hours = tasks
      .filter(t => t.subject_id === s.id && t.completed === 1)
      .reduce((acc, t) => acc + t.duration_minutes / 60, 0);
    return { name: s.name, hours, color: s.color };
  });

  const upcomingExams = exams
    .filter(e => new Date(e.exam_date) >= new Date())
    .sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime())
    .slice(0, 3);

  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    try {
      const result = await predictWeakSubjects(tasks);
      setAnalysis(result || "No analysis available.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<CheckCircle className="text-emerald-500" />} 
          label="Completion Rate" 
          value={`${completionRate.toFixed(1)}%`} 
          subValue={`${completedTasks.length}/${tasks.length} tasks`}
        />
        <StatCard 
          icon={<Clock className="text-blue-500" />} 
          label="Total Study Time" 
          value={`${(completedTasks.reduce((acc, t) => acc + t.duration_minutes, 0) / 60).toFixed(1)}h`} 
          subValue="Hours focused"
        />
        <StatCard 
          icon={<BookOpen className="text-indigo-500" />} 
          label="Subjects" 
          value={subjects.length.toString()} 
          subValue="Active courses"
        />
        <StatCard 
          icon={<Calendar className="text-rose-500" />} 
          label="Upcoming Exams" 
          value={upcomingExams.length.toString()} 
          subValue="Next 30 days"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Study Hours by Subject
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyHoursBySubject}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {studyHoursBySubject.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            Upcoming Exams
          </h3>
          <div className="space-y-4">
            {upcomingExams.length > 0 ? upcomingExams.map(exam => (
              <div key={exam.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="font-medium text-slate-900">{exam.subject_name}</div>
                <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(exam.exam_date).toLocaleDateString()}
                </div>
                <div className="text-xs text-slate-400 mt-2">{exam.description}</div>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-400">No upcoming exams</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Performance Analysis
          </h3>
          <button 
            onClick={handleAnalyze}
            disabled={loadingAnalysis}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loadingAnalysis ? 'Analyzing...' : 'Refresh Analysis'}
          </button>
        </div>
        {analysis ? (
          <div className="prose prose-indigo max-w-none text-indigo-800 text-sm leading-relaxed">
            {analysis}
          </div>
        ) : (
          <p className="text-indigo-600 text-sm italic">Click refresh to get AI-powered insights into your study habits.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string, subValue: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{subValue}</div>
    </div>
  );
}
