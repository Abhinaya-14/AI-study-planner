/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, BookOpen, Timer, LogOut, GraduationCap, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Timetable from './components/Timetable';
import SubjectManager from './components/SubjectManager';
import Pomodoro from './components/Pomodoro';
import { User, Subject, Exam, Task } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timetable' | 'subjects' | 'pomodoro'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [subsRes, examsRes, tasksRes] = await Promise.all([
        fetch(`/api/subjects?userId=${user.id}`),
        fetch(`/api/exams?userId=${user.id}`),
        fetch(`/api/tasks?userId=${user.id}`)
      ]);
      setSubjects(await subsRes.json());
      setExams(await examsRes.json());
      setTasks(await tasksRes.json());
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Auth failed");
    }
  };

  const handleAddSubject = async (name: string, priority: number, color: string) => {
    if (!user) return;
    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, name, priority, color })
    });
    if (res.ok) fetchData();
  };

  const handleAddExam = async (subjectId: number, date: string, description: string) => {
    if (!user) return;
    const res = await fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, subjectId, examDate: date, description })
    });
    if (res.ok) fetchData();
  };

  const handleToggleTask = async (id: number, completed: boolean) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed })
    });
    if (res.ok) {
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: completed ? 1 : 0 } : t));
    }
  };

  const handleBulkAddTasks = async (newTasks: any[]) => {
    if (!user) return;
    const res = await fetch('/api/tasks/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, tasks: newTasks })
    });
    if (res.ok) fetchData();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">AI Study Planner</h1>
            <p className="text-slate-500 mt-2">Your intelligent companion for academic success.</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={authForm.name}
                  onChange={e => setAuthForm({...authForm, name: e.target.value})}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={authForm.email}
                onChange={e => setAuthForm({...authForm, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={authForm.password}
                onChange={e => setAuthForm({...authForm, password: e.target.value})}
              />
            </div>
            <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">StudyAI</span>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            <NavItem 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
              icon={<LayoutDashboard />} 
              label="Dashboard" 
            />
            <NavItem 
              active={activeTab === 'timetable'} 
              onClick={() => setActiveTab('timetable')} 
              icon={<Calendar />} 
              label="Study Plan" 
            />
            <NavItem 
              active={activeTab === 'subjects'} 
              onClick={() => setActiveTab('subjects')} 
              icon={<BookOpen />} 
              label="Subjects" 
            />
            <NavItem 
              active={activeTab === 'pomodoro'} 
              onClick={() => setActiveTab('pomodoro')} 
              icon={<Timer />} 
              label="Focus Timer" 
            />
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="p-4 bg-slate-50 rounded-2xl mb-4">
              <div className="text-sm font-bold text-slate-900 truncate">{user.name}</div>
              <div className="text-xs text-slate-500 truncate">{user.email}</div>
            </div>
            <button 
              onClick={() => setUser(null)}
              className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-8">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
          <div className="text-sm font-medium text-slate-500">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard userId={user.id} tasks={tasks} subjects={subjects} exams={exams} />}
            {activeTab === 'timetable' && (
              <Timetable 
                userId={user.id} 
                tasks={tasks} 
                subjects={subjects} 
                exams={exams} 
                onToggleTask={handleToggleTask}
                onBulkAddTasks={handleBulkAddTasks}
              />
            )}
            {activeTab === 'subjects' && (
              <SubjectManager 
                userId={user.id} 
                subjects={subjects} 
                exams={exams} 
                onAddSubject={handleAddSubject}
                onAddExam={handleAddExam}
              />
            )}
            {activeTab === 'pomodoro' && (
              <div className="max-w-md mx-auto">
                <Pomodoro />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 ${active ? 'text-indigo-600' : 'text-slate-400'}` })}
      <span className="font-semibold">{label}</span>
    </button>
  );
}
