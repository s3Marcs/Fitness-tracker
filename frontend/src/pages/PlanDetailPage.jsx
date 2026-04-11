import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function PlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [programName, setProgramName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/plans/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPlan(data);
        if (data.program_id) {
          return fetch(`/api/programs/${data.program_id}`)
            .then((r) => r.json())
            .then((prog) => setProgramName(prog.name));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="pb-24 px-4 max-w-7xl mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3rem)' }}>
        <p className="text-on-surface-variant text-sm font-body">Loading...</p>
      </main>
    );
  }

  if (!plan) {
    return (
      <main className="pb-24 px-4 max-w-7xl mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3rem)' }}>
        <p className="text-on-surface-variant text-sm font-body">Plan not found.</p>
      </main>
    );
  }

  return (
    <main className="pb-24 px-4 max-w-7xl mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3rem)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/plans')}
          className="w-8 h-8 border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-sm text-on-surface-variant">arrow_back</span>
        </button>
        <div>
          <p className="text-[10px] text-on-surface-variant uppercase font-bold font-headline">Plan</p>
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase text-white">
            {plan.name}
          </h1>
        </div>
      </div>

      {/* Details */}
      <div className="bg-surface-container-low p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[9px] text-on-surface-variant uppercase font-bold font-headline mb-1">Day</p>
            <p className="text-sm font-black text-white font-body">{plan.day || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-on-surface-variant uppercase font-bold font-headline mb-1">Program</p>
            <p className="text-sm font-black text-white font-body">{programName || '—'}</p>
          </div>
        </div>
      </div>

      {/* Link to program detail */}
      {plan.program_id && (
        <Link
          to={`/plans/programs/${plan.program_id}`}
          className="w-full bg-surface-container-low p-4 flex items-center justify-between hover:bg-surface-container transition-colors mb-4"
        >
          <div>
            <p className="text-[9px] text-on-surface-variant uppercase font-bold font-headline mb-1">Program Detail</p>
            <p className="text-sm font-black text-white font-headline uppercase">{programName || 'View Program'}</p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
        </Link>
      )}
    </main>
  );
}