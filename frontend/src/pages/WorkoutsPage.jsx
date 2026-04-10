import { useState, useEffect } from 'react';

/*
 * WorkoutsPage
 *
 * On mount fetches today's scheduled workout:
 *   1. GET /api/schedule/today → { id, routine_id, scheduled_date, status } | null
 *   2. GET /api/programs/{routine_id}/exercises → [{ id, name, default_sets, order }]
 *
 * If nothing is scheduled today, shows a "no workout" state.
 * onFinish -> POST /api/sessions (not yet wired — placeholder)
 */

function SetRow({ set, setIndex, onUpdate }) {
  return (
    <div className={`flex items-center gap-3 py-2 border-b border-outline-variant/10 ${set.done ? 'opacity-50' : ''}`}>
      <span className="text-[10px] text-on-surface-variant font-bold font-headline w-4">
        {setIndex + 1}
      </span>

      {/* Weight input */}
      <div className="flex-1 bg-surface-container border-b border-outline focus-within:border-primary transition-colors px-2 py-1">
        <input
          type="number"
          inputMode="decimal"
          value={set.weight || ''}
          placeholder="0"
          onChange={(e) => onUpdate(setIndex, 'weight', parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent text-white text-sm font-bold font-body outline-none placeholder:text-on-surface-variant/40 text-right"
        />
      </div>
      <span className="text-[9px] text-on-surface-variant uppercase font-headline">KG</span>

      {/* Reps input */}
      <div className="flex-1 bg-surface-container border-b border-outline focus-within:border-primary transition-colors px-2 py-1">
        <input
          type="number"
          inputMode="numeric"
          value={set.reps || ''}
          placeholder="0"
          onChange={(e) => onUpdate(setIndex, 'reps', parseInt(e.target.value) || 0)}
          className="w-full bg-transparent text-white text-sm font-bold font-body outline-none placeholder:text-on-surface-variant/40 text-right"
        />
      </div>
      <span className="text-[9px] text-on-surface-variant uppercase font-headline">REPS</span>

      {/* Done toggle */}
      <button
        onClick={() => onUpdate(setIndex, 'done', !set.done)}
        className={`w-8 h-8 flex items-center justify-center transition-colors ${
          set.done
            ? 'bg-secondary text-on-secondary'
            : 'border border-outline-variant/30 text-on-surface-variant hover:border-secondary hover:text-secondary'
        }`}
      >
        <span className="material-symbols-outlined text-sm">
          {set.done ? 'check' : 'radio_button_unchecked'}
        </span>
      </button>
    </div>
  );
}

function ExerciseBlock({ exercise, onUpdateSet }) {
  return (
    <div className="bg-surface-container-low mb-4">
      {/* Exercise header */}
      <div className="p-3 border-b border-outline-variant/10">
        <div className="flex justify-between items-start">
          <div>
            <span className="bg-surface-container-highest text-on-surface-variant text-[9px] font-bold px-1.5 py-0.5 uppercase mb-1 inline-block font-headline">
              {exercise.tag}
            </span>
            <h3 className="text-base font-black text-white uppercase font-headline tracking-tight">
              {exercise.name}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-on-surface-variant uppercase font-headline">
              {exercise.sets.filter((s) => s.done).length}/{exercise.sets.length} sets
            </p>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-3 px-3 pt-2 pb-1">
        <span className="text-[9px] text-on-surface-variant uppercase font-headline w-4">#</span>
        <span className="flex-1 text-[9px] text-on-surface-variant uppercase font-headline text-right">KG</span>
        <span className="text-[9px] text-on-surface-variant uppercase font-headline w-6"></span>
        <span className="flex-1 text-[9px] text-on-surface-variant uppercase font-headline text-right">REPS</span>
        <span className="text-[9px] text-on-surface-variant uppercase font-headline w-6"></span>
        <span className="w-8"></span>
      </div>

      {/* Sets */}
      <div className="px-3 pb-3">
        {exercise.sets.map((set, i) => (
          <SetRow
            key={i}
            set={set}
            setIndex={i}
            onUpdate={(idx, field, val) => onUpdateSet(exercise.id, idx, field, val)}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shape helper — maps API exercise to WorkoutsPage exercise shape
// API: { id, name, default_sets, exercise_id, order }
// ---------------------------------------------------------------------------
function apiExerciseToWorkoutExercise(ex, index) {
  return {
    id: ex.id,
    name: ex.name,
    tag: index === 0 ? 'Main Lift' : 'Accessory',
    sets: Array.from({ length: ex.default_sets || 3 }, () => ({
      weight: 0,
      reps: 0,
      done: false,
    })),
  };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function WorkoutsPage() {
  const [loading, setLoading] = useState(true);
  const [workoutName, setWorkoutName] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [scheduleId, setScheduleId] = useState(null);

  useEffect(() => {
    fetch('/api/schedule/today')
      .then((r) => r.json())
      .then((schedule) => {
        if (!schedule || !schedule.routine_id) {
          setLoading(false);
          return;
        }
        setScheduleId(schedule.id);
        return fetch(`/api/programs/${schedule.routine_id}/exercises`)
          .then((r) => r.json())
          .then((exList) => {
            // Also fetch program name for the header
            return fetch(`/api/programs`)
              .then((r) => r.json())
              .then((programs) => {
                const program = programs.find((p) => p.id === schedule.routine_id);
                setWorkoutName(program?.name ?? 'Today\'s Workout');
                setExercises(
                  Array.isArray(exList)
                    ? exList.map((ex, i) => apiExerciseToWorkoutExercise(ex, i))
                    : []
                );
              });
          });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleUpdateSet(exerciseId, setIndex, field, value) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s, i) =>
                i === setIndex ? { ...s, [field]: value } : s
              ),
            }
          : ex
      )
    );
  }

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const doneSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.done).length,
    0
  );
  const totalVolume = exercises.reduce(
    (acc, ex) =>
      acc + ex.sets.filter((s) => s.done).reduce((a, s) => a + s.weight * s.reps, 0),
    0
  );

  // --- Loading state ---
  if (loading) {
    return (
      <main
        className="pb-24 px-4 max-w-7xl mx-auto"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3rem)' }}
      >
        <h1 className="text-5xl font-headline font-black tracking-tighter uppercase text-white mb-6">
          WORKOUTS
        </h1>
        <p className="text-on-surface-variant text-sm font-body">Loading...</p>
      </main>
    );
  }

  // --- No workout scheduled ---
  if (!workoutName) {
    return (
      <main
        className="pb-24 px-4 max-w-7xl mx-auto"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3rem)' }}
      >
        <h1 className="text-5xl font-headline font-black tracking-tighter uppercase text-white mb-6">
          WORKOUTS
        </h1>
        <div className="bg-surface-container-low p-4">
          <p className="text-[10px] text-primary font-bold tracking-tighter uppercase font-headline mb-1">
            Today
          </p>
          <p className="text-on-surface-variant text-sm font-body">
            No workout scheduled for today.
          </p>
        </div>
      </main>
    );
  }

  // --- Active workout ---
  return (
    <main
      className="pb-24 px-4 max-w-7xl mx-auto"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3rem)' }}
    >
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-5xl font-headline font-black tracking-tighter uppercase text-white mb-2">
          WORKOUTS
        </h1>
        <p className="text-[10px] text-primary font-bold tracking-tighter uppercase font-headline">
          Active Workout
        </p>
        <p className="text-xl font-black text-white tracking-tight font-headline uppercase mt-1">
          {workoutName}
        </p>
      </div>

      {/* Live stats bar */}
      <div className="bg-surface-container-low p-3 mb-6 grid grid-cols-3 gap-4">
        <div>
          <p className="text-[9px] text-on-surface-variant uppercase font-bold font-headline mb-1">
            Total Volume
          </p>
          <p className="text-lg font-black text-white font-body tracking-tighter">
            {totalVolume.toLocaleString()}
            <span className="text-[10px] text-secondary ml-1">KG</span>
          </p>
        </div>
        <div>
          <p className="text-[9px] text-on-surface-variant uppercase font-bold font-headline mb-1">
            Sets Done
          </p>
          <p className="text-lg font-black text-white font-body tracking-tighter">
            {doneSets}
            <span className="text-[10px] text-on-surface-variant ml-1">/ {totalSets}</span>
          </p>
        </div>
        <div>
          <p className="text-[9px] text-on-surface-variant uppercase font-bold font-headline mb-1">
            Exercises
          </p>
          <p className="text-lg font-black text-white font-body tracking-tighter">
            {exercises.length}
          </p>
        </div>
      </div>

      {/* Exercise blocks */}
      {exercises.length === 0 && (
        <p className="text-on-surface-variant text-sm font-body">
          No exercises in this program yet.
        </p>
      )}
      {exercises.map((exercise) => (
        <ExerciseBlock
          key={exercise.id}
          exercise={exercise}
          onUpdateSet={handleUpdateSet}
        />
      ))}

      {/* Finish / Cancel */}
      {exercises.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => {
              /* TODO: POST /api/sessions */
              alert('Session logging not yet wired.');
            }}
            className="bg-primary py-3 flex items-center justify-center gap-2 hover:bg-primary-container transition-colors"
          >
            <span className="text-on-primary text-sm font-black tracking-[0.2em] font-headline uppercase">
              Finish
            </span>
            <span className="material-symbols-outlined text-on-primary text-sm">check_circle</span>
          </button>
          <button
            onClick={() => window.history.back()}
            className="border border-outline-variant/30 py-3 flex items-center justify-center gap-2 hover:bg-surface-container transition-colors"
          >
            <span className="text-on-surface-variant text-sm font-black tracking-[0.2em] font-headline uppercase">
              Cancel
            </span>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">close</span>
          </button>
        </div>
      )}
    </main>
  );
}
