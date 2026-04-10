import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/*
 * NewProgramPage
 *
 * Props (all optional — renders stub data when not provided):
 *   exercises  {array}     - [{ id, name }] — available exercises for dropdown
 *   onSave     {function}  - called with { name, exercises: [{ exerciseId }] }
 *
 * Wiring targets:
 *   exercises  <- GET /api/exercises
 *   onSave     -> POST /api/routines/programs
 */

const STUB_EXERCISES = [
  { id: '1',  name: 'Barbell Bench Press' },
  { id: '2',  name: 'Overhead Press' },
  { id: '3',  name: 'Incline Dumbbell Press' },
  { id: '4',  name: 'Lateral Raises' },
  { id: '5',  name: 'Squat' },
  { id: '6',  name: 'Deadlift' },
  { id: '7',  name: 'Leg Press' },
  { id: '8',  name: 'Pull Ups' },
  { id: '9',  name: 'Barbell Row' },
  { id: '10', name: 'Lat Pulldown' },
];

function ExerciseRow({ index, exerciseId, exercises, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-[10px] text-on-surface-variant font-headline w-5 text-right">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="flex-1 bg-surface-container border-b border-outline focus-within:border-primary transition-colors">
        <select
          value={exerciseId}
          onChange={(e) => onChange(index, e.target.value)}
          className="w-full bg-transparent text-white text-sm font-bold font-body outline-none px-2 py-2 appearance-none cursor-pointer"
        >
          <option value="" className="bg-surface-container text-on-surface-variant">
            Select exercise...
          </option>
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id} className="bg-surface-container text-white">
              {ex.name}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-tertiary transition-colors"
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
}

export default function NewProgramPage({
  exercises = STUB_EXERCISES,
  onSave,
}) {
  const navigate = useNavigate();
  const [programName, setProgramName] = useState('');
  const [rows, setRows] = useState([{ exerciseId: '' }]);

  function handleChangeRow(index, exerciseId) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { exerciseId } : r))
    );
  }

  function handleRemoveRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddRow() {
    setRows((prev) => [...prev, { exerciseId: '' }]);
  }

  function handleSave() {
    if (!programName.trim()) return;
    const filled = rows.filter((r) => r.exerciseId !== '');
    onSave?.({ name: programName, exercises: filled });
    navigate('/plans');
  }

  const canSave =
    programName.trim().length > 0 && rows.some((r) => r.exerciseId !== '');

  return (
    <main
      className="pb-24 px-4 max-w-7xl mx-auto"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3rem)' }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-5xl font-headline font-black tracking-tighter uppercase text-white">
          New Program
        </h1>
      </div>

      {/* Program name */}
      <div className="bg-surface-container-low p-4 mb-4">
        <p className="text-[10px] text-primary font-bold tracking-tighter mb-3 uppercase font-headline">
          Program Name
        </p>
        <div className="border-b-2 border-outline focus-within:border-primary transition-colors pb-1">
          <input
            type="text"
            placeholder="Enter program title..."
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            className="w-full bg-transparent text-white text-base font-bold font-body outline-none placeholder:text-on-surface-variant/40"
          />
        </div>
      </div>

      {/* Add exercises */}
      <div className="bg-surface-container-low p-4 mb-4">
        <p className="text-[10px] text-on-surface-variant font-bold uppercase font-headline mb-3">
          Add Exercise
        </p>

        {rows.map((row, i) => (
          <ExerciseRow
            key={i}
            index={i}
            exerciseId={row.exerciseId}
            exercises={exercises}
            onChange={handleChangeRow}
            onRemove={handleRemoveRow}
          />
        ))}

        <button
          onClick={handleAddRow}
          className="w-full border border-outline-variant/30 py-2 flex items-center justify-center gap-2 hover:bg-surface-container transition-colors mt-3"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-sm">add</span>
          <span className="text-on-surface-variant text-xs font-black tracking-[0.15em] font-headline uppercase">
            Add Another Exercise
          </span>
        </button>
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
          Save Program
        </span>
        {canSave && (
          <span className="material-symbols-outlined text-on-primary text-sm">check</span>
        )}
      </button>
    </main>
  );
}