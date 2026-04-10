import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/*
 * NewPlanPage
 *
 * Props (all optional — renders stub data when not provided):
 *   programs   {array}     - [{ id, name }] — populates program dropdown
 *   onSave     {function}  - called with { name, programId, days }
 *
 * Wiring targets:
 *   programs  <- GET /api/routines/programs
 *   onSave    -> POST /api/routines
 */

const STUB_PROGRAMS = [
  { id: '1', name: 'Upper Body' },
  { id: '2', name: 'Lower Body' },
  { id: '3', name: 'Full Body' },
  { id: '4', name: 'Pull' },
  { id: '5', name: 'Push' },
];

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function NewPlanPage({
  programs = STUB_PROGRAMS,
  onSave,
}) {
  const navigate = useNavigate();
  const [planName, setPlanName] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);

  function toggleDay(index) {
    setSelectedDays((prev) =>
      prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index]
    );
  }

  function handleSave() {
    if (!planName.trim() || !selectedProgram) return;
    onSave?.({ name: planName, programId: selectedProgram, days: selectedDays });
    navigate('/plans');
  }

  const canSave = planName.trim().length > 0 && selectedProgram !== '';

  return (
    <main
      className="pb-24 px-4 max-w-7xl mx-auto"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3rem)' }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-5xl font-headline font-black tracking-tighter uppercase text-white">
          New Plan
        </h1>
      </div>

      {/* Plan name */}
      <div className="bg-surface-container-low p-4 mb-4">
        <p className="text-[10px] text-primary font-bold tracking-tighter mb-3 uppercase font-headline">
          Plan Name
        </p>
        <div className="border-b-2 border-outline focus-within:border-primary transition-colors pb-1">
          <input
            type="text"
            placeholder="Enter plan title..."
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            className="w-full bg-transparent text-white text-base font-bold font-body outline-none placeholder:text-on-surface-variant/40"
          />
        </div>
      </div>

      {/* Select program */}
      <div className="bg-surface-container-low p-4 mb-4">
        <p className="text-[10px] text-on-surface-variant font-bold uppercase font-headline mb-3">
          Select Program
        </p>
        <div className="flex flex-col gap-1">
          {programs.map((prog) => (
            <button
              key={prog.id}
              onClick={() => setSelectedProgram(prog.id)}
              className={`flex items-center justify-between p-3 transition-colors ${
                selectedProgram === prog.id
                  ? 'bg-primary/10 border-l-2 border-primary'
                  : 'bg-surface-container hover:bg-surface-container-high'
              }`}
            >
              <span
                className={`text-sm font-bold font-headline uppercase tracking-tight ${
                  selectedProgram === prog.id ? 'text-primary' : 'text-white'
                }`}
              >
                {prog.name}
              </span>
              {selectedProgram === prog.id && (
                <span className="material-symbols-outlined text-primary text-sm">check</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Select day */}
      <div className="bg-surface-container-low p-4 mb-6">
        <p className="text-[10px] text-on-surface-variant font-bold uppercase font-headline mb-3">
          Select Day
        </p>
        <div className="flex gap-2">
          {DAYS.map((day, i) => (
            <button
              key={i}
              onClick={() => toggleDay(i)}
              className={`flex-1 py-2 text-xs font-black font-headline uppercase tracking-tight transition-colors ${
                selectedDays.includes(i)
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
        {selectedDays.length > 0 && (
          <p className="text-[9px] text-on-surface-variant uppercase font-headline mt-2">
            {selectedDays.map((d) => DAY_LABELS[d]).join(', ')}
          </p>
        )}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!canSave}
        className={`w-full py-3 flex items-center justify-center gap-2 transition-colors ${
          canSave
            ? 'bg-primary hover:bg-primary-container'
            : 'bg-surface-container-highest cursor-not-allowed'
        }`}
      >
        <span
          className={`text-sm font-black tracking-[0.2em] font-headline uppercase ${
            canSave ? 'text-on-primary' : 'text-on-surface-variant'
          }`}
        >
          Save Plan
        </span>
        {canSave && (
          <span className="material-symbols-outlined text-on-primary text-sm">check</span>
        )}
      </button>
    </main>
  );
}