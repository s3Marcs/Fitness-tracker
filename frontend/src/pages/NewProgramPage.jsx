import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/*
 * NewProgramPage
 *
 * Endpoints:
 *   exercises <- GET /api/exercises           → [{ id, name, muscle_group }]
 *   onSave    -> POST /api/programs           ← { name }          → { id }
 *             -> POST /api/programs/{id}/exercises (one per exercise, in order)
 *                                             ← { program_id, exercise_id, default_sets, order }
 */

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

export default function NewProgramPage() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [programName, setProgramName] = useState('');
  const [rows, setRows] = useState([{ exerciseId: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/exercises')
      .then((r) => r.json())
      .then((data) => setExercises(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  function handleChangeRow(index, exerciseId) {
    setRows((prev) => prev.map((r, i) => (i === index ? { exerciseId } : r)));
  }

  function handleRemoveRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddRow() {
    setRows((prev) => [...prev, { exerciseId: '' }]);
  }

  async function handleSave() {
    const filled = rows.filter((r) => r.exerciseId !== '');
    if (!programName.trim() || filled.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      // 1. Create the program
      const programRes = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: programName.trim() }),
      });
      if (!programRes.ok) throw new Error(`HTTP ${programRes.status}`);
      const { id: programId } = await programRes.json();

      // 2. Add each exercise in order (sequential — avoids Notion rate limiting)
      for (let i = 0; i < filled.length; i++) {
        const res = await fetch(`/api/programs/${programId}/exercises`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            program_id: programId,
            exercise_id: filled[i].exerciseId,
            default_sets: 3,
            order: i + 1,
          }),
        });
        if (!res.ok) throw new Error(`Failed to add exercise ${i + 1}: HTTP ${res.status}`);
      }

      navigate('/plans');
    } catch (e) {
      setError(e.message || 'Failed to save program. Please try again.');
    } finally {
      setSaving(false);
    }
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
          Add Exercises
        </p>

        {exercises.length === 0 && (
          <p className="text-on-surface-variant text-sm font-body mb-3">
            No exercises available. Add exercises to the Exercises DB in Notion first.
          </p>
        )}

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

      {error && (
        <p className="text-red-400 text-sm font-body mb-4">{error}</p>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!canSave || saving}
        className={`w-full py-3 flex items-center justify-center gap-2 transition-colors ${
          canSave && !saving
            ? 'bg-primary hover:bg-primary-container'
            : 'bg-surface-container-highest cursor-not-allowed'
        }`}
      >
        <span
          className={`text-sm font-black tracking-[0.2em] font-headline uppercase ${
            canSave && !saving ? 'text-on-primary' : 'text-on-surface-variant'
          }`}
        >
          {saving ? 'Saving...' : 'Save Program'}
        </span>
        {canSave && !saving && (
          <span className="material-symbols-outlined text-on-primary text-sm">check</span>
        )}
      </button>
    </main>
  );
}
