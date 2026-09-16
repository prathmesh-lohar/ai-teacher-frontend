'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Briefcase,
  Eye,
  Sparkles,
  Wand2,
  Bot,
  CheckCircle2,
  AlertCircle,
  Settings,
  Layers
} from 'lucide-react';
import { createModule, updateModule, generateScriptWithAI } from '@/services/interviewService';
import { getStoredTokens } from '@/services/api';
import { API_BASE_URL } from '@/config/env';
import type { InterviewModule, InterviewModulePayload, ExperienceLevel } from '@/types/interview';
import ScriptEditor, { emptyQuestion, makeKey } from './ScriptEditor';

type DraftQuestion = ReturnType<typeof emptyQuestion>;

const FIELD_OPTIONS = [
  'all',
  'Technology & Software',
  'Healthcare & Medicine',
  'Finance & Banking',
  'Sales & Marketing',
  'Education',
  'Operations & Logistics',
  'Legal',
  'Human Resources',
  'Custom',
];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: 'entry', label: 'Entry Level (0–2 yrs)' },
  { value: 'mid', label: 'Mid Level (3–5 yrs)' },
  { value: 'senior', label: 'Senior (6–10 yrs)' },
  { value: 'lead_exec', label: 'Lead / Executive (10+ yrs)' },
];

const INTERVIEW_TYPE_OPTIONS = [
  'Behavioral (STAR Method)',
  'Technical & Domain',
  'System Design & Case Study',
  'HR Screening',
  'Leadership & Management',
  'Salary Negotiation',
];

const QUESTION_COUNT_PRESETS = [3, 5, 7, 10];

interface ModuleCreatorProps {
  editingModule?: InterviewModule | null;
  initialStep?: number;
  onClose: () => void;
  onSaved: () => void;
}

export default function ModuleCreator({
  editingModule,
  initialStep = 0,
  onClose,
  onSaved,
}: ModuleCreatorProps) {
  const [step, setStep] = useState(initialStep);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialStep !== undefined) {
      setStep(initialStep);
    }
  }, [initialStep]);

  // Step 1 — Info state
  const [title, setTitle] = useState(editingModule?.title || '');
  const [description, setDescription] = useState(editingModule?.description || '');
  const [field, setField] = useState(editingModule?.field || 'Technology & Software');
  const [customField, setCustomField] = useState('');
  const [targetRole, setTargetRole] = useState(editingModule?.target_role || '');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(editingModule?.experience_level || 'mid');
  const [interviewTypes, setInterviewTypes] = useState<string[]>(editingModule?.interview_types || []);
  const [interviewerName, setInterviewerName] = useState(editingModule?.interviewer_name || 'Interviewer');
  const [isPublished, setIsPublished] = useState(editingModule?.is_published || false);

  // Step 2 — Script state
  const [questions, setQuestions] = useState<DraftQuestion[]>(
    editingModule?.questions?.map((q) => ({ ...q, _key: makeKey() })) || []
  );

  // AI Script Generation state
  const [showAiGenerator, setShowAiGenerator] = useState<boolean>(true);
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(5);
  const [aiFocusInstructions, setAiFocusInstructions] = useState<string>('');
  const [aiReplaceMode, setAiReplaceMode] = useState<'replace' | 'append'>('replace');
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string>('');
  const [aiErrorMessage, setAiErrorMessage] = useState<string>('');

  const toggleType = (t: string) => {
    setInterviewTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const effectiveField = field === 'Custom' ? customField : field;

  const stepTabs = [
    { id: 0, label: '1. Module Info', icon: Settings },
    { id: 1, label: '2. Script & AI Generator', icon: Sparkles, isAi: true },
    { id: 2, label: '3. Review & Publish', icon: CheckCircle2 },
  ];

  const canProceedStep0 = title.trim().length > 0 && effectiveField.trim().length > 0;
  const canProceedStep1 = questions.length > 0 && questions.every((q) => q.question_text.trim());

  const handleGenerateScriptWithAi = async () => {
    setIsGeneratingScript(true);
    setAiErrorMessage('');
    setAiSuccessMessage('');
    try {
      const payload = {
        title: title.trim() || targetRole.trim() || 'Interview Practice',
        field: effectiveField.trim() || 'Technology & Software',
        target_role: targetRole.trim() || title.trim() || 'Professional',
        experience_level: experienceLevel,
        interview_types: interviewTypes.length > 0 ? interviewTypes : ['Behavioral (STAR Method)', 'Technical & Domain'],
        interviewer_name: interviewerName.trim() || 'Interviewer',
        description: description.trim(),
        question_count: aiQuestionCount,
        focus_instructions: aiFocusInstructions.trim(),
      };

      let res: { questions: any[]; source?: string };

      if (typeof generateScriptWithAI === 'function') {
        res = await generateScriptWithAI(payload);
      } else {
        // Direct fetch fallback in case Turbopack client module cache is stale
        const { access } = getStoredTokens();
        const raw = await fetch(`${API_BASE_URL}/api/interview/modules/generate-script/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(access ? { Authorization: `Bearer ${access}` } : {}),
          },
          body: JSON.stringify(payload),
        });
        if (!raw.ok) {
          const errData = await raw.json().catch(() => ({}));
          throw new Error(errData?.error || errData?.detail || `HTTP ${raw.status}`);
        }
        res = await raw.json();
      }

      const newQuestions: DraftQuestion[] = res.questions.map((q: any, idx: number) => ({
        _key: makeKey(),
        order: aiReplaceMode === 'replace' ? idx : questions.length + idx,
        speaker_name: q.speaker_name || interviewerName.trim() || 'Interviewer',
        question_text: q.question_text,
        expected_answer_hint: q.expected_answer_hint || '',
        time_limit_seconds: q.time_limit_seconds || 120,
      }));

      if (aiReplaceMode === 'replace' || questions.length === 0) {
        setQuestions(newQuestions);
      } else {
        setQuestions((prev) => [...prev, ...newQuestions]);
      }

      setAiSuccessMessage(
        `Generated ${newQuestions.length} interview questions with ideal answers based on ${targetRole || title || 'module details'}!`
      );
    } catch (err: any) {
      setAiErrorMessage(err.message || 'Failed to generate script with AI. Please try again.');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload: InterviewModulePayload = {
        title: title.trim() || (targetRole ? `${targetRole} Interview` : 'Interview Practice Session'),
        description: description.trim(),
        module_type: 'single',
        field: effectiveField.trim() || 'General',
        target_role: targetRole.trim() || title.trim() || 'Candidate',
        experience_level: experienceLevel,
        interview_types: interviewTypes,
        interviewer_name: interviewerName.trim() || 'Interviewer',
        is_published: isPublished,
        questions: questions.map((q, i) => ({
          order: i,
          speaker_name: q.speaker_name,
          question_text: q.question_text,
          expected_answer_hint: q.expected_answer_hint,
          time_limit_seconds: q.time_limit_seconds,
        })),
      };

      if (editingModule) {
        await updateModule(editingModule.id, payload);
      } else {
        await createModule(payload);
      }
      onSaved();
    } catch (e: any) {
      setError(e.message || 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl bg-white border border-gray-100 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center font-bold">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {editingModule ? 'Edit Interview Module' : 'Create Interview Module'}
              </h2>
              <p className="text-[var(--text-sub)] text-xs">
                Configure module details and generate interview scripts with ideal answers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Clickable Step Navigation Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 px-6 py-2 gap-2 shrink-0 overflow-x-auto">
          {stepTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = step === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStep(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-white text-[var(--primary)] shadow-xs border border-gray-200'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-[var(--primary)]' : 'text-gray-400'} />
                <span>{tab.label}</span>
                {tab.isAi && (
                  <span className="text-[10px] bg-[var(--primary)] text-white px-1.5 py-0.2 rounded-full font-extrabold uppercase tracking-wide">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
          <AnimatePresence mode="wait">
            {/* ── STEP 0: Module Info ─────────────────────────────────── */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-4"
              >
                {/* AI Quick Callout Banner */}
                <div className="bg-gradient-to-r from-[var(--primary-soft)] via-blue-50/80 to-indigo-50/50 border border-[var(--primary)]/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Want AI to generate the script & ideal answers?</p>
                      <p className="text-[11px] text-[var(--text-sub)]">
                        Fill in your target role and field below, then jump straight to the AI Generator!
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-3 py-1.5 bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] text-xs font-semibold rounded-xl shrink-0 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Sparkles size={13} />
                    <span>Go to AI Generator</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-gray-700 font-semibold mb-1.5">
                    Module Title *
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Software Engineer Behavioral & Technical Round"
                    className="admin-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 font-semibold mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What will the candidate practice in this interview session?"
                    rows={2}
                    className="admin-input w-full resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-700 font-semibold mb-1.5">
                      Career Field *
                    </label>
                    <select
                      value={field}
                      onChange={(e) => setField(e.target.value)}
                      className="admin-input w-full"
                    >
                      {FIELD_OPTIONS.map((f) => (
                        <option key={f} value={f}>
                          {f === 'all' ? 'All Fields (General)' : f}
                        </option>
                      ))}
                    </select>
                    {field === 'Custom' && (
                      <input
                        value={customField}
                        onChange={(e) => setCustomField(e.target.value)}
                        placeholder="Enter custom field name…"
                        className="admin-input w-full mt-2"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 font-semibold mb-1.5">
                      Target Role
                    </label>
                    <input
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer / Product Manager"
                      className="admin-input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-700 font-semibold mb-2">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setExperienceLevel(opt.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all border cursor-pointer ${
                          experienceLevel === opt.value
                            ? 'bg-[var(--primary-soft)] border-[var(--primary)] text-[var(--primary)] font-semibold shadow-xs'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-700 font-semibold mb-2">
                    Interview Type Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INTERVIEW_TYPE_OPTIONS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleType(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border cursor-pointer ${
                          interviewTypes.includes(t)
                            ? 'bg-[var(--primary-soft)] border-[var(--primary)] text-[var(--primary)] font-semibold'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-700 font-semibold mb-1.5">
                    Interviewer Name
                  </label>
                  <input
                    value={interviewerName}
                    onChange={(e) => setInterviewerName(e.target.value)}
                    placeholder="Interviewer"
                    className="admin-input w-full"
                  />
                </div>
              </motion.div>
            )}

            {/* ── STEP 1: Script & AI Generator ──────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-5"
              >
                {/* PROMINENT AI SCRIPT GENERATOR BOX */}
                <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 border-2 border-[var(--primary)]/40 rounded-3xl p-5 shadow-sm">
                  {/* Title & Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-indigo-600 text-white flex items-center justify-center shadow-sm">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900">
                            AI Script & Ideal Answer Generator
                          </h3>
                          <span className="text-[10px] font-extrabold bg-[var(--primary)] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Ready
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-sub)] mt-0.5">
                          Automatically crafts spoken questions and comprehensive STAR ideal answers tailored to this module.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Context Summary Tag Bar */}
                  <div className="bg-white/90 border border-gray-200/80 rounded-xl px-3 py-2 text-xs text-gray-700 flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">
                    <span><strong>Role:</strong> {targetRole || title || 'Professional'}</span>
                    <span className="text-gray-300">•</span>
                    <span><strong>Field:</strong> {effectiveField}</span>
                    <span className="text-gray-300">•</span>
                    <span><strong>Level:</strong> {experienceLevel}</span>
                    {interviewTypes.length > 0 && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span><strong>Focus:</strong> {interviewTypes.join(', ')}</span>
                      </>
                    )}
                  </div>

                  {/* Generator Controls */}
                  <div className="space-y-3.5">
                    {/* Number of Questions Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-gray-800">
                          How many questions do you want to generate?
                        </label>
                        <span className="text-xs font-extrabold text-[var(--primary)] bg-[var(--primary-soft)] px-2.5 py-0.5 rounded-full">
                          {aiQuestionCount} Question{aiQuestionCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {QUESTION_COUNT_PRESETS.map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setAiQuestionCount(count)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              aiQuestionCount === count
                                ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {count} Questions
                          </button>
                        ))}
                        <div className="flex items-center gap-1.5 ml-auto">
                          <span className="text-xs text-gray-500 font-medium">Custom count:</span>
                          <input
                            type="number"
                            min={1}
                            max={15}
                            value={aiQuestionCount}
                            onChange={(e) => setAiQuestionCount(Math.max(1, Math.min(15, parseInt(e.target.value) || 1)))}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded-lg text-center font-bold text-gray-900 bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Focus instructions */}
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        Special Focus or Domain Topics <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={aiFocusInstructions}
                        onChange={(e) => setAiFocusInstructions(e.target.value)}
                        placeholder="e.g. Focus on technical architecture, conflict resolution, and leadership STAR examples..."
                        className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>

                    {/* Mode if questions already exist */}
                    {questions.length > 0 && (
                      <div className="flex items-center gap-4 text-xs text-gray-700 bg-white/70 p-2 rounded-xl border border-gray-100">
                        <span className="font-bold text-gray-800">Action:</span>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="aiReplaceMode"
                            checked={aiReplaceMode === 'replace'}
                            onChange={() => setAiReplaceMode('replace')}
                            className="text-[var(--primary)]"
                          />
                          <span>Replace {questions.length} existing question{questions.length !== 1 ? 's' : ''}</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="aiReplaceMode"
                            checked={aiReplaceMode === 'append'}
                            onChange={() => setAiReplaceMode('append')}
                            className="text-[var(--primary)]"
                          />
                          <span>Append to existing</span>
                        </label>
                      </div>
                    )}

                    {/* Error & Success Messages */}
                    {aiErrorMessage && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                        <span>{aiErrorMessage}</span>
                      </div>
                    )}
                    {aiSuccessMessage && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <span>{aiSuccessMessage}</span>
                      </div>
                    )}

                    {/* Primary Generator Action Button */}
                    <button
                      type="button"
                      onClick={handleGenerateScriptWithAi}
                      disabled={isGeneratingScript}
                      className="w-full py-3 px-4 bg-gradient-to-r from-[var(--primary)] to-indigo-600 hover:from-[var(--primary-hover)] hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isGeneratingScript ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>AI is generating {aiQuestionCount} questions & ideal answers...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={17} />
                          <span>Generate {aiQuestionCount} Questions & Ideal Answers with AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Question editor section */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Module Script ({questions.length} Question{questions.length !== 1 ? 's' : ''})
                    </h4>
                    <span className="text-[11px] text-[var(--text-sub)]">
                      Click any question to view or edit the ideal answer guide
                    </span>
                  </div>
                  <ScriptEditor questions={questions} onChange={setQuestions} />
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Review & Publish ───────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-4"
              >
                {/* Summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
                  <h3 className="text-gray-900 font-bold text-sm">{title || 'Untitled Module'}</h3>
                  <p className="text-[var(--text-sub)] text-xs leading-relaxed">{description || '—'}</p>
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    <span className="bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {effectiveField}
                    </span>
                    {targetRole && (
                      <span className="bg-gray-200/80 text-gray-700 text-xs px-2.5 py-1 rounded-lg">
                        {targetRole}
                      </span>
                    )}
                    <span className="bg-gray-200/80 text-gray-700 text-xs px-2.5 py-1 rounded-lg capitalize">
                      {experienceLevel}
                    </span>
                    <span className="bg-gray-200/80 text-gray-700 text-xs px-2.5 py-1 rounded-lg">
                      {questions.length} question{questions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Script & Ideal Answer Preview */}
                <div>
                  <p className="text-xs text-gray-700 font-semibold mb-2 flex items-center gap-1.5">
                    <Eye size={13} className="text-[var(--primary)]" /> Script & Ideal Answer Preview
                  </p>
                  <div className="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                    {questions.map((q, i) => (
                      <div key={q._key} className="flex gap-3 items-start">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-xs text-[var(--text-sub)] font-semibold">{q.speaker_name}</p>
                            <span className="text-[10px] text-gray-500 font-mono">{q.time_limit_seconds}s limit</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{q.question_text}</p>
                          {q.expected_answer_hint && (
                            <div className="mt-1.5 pt-1.5 border-t border-gray-200/70 text-[11px] text-emerald-800 bg-emerald-50/50 p-1.5 rounded-lg">
                              <span className="font-semibold text-emerald-900">Ideal Answer Guide: </span>
                              <span className="line-clamp-2">{q.expected_answer_hint}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Publish toggle */}
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-sm text-gray-900 font-semibold">Publish Module Immediately</p>
                    <p className="text-xs text-[var(--text-sub)]">
                      Make this module active and visible in candidates' Interview Hub
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPublished((p) => !p)}
                    className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                      isPublished ? 'bg-[var(--primary)]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-xs ${
                        isPublished ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                    {error}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
          <button
            type="button"
            onClick={step === 0 ? onClose : () => setStep((s) => s - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all text-sm font-medium cursor-pointer"
          >
            <ChevronLeft size={16} />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-60 text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <>
                  <Check size={16} />
                  <span>{editingModule ? 'Save Changes' : 'Create Module'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>

      <style jsx global>{`
        .admin-input {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 8px 12px;
          font-size: 14px;
          color: #1F2937;
          outline: none;
          transition: border-color 0.15s, background-color 0.15s, box-shadow 0.15s;
        }
        .admin-input:focus {
          border-color: var(--primary);
          background: #FFFFFF;
          box-shadow: 0 0 0 2px rgba(0, 118, 159, 0.1);
        }
        .admin-input::placeholder {
          color: #9CA3AF;
        }
        .admin-input option {
          background: #FFFFFF;
          color: #1F2937;
        }
      `}</style>
    </div>
  );
}
