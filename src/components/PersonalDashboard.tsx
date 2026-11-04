import React from 'react';
import {
  BookOpen,
  ArrowRight,
  Flame,
  Award,
  Layers,
  Brain,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  LearningClass,
  Lesson,
  Flashcard,
  Skill,
  CalendarEvent,
} from '../types';
import { AnalyticsSummary } from '../services/analyticsService';

interface PersonalDashboardProps {
  classes: LearningClass[];
  lessons: Lesson[];
  analytics: AnalyticsSummary | null;
  dueCards: Flashcard[];
  skills: Skill[];
  upcomingEvents: CalendarEvent[];
  onOpenClass: (classId: string, lessonId?: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const PersonalDashboard: React.FC<PersonalDashboardProps> = ({
  classes,
  lessons,
  analytics,
  dueCards,
  skills,
  upcomingEvents,
  onOpenClass,
  onNavigateTab,
}) => {
  // Find active classes and their next uncompleted lesson
  const activeCoursesWithNext = classes.slice(0, 3).map((cls) => {
    const courseLessons = lessons.filter((l) => l.classId === cls.id);
    const completedCount = courseLessons.filter((l) => l.isCompleted).length;
    const progressPercent =
      courseLessons.length > 0 ? Math.round((completedCount / courseLessons.length) * 100) : 0;
    const nextLesson = courseLessons.find((l) => !l.isCompleted) || courseLessons[0];

    return {
      cls,
      progressPercent,
      completedCount,
      totalCount: courseLessons.length,
      nextLesson,
    };
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
            <Sparkles size={14} />
            <span>Personal Learning Ecosystem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back to your workspace.
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Your learning materials, practice workbooks, spaced-repetition cards, and skills are
            stored entirely offline in your browser.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => onNavigateTab('classes')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition cursor-pointer shadow-xs"
            >
              <BookOpen size={15} />
              <span>Browse All Classes</span>
            </button>
            {dueCards.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigateTab('flashcards')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-700/80 hover:bg-stone-700 text-white font-medium text-xs transition cursor-pointer"
              >
                <Brain size={15} className="text-amber-400" />
                <span>Review {dueCards.length} Due Cards</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Lessons</span>
            <BookOpen size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {analytics?.completedLessonsCount || 0}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Across {classes.length} active classes
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Study Streak</span>
            <Flame size={16} className="text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {analytics?.studyStreakDays || 1} <span className="text-xs font-normal text-stone-400">Days</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Continuous learning momentum</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Quiz Accuracy</span>
            <Award size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {analytics?.averageQuizScore || 0}%
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            From {analytics?.totalQuizAttemptsCount || 0} attempts
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Skills Tracked</span>
            <Layers size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{skills.length}</div>
          <div className="text-[11px] text-stone-500 mt-1">
            {analytics?.masteredSkillsCount || 0} demonstrated or mastered
          </div>
        </div>
      </div>

      {/* 3. Continue Learning Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-stone-900">Continue Learning</h2>
          <button
            type="button"
            onClick={() => onNavigateTab('classes')}
            className="text-xs font-semibold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {activeCoursesWithNext.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-stone-300 text-center text-xs text-stone-500">
            No enrolled classes yet. Create or import your first class to start tracking progress.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {activeCoursesWithNext.map(({ cls, progressPercent, completedCount, totalCount, nextLesson }) => (
              <div
                key={cls.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 hover:border-amber-300 transition-all flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                      style={{ backgroundColor: `${cls.color}15`, color: cls.color }}
                    >
                      {cls.subject}
                    </span>
                    <span className="text-xs font-semibold text-stone-500">
                      {progressPercent}%
                    </span>
                  </div>

                  <h3 className="font-bold text-stone-900 text-base line-clamp-1 mb-1">
                    {cls.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mb-4">
                    {cls.description}
                  </p>

                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {nextLesson && (
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs space-y-1 mb-4">
                      <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                        Next Lesson
                      </div>
                      <div className="font-semibold text-stone-800 line-clamp-1">
                        {nextLesson.title}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenClass(cls.id, nextLesson?.id)}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Continue Course ({completedCount}/{totalCount})</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Upcoming Activities & Recent Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Calendar size={16} className="text-amber-600" />
              <span>Upcoming & Scheduled Activities</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('calendar')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 cursor-pointer"
            >
              Open Calendar
            </button>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-6 text-xs text-stone-400">
              No upcoming events scheduled. Add learning goals or study reminders in the Calendar.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 4).map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs"
                >
                  <div>
                    <div className="font-bold text-stone-900">{ev.title}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {ev.date} {ev.time ? `at ${ev.time}` : ''} • {ev.type.replace('_', ' ')}
                    </div>
                  </div>
                  {ev.durationMinutes && (
                    <span className="text-[11px] font-semibold text-stone-600 bg-white px-2 py-1 rounded border border-stone-200">
                      {ev.durationMinutes} min
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Clock size={16} className="text-amber-600" />
              <span>Recent Activity History</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('analytics')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 cursor-pointer"
            >
              View Analytics
            </button>
          </div>

          {!analytics?.recentActivity || analytics.recentActivity.length === 0 ? (
            <div className="text-center py-6 text-xs text-stone-400">
              No recent activities recorded yet. Complete lessons or quizzes to build your timeline.
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.recentActivity.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-stone-800">{act.title}</div>
                    {act.details && (
                      <div className="text-[11px] text-stone-500">{act.details}</div>
                    )}
                  </div>
                  <div className="text-[10px] text-stone-400 whitespace-nowrap">
                    {new Date(act.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
