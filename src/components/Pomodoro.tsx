import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

export default function Pomodoro() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
          const nextMode = mode === 'study' ? 'break' : 'study';
          setMode(nextMode);
          setMinutes(nextMode === 'study' ? 25 : 5);
          setSeconds(0);
          // Simple notification sound or alert
          alert(nextMode === 'study' ? "Time to focus!" : "Time for a break!");
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === 'study' ? 25 : 5);
    setSeconds(0);
  };

  return (
    <div className={`p-8 rounded-3xl text-white transition-all duration-500 shadow-xl ${
      mode === 'study' ? 'bg-indigo-600' : 'bg-emerald-600'
    }`}>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2">
          {mode === 'study' ? <Brain className="w-6 h-6" /> : <Coffee className="w-6 h-6" />}
          {mode === 'study' ? 'Focus Session' : 'Short Break'}
        </h3>
        <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium uppercase tracking-wider">
          {mode}
        </div>
      </div>

      <div className="text-center mb-10">
        <div className="text-8xl font-black tracking-tighter tabular-nums">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button 
          onClick={toggleTimer}
          className="w-16 h-16 flex items-center justify-center bg-white text-slate-900 rounded-2xl hover:scale-105 transition-transform shadow-lg"
        >
          {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </button>
        <button 
          onClick={resetTimer}
          className="w-16 h-16 flex items-center justify-center bg-white/20 text-white rounded-2xl hover:bg-white/30 transition-colors"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      <div className="mt-8 flex justify-center gap-2">
        <button 
          onClick={() => { setMode('study'); setMinutes(25); setSeconds(0); setIsActive(false); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mode === 'study' ? 'bg-white text-indigo-600' : 'hover:bg-white/10'}`}
        >
          25:00 Focus
        </button>
        <button 
          onClick={() => { setMode('break'); setMinutes(5); setSeconds(0); setIsActive(false); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mode === 'break' ? 'bg-white text-emerald-600' : 'hover:bg-white/10'}`}
        >
          05:00 Break
        </button>
      </div>
    </div>
  );
}
