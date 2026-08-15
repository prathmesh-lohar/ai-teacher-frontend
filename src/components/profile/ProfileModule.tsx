'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Briefcase, 
  Globe, 
  GraduationCap, 
  Tag, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Plus, 
  X, 
  ShieldCheck, 
  Clock, 
  Camera,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CEFRLevel } from '@/types/auth';

const CEFR_OPTIONS: { level: CEFRLevel; title: string; desc: string }[] = [
  { level: 'A1', title: 'A1 - Beginner', desc: 'Basic greetings and simple everyday phrases' },
  { level: 'A2', title: 'A2 - Elementary', desc: 'Simple everyday conversations and routines' },
  { level: 'B1', title: 'B1 - Intermediate', desc: 'Comfortable with work, travel, and opinions' },
  { level: 'B2', title: 'B2 - Upper Intermediate', desc: 'Spontaneous fluency and technical discussions' },
  { level: 'C1', title: 'C1 - Advanced', desc: 'Nuanced, flexible expression in professional contexts' },
  { level: 'C2', title: 'C2 - Proficient', desc: 'Effortless native-like communication' },
];

const SUGGESTED_INTERESTS = [
  'Technology', 'Software Engineering', 'AI & Machine Learning',
  'Job Interviews', 'Public Speaking', 'Travel & Culture',
  'Business English', 'Daily Conversations', 'Finance & Markets',
  'Science & Health', 'Creative Writing', 'Leadership'
];

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Prathmesh',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
];

export function ProfileModule() {
  const { user, updateProfile, isApproved, logout } = useAuth();

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [englishLevel, setEnglishLevel] = useState<CEFRLevel>('B1');
  const [nativeLanguage, setNativeLanguage] = useState('Hindi');
  const [occupation, setOccupation] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState('');

  // Input helpers for tags
  const [newInterestInput, setNewInterestInput] = useState('');
  const [newGoalInput, setNewGoalInput] = useState('');

  // UI state
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state with current user
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
      setEnglishLevel(user.profile?.english_level || 'B1');
      setNativeLanguage(user.profile?.native_language || 'Hindi');
      setOccupation(user.profile?.occupation || '');
      setInterests(user.profile?.interests || []);
      setGoals(user.profile?.goals || []);
      setAvatarUrl(user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`);
    }
  }, [user]);

  const handleAddInterest = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setNewInterestInput('');
    }
  };

  const handleRemoveInterest = (tagToRemove: string) => {
    setInterests(interests.filter((t) => t !== tagToRemove));
  };

  const handleAddGoal = (goalToAdd: string) => {
    const trimmed = goalToAdd.trim();
    if (trimmed && !goals.includes(trimmed)) {
      setGoals([...goals, trimmed]);
      setNewGoalInput('');
    }
  };

  const handleRemoveGoal = (goalToRemove: string) => {
    setGoals(goals.filter((g) => g !== goalToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        email: email,
        english_level: englishLevel,
        native_language: nativeLanguage,
        occupation: occupation,
        interests: interests,
        goals: goals,
        avatar_url: avatarUrl,
      });

      setSuccessMessage('Profile updated successfully! Your tutor context has been updated.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-[var(--primary)] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 z-10 relative">
          {/* Avatar with preset quick selector */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 backdrop-blur-md p-1 border-4 border-white/80 shadow-2xl overflow-hidden shrink-0">
              <img 
                src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`} 
                alt="Profile Avatar" 
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>
            <div className="absolute -bottom-2 -right-1 bg-white text-gray-800 p-1.5 rounded-full shadow-md">
              <Camera size={14} />
            </div>
          </div>

          {/* User Meta */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {firstName || lastName ? `${firstName} ${lastName}`.trim() : user?.username}
              </h1>

              {/* Status Badge */}
              {isApproved ? (
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-400/20 border border-emerald-300 text-emerald-100 shadow-sm backdrop-blur-md">
                  <ShieldCheck size={14} />
                  Approved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 border border-amber-300 text-amber-100 shadow-sm backdrop-blur-md">
                  <Clock size={14} />
                  Pending Approval
                </span>
              )}
            </div>

            <p className="text-white/80 text-sm flex items-center justify-center sm:justify-start gap-2">
              <span>@{user?.username}</span>
              <span>•</span>
              <span>{email || 'No email set'}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="px-3 py-1 rounded-xl bg-white/15 text-xs font-semibold backdrop-blur-md border border-white/20">
                🎯 Level: {englishLevel}
              </span>
              <span className="px-3 py-1 rounded-xl bg-white/15 text-xs font-semibold backdrop-blur-md border border-white/20">
                🗣️ Native: {nativeLanguage}
              </span>
              {occupation && (
                <span className="px-3 py-1 rounded-xl bg-white/15 text-xs font-semibold backdrop-blur-md border border-white/20">
                  💼 {occupation}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Avatar Preset Quick Chooser */}
        <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-white/70 font-medium">Choose Avatar:</span>
          {AVATAR_PRESETS.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setAvatarUrl(url)}
              className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${avatarUrl === url ? 'border-white scale-110 ring-2 ring-white/50' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full bg-white" />
            </button>
          ))}
        </div>
      </div>

      {/* Alert Banners */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 shadow-sm"
          >
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3 shadow-sm"
          >
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Basic Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Personal Information</h2>
              <p className="text-xs text-gray-500">Your public identity and contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full bg-gray-50/80 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Morgan"
                className="w-full bg-gray-50/80 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Username (Permanent)</label>
              <input
                type="text"
                disabled
                value={user?.username || ''}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm text-gray-500 font-medium cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Language Fluency & Learning Level */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <GraduationCap size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Language Fluency & Tutor Context</h2>
              <p className="text-xs text-gray-500">The AI adapts conversation complexity, speech speed, and feedback to these parameters</p>
            </div>
          </div>

          {/* CEFR Level Selection Grid */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">Current English CEFR Proficiency</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {CEFR_OPTIONS.map((item) => {
                const isSelected = englishLevel === item.level;
                return (
                  <div
                    key={item.level}
                    onClick={() => setEnglishLevel(item.level)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[var(--primary)] bg-blue-50/50 shadow-sm'
                        : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isSelected ? 'text-[var(--primary)]' : 'text-gray-800'}`}>
                        {item.title}
                      </span>
                      {isSelected && <CheckCircle2 size={16} className="text-[var(--primary)]" />}
                    </div>
                    <p className="text-[11px] text-gray-500 leading-tight">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Native Language</label>
              <div className="relative">
                <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={nativeLanguage}
                  onChange={(e) => setNativeLanguage(e.target.value)}
                  placeholder="e.g. Hindi, Spanish, French..."
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all font-medium"
                />
              </div>
              <p className="text-[10px] text-gray-400">Used by AI for dual-language explanations and phonetic hints</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Occupation / Career Goal</label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="e.g. Software Engineer, Doctor, Student..."
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all font-medium"
                />
              </div>
              <p className="text-[10px] text-gray-400">Enables roleplay interview scenarios customized to your industry</p>
            </div>
          </div>
        </div>

        {/* Card 3: Interests & Discussion Topics */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Tag size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Interests & Discussion Topics</h2>
              <p className="text-xs text-gray-500">Topics the AI tutor will naturally weave into conversational practice</p>
            </div>
          </div>

          {/* Current Interest Chips */}
          <div className="flex flex-wrap gap-2 min-h-[42px] p-3 bg-gray-50/70 border border-gray-200 rounded-2xl">
            {interests.length === 0 ? (
              <span className="text-xs text-gray-400 italic">No topics selected yet. Add some below!</span>
            ) : (
              interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-800 shadow-sm"
                >
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Add custom interest input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newInterestInput}
              onChange={(e) => setNewInterestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddInterest(newInterestInput);
                }
              }}
              placeholder="Type custom topic (e.g. Quantum Computing) and press Add..."
              className="flex-1 bg-gray-50/80 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
            />
            <button
              type="button"
              onClick={() => handleAddInterest(newInterestInput)}
              className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 flex items-center gap-1.5 transition-all"
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          {/* Suggested quick add tags */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Suggested Topics:</span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_INTERESTS.filter((t) => !interests.includes(t)).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddInterest(tag)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-[var(--primary)] border border-gray-200 text-gray-600 transition-all font-medium"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 4: Learning Goals */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Target size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Key Learning Goals</h2>
              <p className="text-xs text-gray-500">What specific skills you want the AI tutor to test and evaluate</p>
            </div>
          </div>

          <div className="space-y-2">
            {goals.map((goal, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-800"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{goal}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveGoal(goal)}
                  className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newGoalInput}
                onChange={(e) => setNewGoalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGoal(newGoalInput);
                  }
                }}
                placeholder="e.g. Master answering behavioral interview questions..."
                className="flex-1 bg-gray-50/80 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
              />
              <button
                type="button"
                onClick={() => handleAddGoal(newGoalInput)}
                className="px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 flex items-center gap-1.5 transition-all"
              >
                <Plus size={14} />
                Add Goal
              </button>
            </div>
          </div>
        </div>

        {/* Submit Actions Bar */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 font-semibold text-xs transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-bold text-sm shadow-md shadow-[var(--primary)]/20 hover:opacity-95 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ProfileModule;
