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
  LogOut,
  Compass,
  Award,
  Layers,
  Sparkles,
  Check,
  Cpu
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

// Pre-configured domains (supports any custom user domain as well)
const POPULAR_FIELDS = [
  'Technology & Software',
  'Healthcare & Medicine',
  'Finance & Banking',
  'Sales & Marketing',
  'Human Resources',
  'Operations & Logistics',
  'Education & Teaching',
  'Engineering & Architecture',
  'Legal & Compliance',
  'Creative & Design',
  'Customer Support',
  'Other / Custom Field',
];

const FIELD_ROLE_SUGGESTIONS: Record<string, string[]> = {
  'Technology & Software': ['Full Stack Engineer', 'Frontend Developer', 'Backend Engineer', 'DevOps Specialist', 'Data Scientist', 'Product Manager', 'Mobile App Developer'],
  'Healthcare & Medicine': ['Registered Nurse', 'Clinical Pharmacist', 'Physician / Resident', 'Medical Lab Scientist', 'Healthcare Administrator', 'Physiotherapist'],
  'Finance & Banking': ['Financial Analyst', 'Investment Banker', 'Chartered Accountant / Auditor', 'Risk & Compliance Analyst', 'Tax Consultant', 'Wealth Manager'],
  'Sales & Marketing': ['Account Executive', 'Digital Marketing Specialist', 'Business Development Rep', 'Product Marketing Manager', 'Brand Strategist', 'Sales Director'],
  'Human Resources': ['HR Generalist', 'Technical Recruiter', 'Talent Acquisition Partner', 'People Operations Lead', 'HR Business Partner'],
  'Operations & Logistics': ['Operations Manager', 'Supply Chain Analyst', 'Logistics Coordinator', 'Procurement Specialist', 'Continuous Improvement Lead'],
  'Education & Teaching': ['High School Teacher', 'University Lecturer', 'Instructional Designer', 'Special Education Teacher', 'Academic Counselor'],
  'Engineering & Architecture': ['Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer', 'Chemical Process Engineer', 'Quality Assurance Engineer'],
  'Legal & Compliance': ['Corporate Counsel', 'Legal Associate', 'Compliance Officer', 'Contract Specialist', 'Paralegal'],
  'Creative & Design': ['UI/UX Designer', 'Product Designer', 'Graphic Designer', 'Art Director', 'Content Strategist'],
  'Customer Support': ['Customer Success Manager', 'Support Team Lead', 'Client Relationship Specialist', 'Technical Support Engineer'],
  'Other / Custom Field': ['Project Manager', 'Operations Lead', 'Management Consultant', 'Executive Director'],
};

const FIELD_SKILL_SUGGESTIONS: Record<string, string[]> = {
  'Technology & Software': ['TypeScript', 'React', 'Node.js', 'Python', 'System Design', 'SQL & Databases', 'Docker & K8s', 'REST APIs', 'Cloud (AWS/GCP)', 'CI/CD'],
  'Healthcare & Medicine': ['Patient Assessment', 'Clinical Triage', 'Medication Administration', 'EMR Systems', 'Infection Control', 'BLS / ACLS', 'Compassionate Care', 'Diagnostic Support'],
  'Finance & Banking': ['Financial Modeling', 'DCF Valuation', 'Data Analysis (SQL/Excel)', 'Risk Assessment', 'Budgeting & Forecasting', 'GAAP / IFRS', 'Audit Compliance', 'Portfolio Management'],
  'Sales & Marketing': ['B2B Lead Generation', 'Client Pitching', 'CRM (Salesforce/HubSpot)', 'Content Strategy', 'SEO & SEM', 'Objection Handling', 'Contract Negotiation', 'Campaign ROI'],
  'Human Resources': ['Talent Acquisition', 'Employee Relations', 'HRIS Systems', 'Performance Management', 'Labor Law Compliance', 'Onboarding & Culture', 'Diversity & Inclusion'],
  'Operations & Logistics': ['Process Optimization', 'Supply Chain Management', 'Inventory Control', 'Six Sigma / Lean', 'Vendor Negotiation', 'Logistics Scheduling', 'Warehouse Operations'],
  'Education & Teaching': ['Curriculum Development', 'Classroom Management', 'Differentiated Instruction', 'Student Assessment', 'EdTech Tools', 'Active Listening', 'Lesson Planning'],
  'Engineering & Architecture': ['CAD & 3D Modeling', 'Structural Analysis', 'Quality Assurance', 'Project Scheduling', 'Technical Documentation', 'Safety Standards', 'Site Inspection'],
  'Legal & Compliance': ['Contract Drafting', 'Legal Research', 'Regulatory Compliance', 'Risk Mitigation', 'Due Diligence', 'Dispute Resolution', 'Ethics & Compliance'],
  'Creative & Design': ['Figma / UI Design', 'User Research & Prototyping', 'Visual Storytelling', 'Adobe Creative Suite', 'Typography & Layout', 'Design Systems', 'Motion Design'],
  'Customer Support': ['Customer De-escalation', 'Zendesk / Freshdesk', 'Technical Troubleshooting', 'SLA Management', 'Active Listening', 'Empathetic Communication', 'Ticket Resolution'],
  'Other / Custom Field': ['Project Management', 'Stakeholder Communication', 'Strategic Planning', 'Problem Solving', 'Team Leadership', 'Cross-Functional Collaboration', 'Agile / Scrum'],
};

const EXPERIENCE_LEVELS = [
  { id: 'entry', title: 'Fresher / Entry (0-2 yrs)', desc: 'Foundations, learning agility, academic projects & internships' },
  { id: 'mid', title: 'Mid-Level (3-5 yrs)', desc: 'Independent execution, ownership, proven impact & team collaboration' },
  { id: 'senior', title: 'Senior (6-10 yrs)', desc: 'Complex problem-solving, architectural mastery & mentoring' },
  { id: 'lead_exec', title: 'Lead / Executive (10+ yrs)', desc: 'Strategic vision, people leadership, cross-org impact & hiring' },
];

const DEFAULT_INTERVIEW_TYPES = [
  'Behavioral (STAR Method)',
  'Technical & Domain Questions',
  'System & Case Study Analysis',
  'HR & Culture Fit Screening',
  'Leadership & Conflict Handling',
  'Client Pitching & Presentation',
  'Salary & Offer Negotiation',
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

  // Interview Customization State (Supports ANY career field)
  const [interviewField, setInterviewField] = useState('Technology & Software');
  const [isCustomField, setIsCustomField] = useState(false);
  const [customFieldInput, setCustomFieldInput] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [interviewTypes, setInterviewTypes] = useState<string[]>([
    'Behavioral (STAR Method)',
    'Technical & Domain Questions'
  ]);
  const [newInterviewTypeInput, setNewInterviewTypeInput] = useState('');

  // Skills State
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');

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

      // Interview settings sync
      const f = user.profile?.interview_field || 'Technology & Software';
      setInterviewField(f);
      const isKnown = POPULAR_FIELDS.includes(f) && f !== 'Other / Custom Field';
      setIsCustomField(!isKnown);
      if (!isKnown) {
        setCustomFieldInput(f);
      }
      setTargetRole(user.profile?.target_role || user.profile?.occupation || 'Software Engineer');
      setExperienceLevel(user.profile?.experience_level || 'mid');
      if (user.profile?.interview_types && user.profile.interview_types.length > 0) {
        setInterviewTypes(user.profile.interview_types);
      }
      if (user.profile?.skills && user.profile.skills.length > 0) {
        setSkills(user.profile.skills);
      } else {
        // Default smart skill seed based on occupation / field
        setSkills(FIELD_SKILL_SUGGESTIONS[f]?.slice(0, 4) || ['Communication', 'Problem Solving']);
      }
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

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Dynamic role suggestions based on current field
  const currentRoleSuggestions = FIELD_ROLE_SUGGESTIONS[interviewField] || FIELD_ROLE_SUGGESTIONS['Other / Custom Field'] || [];

  // Dynamic skill suggestions based on current field
  const currentSkillSuggestions = FIELD_SKILL_SUGGESTIONS[interviewField] || FIELD_SKILL_SUGGESTIONS['Other / Custom Field'] || [];

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
        interview_field: interviewField,
        target_role: targetRole,
        experience_level: experienceLevel,
        interview_types: interviewTypes,
        skills: skills,
      });

      setSuccessMessage('Profile updated successfully! Your interview and tutor preferences have been saved.');
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
              {interviewField && (
                <span className="px-3 py-1 rounded-xl bg-amber-400/20 text-xs font-semibold backdrop-blur-md border border-amber-300/40 text-amber-100 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-300" />
                  <span>Interview: {targetRole ? `${targetRole} • ` : ''}{interviewField}</span>
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

        {/* Card 3: Interview & Career Preparation (Customized for Any Field) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[var(--primary)] flex items-center justify-center shadow-xs">
                <Briefcase size={19} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">Interview & Career Preparation</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Any Profession
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Tailor which mock interviews, question banks, and roleplay simulations are displayed for you
                </p>
              </div>
            </div>

            {/* Live Profile Target Tag */}
            <div className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs">
              <Sparkles size={13} className="text-amber-500" />
              <span>
                {targetRole || 'Candidate'} • {interviewField || 'General'}
              </span>
            </div>
          </div>

          {/* Sub-section 1: Career Field / Industry (Open to ANY field) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Compass size={14} className="text-blue-500" />
                <span>Career Field / Industry</span>
              </label>
              <span className="text-[11px] text-gray-400">Click a standard domain or type any custom field below</span>
            </div>

            {/* Quick preset industry badges */}
            <div className="flex flex-wrap gap-2">
              {POPULAR_FIELDS.map((f) => {
                const isSelected = interviewField === f || (f === 'Other / Custom Field' && isCustomField);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      if (f === 'Other / Custom Field') {
                        setIsCustomField(true);
                        setInterviewField(customFieldInput || '');
                      } else {
                        setIsCustomField(false);
                        setInterviewField(f);
                        const suggestions = FIELD_ROLE_SUGGESTIONS[f] || [];
                        if (suggestions.length > 0 && (!targetRole || targetRole === 'Software Engineer')) {
                          setTargetRole(suggestions[0]);
                        }
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm shadow-blue-500/20'
                        : 'bg-gray-50/80 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {isSelected && <Check size={12} className="stroke-[3]" />}
                    <span>{f}</span>
                  </button>
                );
              })}
            </div>

            {/* Editable Field Input (Allows literally ANY field name) */}
            <div className="pt-1 space-y-1">
              <label className="text-[11px] font-semibold text-gray-600 block">
                Field Title / Specialty Name:
              </label>
              <div className="relative">
                <Compass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={interviewField}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInterviewField(val);
                    setCustomFieldInput(val);
                    setIsCustomField(!POPULAR_FIELDS.includes(val) || val === 'Other / Custom Field');
                  }}
                  placeholder="e.g. Biotechnology, Aviation, Healthcare, Software Engineering, Civil Engineering..."
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all font-medium"
                />
              </div>
              <p className="text-[10px] text-gray-400">
                You can specify any domain or niche. The AI tutor uses this to customize domain terminology, scenarios, and interview questions.
              </p>
            </div>
          </div>

          {/* Sub-section 2: Target Role / Job Title with Suggestions */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Target size={14} className="text-indigo-500" />
              <span>Target Role / Job Title</span>
            </label>

            <div className="relative">
              <Target size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Registered Nurse, Full Stack Engineer, Financial Analyst, Marketing Lead..."
                className="w-full bg-gray-50/80 border border-gray-200 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all font-medium"
              />
            </div>

            {/* Quick role suggestions for the active field */}
            {currentRoleSuggestions.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Popular Roles in {interviewField || 'this field'}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentRoleSuggestions.map((role) => {
                    const isPicked = targetRole.toLowerCase() === role.toLowerCase();
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setTargetRole(role)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all font-medium cursor-pointer ${
                          isPicked
                            ? 'bg-blue-50 text-[var(--primary)] border-blue-300 font-semibold shadow-xs'
                            : 'bg-gray-100 hover:bg-gray-200/80 text-gray-700 border-gray-200'
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sub-section 3: Experience Level */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Award size={14} className="text-amber-500" />
              <span>Experience Level (Calibrates Interview Question Complexity)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXPERIENCE_LEVELS.map((lvl) => {
                const isSelected = experienceLevel === lvl.id;
                return (
                  <div
                    key={lvl.id}
                    onClick={() => setExperienceLevel(lvl.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[var(--primary)] bg-blue-50/60 ring-2 ring-[var(--primary)]/20 shadow-xs'
                        : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isSelected ? 'text-[var(--primary)]' : 'text-gray-900'}`}>
                        {lvl.title}
                      </span>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                        isSelected ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <Check size={10} className="stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-snug">
                      {lvl.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-section 4: Target Interview Formats / Focus Areas */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Layers size={14} className="text-emerald-600" />
                <span>Interview Focus Formats</span>
              </label>
              <span className="text-[11px] text-gray-400">Select formats you want prioritized in your modules</span>
            </div>

            {/* Selected tags */}
            <div className="flex flex-wrap gap-2 min-h-[42px] p-3 bg-gray-50/70 border border-gray-200 rounded-2xl">
              {interviewTypes.length === 0 ? (
                <span className="text-xs text-gray-400 italic">No formats selected. Pick from suggestions below.</span>
              ) : (
                interviewTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-blue-200 text-xs font-semibold text-blue-800 shadow-xs"
                  >
                    <CheckCircle2 size={12} className="text-blue-600" />
                    <span>{type}</span>
                    <button
                      type="button"
                      onClick={() => setInterviewTypes(interviewTypes.filter((t) => t !== type))}
                      className="text-gray-400 hover:text-red-500 transition-colors ml-0.5 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add custom focus format */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newInterviewTypeInput}
                onChange={(e) => setNewInterviewTypeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newInterviewTypeInput.trim() && !interviewTypes.includes(newInterviewTypeInput.trim())) {
                      setInterviewTypes([...interviewTypes, newInterviewTypeInput.trim()]);
                      setNewInterviewTypeInput('');
                    }
                  }
                }}
                placeholder="Add custom format (e.g. Clinical Triage Simulation, Whiteboard Design)..."
                className="flex-1 bg-gray-50/80 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
              />
              <button
                type="button"
                onClick={() => {
                  if (newInterviewTypeInput.trim() && !interviewTypes.includes(newInterviewTypeInput.trim())) {
                    setInterviewTypes([...interviewTypes, newInterviewTypeInput.trim()]);
                    setNewInterviewTypeInput('');
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={14} />
                Add Format
              </button>
            </div>

            {/* Suggested quick formats */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Suggested Formats:</span>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_INTERVIEW_TYPES.filter((t) => !interviewTypes.includes(t)).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInterviewTypes([...interviewTypes, type])}
                    className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-[var(--primary)] border border-gray-200 text-gray-700 transition-all font-medium cursor-pointer"
                  >
                    + {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sub-section 5: Core Technical & Professional Skills */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Cpu size={14} className="text-violet-600" />
                <span>Core Technical & Professional Skills</span>
              </label>
              <span className="text-[11px] text-gray-400 font-medium">
                {skills.length} {skills.length === 1 ? 'skill' : 'skills'} added
              </span>
            </div>

            {/* Current skill chips */}
            <div className="flex flex-wrap gap-2 min-h-[42px] p-3 bg-gray-50/70 border border-gray-200 rounded-2xl">
              {skills.length === 0 ? (
                <span className="text-xs text-gray-400 italic">No skills added yet. Add your core capabilities below!</span>
              ) : (
                skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-violet-200 text-xs font-semibold text-violet-900 shadow-xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-gray-400 hover:text-red-500 transition-colors ml-0.5 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add custom skill input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(newSkillInput);
                  }
                }}
                placeholder="Type skill name (e.g. Python, Financial Modeling, Clinical Triage) and press Add..."
                className="flex-1 bg-gray-50/80 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(newSkillInput)}
                className="px-4 py-2.5 rounded-xl bg-violet-700 text-white text-xs font-semibold hover:bg-violet-800 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={14} />
                Add Skill
              </button>
            </div>

            {/* Suggested quick skills for current field */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Recommended Skills for {interviewField || 'this field'}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentSkillSuggestions.filter((s) => !skills.includes(s)).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleAddSkill(skill)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-violet-50 hover:text-violet-700 border border-gray-200 text-gray-700 transition-all font-medium cursor-pointer"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Interests & Discussion Topics */}
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

        {/* Card 5: Learning Goals */}
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
