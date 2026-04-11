import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const MUSCLE_COLORS = {
  'Chest':     { bg: 'bg-blue-900/40',    text: 'text-blue-300' },
  'Back':      { bg: 'bg-emerald-900/40', text: 'text-emerald-300' },
  'Shoulders': { bg: 'bg-violet-900/40',  text: 'text-violet-300' },
  'Biceps':    { bg: 'bg-cyan-900/40',    text: 'text-cyan-300' },
  'Triceps':   { bg: 'bg-orange-900/40',  text: 'text-orange-300' },
  'Legs':      { bg: 'bg-yellow-900/40',  text: 'text-yellow-300' },
  'Core':      { bg: 'bg-rose-900/40',    text: 'text-rose-300' },
};
const DEFAULT_MUSCLE_COLOR = { bg: 'bg-surface-container-highest', text: 'text-on-surface-variant' };

function getMuscleColor(mg) {
  return MUSCLE_COLORS[mg] ?? DEFAULT_MUSCLE_COLOR;
}

export default function ProgramDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/programs/${id}`).then((r) => r.json()),
      fetch(`/api/programs/${id}/exercises`).then((r) => r.json()),
    ])
      .then(([prog, exList]) => {
        setProgram(prog);
        setExercises(Array.isArray(exList) ? exList : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/programs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
      navigate('/plans');
    } catch (err) {
      console.error(err);
      alert('Failed to delete program.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (loading) {
    return (
      <main className="pb-24 px-4 max-w-7xl mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3rem)' }}>
        <p className="text-on-surface-variant text-sm font-body">Loading...</p>
      </main>
    );
  }

  if (!program) {
    return (
      <main className="pb-24 px-4 max-w-7xl mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3rem)' }}>
        <p className="text-on-surface-variant text-sm font-body">Program not found.</p>
      </main>
    );
  }

  return (
    <main className="pb-24 px-4 max-w-7xl mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3rem)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-sm text-on-surface-variant">arrow_back</span>
        </button>
        <div className="flex-1">
          <p className="text-[10px] text-on-surface-variant uppercase font-bold font-headline">Program</p>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase text-white">
            {program.name}
          </h1>
        </div>
      </div>

      {/* Exercise count summary */}
      <div className="bg-surface-container-low p-3 mb-4">
        <p className="text-[9px] text-on-surface-variant uppercase font-bold font-headline mb-1">Exercises</p>
        <p className="text-xl font-black text-white font-body tracking-tighter">{exercises.length}</p>
      </div>

      {/* Exercise list */}
      {exercises.length === 0 && (
        <p className="text-on-surface-variant text-sm font-body mb-4">No exercises in this program yet.</p>
      )}
      {exercises.map((ex, i) => {
        const colors = getMuscleColor(ex.muscle_group);
        return (
          <div key={ex.id} className="bg-surface-container-low mb-2 p-3 flex items-center gap-3">
            <span className="text-[10px] text-on-surface-variant font-bold font-headline w-4">{i + 1}</span>
            <div className="flex-1">
              <span className={`${colors.bg} ${colors.text} text-[9px] font-bold px-1.5 py-0.5 uppercase mb-1 inline-block font-headline`}>
                {ex.muscle_group || 'General'}
              </span>
              <p className="text-sm font-black text-white uppercase font-headline tracking-tight">{ex.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-on-surface-variant uppercase font-headline">Default</p>
              <p className="text-sm font-bold text-white font-body">
                {ex.default_sets}<span className="text-[9px] text-on-surface-variant ml-1">sets</span>
              </p>
            </div>
          </div>
        );
      })}

      {/* Delete program */}
      <div className="mt-6">
        {confirmDelete ? (
          <div className="bg-surface-container-low p-4">
            <p className="text-sm text-white font-body mb-4">
              Delete <span className="font-bold">{program.name}</span>? This cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-error py-3 flex items-center justify-center gap-2 hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                <span className="text-on-error text-sm font-black tracking-[0.2em] font-headline uppercase">
                  {deleting ? 'Deleting...' : 'Delete'}
                </span>
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="border border-outline-variant/30 py-3 flex items-center justify-center hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                <span className="text-on-surface-variant text-sm font-black tracking-[0.2em] font-headline uppercase">Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full border border-error/30 py-3 flex items-center justify-center gap-2 hover:bg-error/10 transition-colors"
          >
            <span className="material-symbols-outlined text-error/70 text-sm">delete</span>
            <span className="text-error/70 text-sm font-black tracking-[0.2em] font-headline uppercase">Delete Program</span>
          </button>
        )}
      </div>
    </main>
  );
}