import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Target,
  Trash2,
} from 'lucide-react';
import { CalendarEvent, LearningGoal, LearningClass } from '../types';

interface CalendarGoalsViewProps {
  events: CalendarEvent[];
  goals: LearningGoal[];
  classes: LearningClass[];
  onSaveEvent: (event: CalendarEvent) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
  onSaveGoal: (goal: LearningGoal) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
}

export const CalendarGoalsView: React.FC<CalendarGoalsViewProps> = ({
  events,
  goals,
  classes,
  onSaveEvent,
  onDeleteEvent,
  onSaveGoal,
  onDeleteGoal,
}) => {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // New Event Form
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<CalendarEvent['type']>('study_session');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('09:00');
  const [eventDuration, setEventDuration] = useState('45');
  const [eventClassId, setEventClassId] = useState('');

  // New Goal Form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalPeriod, setGoalPeriod] = useState<LearningGoal['period']>('daily');
  const [targetMinutes, setTargetMinutes] = useState('60');

  const handleCreateEvent = async () => {
    if (!eventTitle.trim()) return;
    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      title: eventTitle.trim(),
      type: eventType,
      date: eventDate,
      time: eventTime || undefined,
      durationMinutes: parseInt(eventDuration, 10) || 30,
      classId: eventClassId || undefined,
      isCompleted: false,
      createdAt: Date.now(),
    };
    await onSaveEvent(newEvent);
    setIsEventModalOpen(false);
    setEventTitle('');
  };

  const handleToggleEventComplete = async (event: CalendarEvent) => {
    await onSaveEvent({
      ...event,
      isCompleted: !event.isCompleted,
    });
  };

  const handleCreateGoal = async () => {
    if (!goalTitle.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    const newGoal: LearningGoal = {
      id: crypto.randomUUID(),
      title: goalTitle.trim(),
      period: goalPeriod,
      targetMinutes: parseInt(targetMinutes, 10) || 60,
      completedMinutes: 0,
      startDate: today,
      endDate: today,
      isArchived: false,
      createdAt: Date.now(),
    };
    await onSaveGoal(newGoal);
    setIsGoalModalOpen(false);
    setGoalTitle('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Study Planner & Learning Goals
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Schedule dedicated study sessions, set weekly target hours, and maintain learning consistency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsGoalModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs transition cursor-pointer shadow-2xs"
          >
            <Target size={14} />
            <span>Set Learning Goal</span>
          </button>
          <button
            type="button"
            onClick={() => setIsEventModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition cursor-pointer shadow-xs"
          >
            <Plus size={15} />
            <span>Schedule Activity</span>
          </button>
        </div>
      </div>

      {/* Goals Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
          <Target size={16} className="text-amber-600" />
          <span>Active Learning Goals ({goals.length})</span>
        </h2>

        {goals.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-dashed border-stone-200 text-center text-xs text-stone-400">
            No goals set yet. Define daily or weekly learning targets to stay accountable.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.map((g) => {
              const percent = Math.min(100, Math.round((g.completedMinutes / g.targetMinutes) * 100));
              return (
                <div
                  key={g.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {g.period} Target
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteGoal(g.id)}
                      className="text-stone-300 hover:text-red-600 p-0.5"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div>
                    <div className="font-bold text-xs text-stone-900">{g.title}</div>
                    <div className="text-xs text-stone-500 mt-1">
                      {g.completedMinutes} / {g.targetMinutes} minutes planned
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scheduled Activities Agenda */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <CalendarIcon size={16} className="text-amber-600" />
          <span>Scheduled Learning Agenda ({events.length})</span>
        </h2>

        {events.length === 0 ? (
          <div className="text-center py-10 text-xs text-stone-400">
            No study sessions or assignment deadlines scheduled.
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((ev) => {
              const parentClass = classes.find((c) => c.id === ev.classId);
              return (
                <div
                  key={ev.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                    ev.isCompleted
                      ? 'bg-stone-50/70 border-stone-200 opacity-60'
                      : 'bg-white border-stone-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleEventComplete(ev)}
                      className={`cursor-pointer ${
                        ev.isCompleted ? 'text-emerald-600' : 'text-stone-300 hover:text-stone-600'
                      }`}
                    >
                      <CheckCircle2 size={18} />
                    </button>

                    <div>
                      <div
                        className={`text-xs font-bold ${
                          ev.isCompleted ? 'line-through text-stone-400' : 'text-stone-900'
                        }`}
                      >
                        {ev.title}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                        <span>{ev.date} {ev.time ? `at ${ev.time}` : ''}</span>
                        <span>•</span>
                        <span className="capitalize">{ev.type.replace('_', ' ')}</span>
                        {parentClass && (
                          <>
                            <span>•</span>
                            <span className="text-stone-700 font-medium">{parentClass.title}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {ev.durationMinutes && (
                      <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-1 rounded">
                        {ev.durationMinutes} min
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteEvent(ev.id)}
                      className="text-stone-300 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Schedule Activity */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900">Schedule Learning Activity</h3>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Title</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g. Master VLOOKUP & Practice Exercises"
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-stone-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Time</label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-stone-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as CalendarEvent['type'])}
                  className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white"
                >
                  <option value="study_session">Study Session</option>
                  <option value="assignment_deadline">Assignment Deadline</option>
                  <option value="flashcard_review">Flashcard Review</option>
                  <option value="quiz">Quiz Assessment</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Duration (Min)</label>
                <input
                  type="number"
                  value={eventDuration}
                  onChange={(e) => setEventDuration(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-stone-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Associated Course</label>
              <select
                value={eventClassId}
                onChange={(e) => setEventClassId(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white"
              >
                <option value="">None / General</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateEvent}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Learning Goal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900">Define Learning Goal</h3>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Goal Title</label>
              <input
                type="text"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g. Study 60 minutes daily"
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Period</label>
                <select
                  value={goalPeriod}
                  onChange={(e) => setGoalPeriod(e.target.value as LearningGoal['period'])}
                  className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Target Minutes</label>
                <input
                  type="number"
                  value={targetMinutes}
                  onChange={(e) => setTargetMinutes(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-stone-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateGoal}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
              >
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
