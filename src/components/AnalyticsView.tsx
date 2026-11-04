import React from 'react';
import {
  Clock,
  CheckCircle2,
  Award,
  Flame,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AnalyticsSummary } from '../services/analyticsService';
import { Achievement, Skill } from '../types';

interface AnalyticsViewProps {
  analytics: AnalyticsSummary | null;
  achievements: Achievement[];
  skills: Skill[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  achievements,
  skills,
}) => {
  const unlockedAchievements = achievements.filter((a) => a.unlockedAt);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          Personal Study Analytics
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Measurable, verified learning metrics calculated in real-time from your local offline database.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Study Time</span>
            <Clock size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {analytics?.totalStudyMinutes || 0} <span className="text-xs font-normal text-stone-400">Min</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Across {analytics?.totalSessionsCount || 0} tracked sessions
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Lessons Finished</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {analytics?.completedLessonsCount || 0}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {analytics?.completedCoursesCount || 0} complete courses
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Quiz Score</span>
            <Award size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {analytics?.averageQuizScore || 0}%
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {analytics?.totalQuizAttemptsCount || 0} total evaluations
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Streak</span>
            <Flame size={16} className="text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {analytics?.studyStreakDays || 1} <span className="text-xs font-normal text-stone-400">Days</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Consistency momentum</div>
        </div>
      </div>

      {/* Skills Matrix Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <Layers size={16} className="text-amber-600" />
          <span>Competency Level Distribution ({skills.length} Skills)</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          {(['not_started', 'learning', 'practicing', 'demonstrated', 'mastered'] as const).map(
            (lvl) => {
              const count = skills.filter((s) => s.level === lvl).length;
              const percent = skills.length > 0 ? Math.round((count / skills.length) * 100) : 0;
              return (
                <div key={lvl} className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="text-xl font-bold text-stone-900">{count}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mt-1">
                    {lvl.replace('_', ' ')}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">{percent}% of total</div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Unlocked Achievements Showcase */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-600" />
            <span>Learning Milestones & Achievements</span>
          </h2>
          <span className="text-xs font-semibold text-stone-500">
            {unlockedAchievements.length} of {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = Boolean(ach.unlockedAt);
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border flex items-start gap-3 transition ${
                  isUnlocked
                    ? 'bg-amber-50/40 border-amber-200 text-stone-900'
                    : 'bg-stone-50/50 border-stone-200 text-stone-400 opacity-60'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    isUnlocked ? 'bg-amber-500 text-white shadow-2xs' : 'bg-stone-200 text-stone-400'
                  }`}
                >
                  <Award size={18} />
                </div>
                <div>
                  <div className="font-bold text-xs">{ach.title}</div>
                  <div className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                    {ach.description}
                  </div>
                  <div className="text-[10px] font-semibold mt-2">
                    {isUnlocked ? (
                      <span className="text-emerald-700">
                        Unlocked on {new Date(ach.unlockedAt!).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-stone-400">
                        Progress: {ach.progressCurrent} / {ach.progressTarget}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
