import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const TABS = ['PLANS', 'PROGRAMS'];

function PlanCard({ plan, programName }) {
  return (
    <div className="bg-surface-container-low p-4 mb-3">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="bg-surface-container-highest text-secondary text-[9px] font-bold px-1.5 py-0.5 uppercase mb-2 inline-block font-headline">
            {plan.day || 'NO DAY SET'}
          </span>
          <h3 className="text-lg font-black text-white uppercase font-headline tracking-tight">
            {plan.name}
          </h3>
        </div>
        <Link
          to={`/plans/${plan.id}`}
          className="w-8 h-8 border border-outline-variant/30 flex items-center justify-center hover:bg-primary/10 transition-colors"
        >
          <span className="material-symbols-outlined text-sm text-on-surface-variant">
            chevron_right
          </span>
        </Link>
      </div>

      <div className="bg-surface-container p-2">
        <p className="text-[9px] text-on-surface-variant uppercase font-bold font-headline mb-1">
          Program
        </p>
        <p className="text-xs text-white font-bold font-body">
          {programName || '—'}
        </p>
      </div>
    </div>
  );
}

function ProgramCard({ program, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/programs/${program.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
      onDelete(program.id);
    } catch (err) {
      console.error(err);
      alert('Failed to delete program.');
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="bg-surface-container-low p-4 mb-3">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-black text-white uppercase font-headline tracking-tight">
          {program.name}
        </h3>
        <div className="flex gap-2">
          {confirming ? (
            <>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 h-8 bg-error flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                <span className="text-on-error text-[10px] font-black tracking-widest font-headline uppercase">
                  {deleting ? '...' : 'Confirm'}
                </span>
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="w-8 h-8 border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-on-surface-variant">close</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setConfirming(true)}
                className="w-8 h-8 border border-outline-variant/30 flex items-center justify-center hover:bg-error/10 hover:border-error/40 transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-on-surface-variant">delete</span>
              </button>
              <Link
                to={`/plans/programs/${program.id}`}
                className="w-8 h-8 border border-outline-variant/30 flex items-center justify-center hover:bg-primary/10 transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-on-surface-variant">
                  chevron_right
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlansPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('PLANS');
  const [plans, setPlans] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/plans').then((r) => r.json()),
      fetch('/api/programs').then((r) => r.json()),
    ])
      .then(([plansData, programsData]) => {
        setPlans(Array.isArray(plansData) ? plansData : []);
        setPrograms(Array.isArray(programsData) ? programsData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleProgramDeleted(id) {
    setPrograms((prev) => prev.filter((p) => p.id !== id));
  }

  const programMap = Object.fromEntries(programs.map((p) => [p.id, p.name]));

  return (
    <main
      className="pb-24 px-4 max-w-7xl mx-auto"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3rem)' }}
    >
      <div className="mb-6">
        <h1 className="text-5xl font-headline font-black tracking-tighter uppercase text-white">
          Plans
        </h1>
      </div>

      <div className="flex border-b border-outline-variant/20 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-sm font-bold tracking-widest uppercase font-headline px-4 relative transition-colors ${
              activeTab === tab
                ? 'text-white border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-on-surface-variant text-sm font-body">Loading...</p>
      )}

      {!loading && activeTab === 'PLANS' && (
        <>
          {plans.length === 0 && (
            <p className="text-on-surface-variant text-sm font-body mb-4">No plans yet.</p>
          )}
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} programName={programMap[plan.program_id]} />
          ))}
          <button
            onClick={() => navigate('/plans/new')}
            className="w-full border border-outline-variant/30 py-3 flex items-center justify-center gap-2 hover:bg-surface-container transition-colors mt-2"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-sm">add</span>
            <span className="text-on-surface-variant text-sm font-black tracking-[0.2em] font-headline uppercase">
              Add New Plan
            </span>
          </button>
        </>
      )}

      {!loading && activeTab === 'PROGRAMS' && (
        <>
          {programs.length === 0 && (
            <p className="text-on-surface-variant text-sm font-body mb-4">No programs yet.</p>
          )}
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} onDelete={handleProgramDeleted} />
          ))}
          <button
            onClick={() => navigate('/plans/programs/new')}
            className="w-full border border-outline-variant/30 py-3 flex items-center justify-center gap-2 hover:bg-surface-container transition-colors mt-2"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-sm">add</span>
            <span className="text-on-surface-variant text-sm font-black tracking-[0.2em] font-headline uppercase">
              Add New Program
            </span>
          </button>
        </>
      )}
    </main>
  );
}