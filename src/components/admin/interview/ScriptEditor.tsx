'use client';

import React, { useState, useCallback } from 'react';
import { GripVertical, Plus, Trash2, ChevronDown, ChevronUp, Clock, Sparkles } from 'lucide-react';
import type { ScriptQuestion } from '@/types/interview';

type DraftQuestion = Omit<ScriptQuestion, 'id'> & { _key: string };

interface ScriptEditorProps {
  questions: DraftQuestion[];
  onChange: (questions: DraftQuestion[]) => void;
}

let keyCounter = 0;
export function makeKey() { return `q-${++keyCounter}-${Date.now()}`; }

export function emptyQuestion(order: number): DraftQuestion {
  return {
    _key: makeKey(),
    order,
    speaker_name: 'Interviewer',
    question_text: '',
    expected_answer_hint: '',
    time_limit_seconds: 120,
  };
}

export default function ScriptEditor({ questions, onChange }: ScriptEditorProps) {
  const [expanded, setExpanded] = useState<string | null>(questions[0]?._key ?? null);

  const addQuestion = () => {
    const newQ = emptyQuestion(questions.length);
    const next = [...questions, newQ];
    onChange(next);
    setExpanded(newQ._key);
  };

  const removeQuestion = (key: string) => {
    const next = questions
      .filter((q) => q._key !== key)
      .map((q, i) => ({ ...q, order: i }));
    onChange(next);
  };

  const updateQuestion = useCallback(
    (key: string, field: keyof DraftQuestion, value: string | number) => {
      onChange(questions.map((q) => (q._key === key ? { ...q, [field]: value } : q)));
    },
    [questions, onChange]
  );

  const moveQuestion = (key: string, direction: -1 | 1) => {
    const idx = questions.findIndex((q) => q._key === key);
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= questions.length) return;
    const next = [...questions];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    onChange(next.map((q, i) => ({ ...q, order: i })));
  };

  return (
    <div className="space-y-3">
      {questions.length === 0 && (
        <div className="text-center py-10 text-[var(--text-sub)] text-sm border-2 border-dashed border-gray-200 rounded-2xl p-6">
          No questions yet. Click "Add Question" below or use the AI Generator above to auto-create questions.
        </div>
      )}

      {questions.map((q, idx) => {
        const isOpen = expanded === q._key;
        return (
          <div
            key={q._key}
            className="border border-gray-200 rounded-2xl bg-white overflow-hidden transition-all shadow-xs"
          >
            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-3">
              <GripVertical size={16} className="text-gray-400 shrink-0 cursor-grab" />
              <span className="w-7 h-7 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(isOpen ? null : q._key)}>
                <p className="text-sm text-gray-900 truncate font-semibold">
                  {q.question_text || <span className="text-gray-400 italic">Empty question prompt…</span>}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[var(--text-sub)]">
                    {q.speaker_name} · {q.time_limit_seconds}s limit
                  </span>
                  {q.expected_answer_hint && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <Sparkles size={10} /> Ideal Answer Included
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => moveQuestion(q._key, -1)}
                  disabled={idx === 0}
                  title="Move question up"
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveQuestion(q._key, 1)}
                  disabled={idx === questions.length - 1}
                  title="Move question down"
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : q._key)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => removeQuestion(q._key)}
                  title="Remove question"
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Expanded editor */}
            {isOpen && (
              <div className="border-t border-gray-100 px-4 py-4 space-y-3.5 bg-gray-50/70">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-700 font-semibold mb-1 block">Speaker Name</label>
                    <input
                      type="text"
                      value={q.speaker_name}
                      onChange={(e) => updateQuestion(q._key, 'speaker_name', e.target.value)}
                      placeholder="Interviewer"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[var(--primary)] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 font-semibold mb-1 block">
                      <Clock size={12} className="inline mr-1 text-gray-500" />
                      Time Limit (seconds)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={600}
                      value={q.time_limit_seconds}
                      onChange={(e) => updateQuestion(q._key, 'time_limit_seconds', parseInt(e.target.value) || 120)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[var(--primary)] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-semibold mb-1 block">
                    Question / Spoken Text *
                  </label>
                  <textarea
                    value={q.question_text}
                    onChange={(e) => updateQuestion(q._key, 'question_text', e.target.value)}
                    placeholder="Type the exact question the interviewer will speak aloud..."
                    rows={3}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[var(--primary)] transition-all resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-gray-800 font-bold flex items-center gap-1.5">
                      <Sparkles size={13} className="text-emerald-600" />
                      Ideal Answer Blueprint & Evaluation Criteria
                    </label>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                      Used by AI Assessor
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-sub)] mb-1.5 leading-tight">
                    Specify what points a top answer should hit (e.g. STAR structure, metrics, technical decisions, what to avoid).
                  </p>
                  <textarea
                    value={q.expected_answer_hint}
                    onChange={(e) => updateQuestion(q._key, 'expected_answer_hint', e.target.value)}
                    placeholder="Ideal Answer Blueprint (STAR Method):&#10;• Situation & Task: Concise context and goal&#10;• Action: Specific technical or management choices made&#10;• Result: Quantified impact and learnings"
                    rows={4}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[var(--primary)] transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addQuestion}
        className="w-full py-3 border-2 border-dashed border-[var(--primary)]/30 rounded-2xl text-[var(--primary)] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[var(--primary-soft)] hover:border-[var(--primary)]/60 transition-all cursor-pointer"
      >
        <Plus size={16} />
        <span>Add Question</span>
      </button>
    </div>
  );
}
