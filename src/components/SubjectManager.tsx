import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Tag } from 'lucide-react';
import { Subject, Exam } from '../types';

interface SubjectManagerProps {
  userId: number;
  subjects: Subject[];
  exams: Exam[];
  onAddSubject: (name: string, priority: number, color: string) => void;
  onAddExam: (subjectId: number, date: string, description: string) => void;
}

export default function SubjectManager({ userId, subjects, exams, onAddSubject, onAddExam }: SubjectManagerProps) {
  const [newSubject, setNewSubject] = useState({ name: '', priority: 3, color: '#6366f1' });
  const [newExam, setNewExam] = useState({ subjectId: 0, date: '', description: '' });

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-600" />
            Manage Subjects
          </h3>
          
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Subject Name"
                className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newSubject.name}
                onChange={e => setNewSubject({...newSubject, name: e.target.value})}
              />
              <select 
                className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newSubject.priority}
                onChange={e => setNewSubject({...newSubject, priority: parseInt(e.target.value)})}
              >
                <option value="1">Low Priority</option>
                <option value="2">Medium-Low</option>
                <option value="3">Medium</option>
                <option value="4">Medium-High</option>
                <option value="5">High Priority</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {colors.map(c => (
                  <button 
                    key={c}
                    onClick={() => setNewSubject({...newSubject, color: c})}
                    className={`w-6 h-6 rounded-full border-2 ${newSubject.color === c ? 'border-slate-900' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button 
                onClick={() => {
                  if (newSubject.name) {
                    onAddSubject(newSubject.name, newSubject.priority, newSubject.color);
                    setNewSubject({ name: '', priority: 3, color: '#6366f1' });
                  }
                }}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {subjects.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="font-medium text-slate-700">{s.name}</span>
                  <span className="text-xs px-2 py-1 bg-slate-200 rounded text-slate-600">P{s.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-600" />
            Manage Exams
          </h3>

          <div className="space-y-4 mb-8">
            <select 
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newExam.subjectId}
              onChange={e => setNewExam({...newExam, subjectId: parseInt(e.target.value)})}
            >
              <option value="0">Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input 
                type="date" 
                className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newExam.date}
                onChange={e => setNewExam({...newExam, date: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Description (e.g. Midterm)"
                className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newExam.description}
                onChange={e => setNewExam({...newExam, description: e.target.value})}
              />
            </div>
            <button 
              onClick={() => {
                if (newExam.subjectId && newExam.date) {
                  onAddExam(newExam.subjectId, newExam.date, newExam.description);
                  setNewExam({ subjectId: 0, date: '', description: '' });
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Exam
            </button>
          </div>

          <div className="space-y-3">
            {exams.map(e => (
              <div key={e.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-slate-700">{e.subject_name}</div>
                    <div className="text-xs text-slate-500 mt-1">{e.description}</div>
                  </div>
                  <div className="text-sm font-semibold text-rose-600">{new Date(e.exam_date).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
