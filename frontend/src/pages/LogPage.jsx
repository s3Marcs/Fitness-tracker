import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MUSCLE_GROUPS = ['Quads/Glutes','Chest','Back','Shoulders','Biceps','Triceps','Lats','Upper Chest','Back/Hams','Legs','General'];
const blankRow = () => ({ exercise: '', muscle_group: 'Chest', sets: '', reps: '', weight_kg: '', notes: '' });

export default function LogPage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [rows, setRows] = useState([blankRow()]);
  const [errors, setErrors] = useState([]);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (i, field, value) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };

  const addRow = () => setRows(prev => [...prev, blankRow()]);
  const removeRow = (i) => setRows(prev => prev.filter((_, idx) => idx !== i));

  const totalVolume = rows.reduce((sum, r) => {
    const s = parseFloat(r.sets) || 0;
    const rp = parseFloat(r.reps) || 0;
    const w = parseFloat(r.weight_kg) || 0;
    return sum + s * rp * w;
  }, 0);

  const validate = () => {
    return rows.map(r => ({
      exercise: !r.exercise.trim() ? 'Required' : null,
      sets: (!r.sets || parseFloat(r.sets) <= 0) ? 'Must be > 0' : null,
      reps: (!r.reps || parseFloat(r.reps) <= 0) ? 'Must be > 0' : null,
      weight_kg: (!r.weight_kg || parseFloat(r.weight_kg) <= 0) ? 'Must be > 0' : null,
    }));
  };

  const handleSubmit = async () => {
    const errs = validate();
    const hasError = errs.some(e => Object.values(e).some(v => v !== null));
    if (hasError) { setErrors(errs); return; }
    setErrors([]);
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          exercises: rows.map(r => ({
            exercise: r.exercise.trim(),
            muscle_group: r.muscle_group,
            sets: parseInt(r.sets),
            reps: parseInt(r.reps),
            weight_kg: parseFloat(r.weight_kg),
            notes: r.notes.trim()
          }))
        })
      });
      if (!res.ok) throw new Error(await res.text());
      navigate(`/session/${date}`);
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  const inputCls = "bg-gray-800 border border-gray-700 text-white text-sm rounded px-2 py-1 w-full focus:outline-none focus:border-orange-500";
  const errCls = "text-red-400 text-xs mt-1";

  return (
    <div className="max-w-6xl mx-auto mt-6">
      <h2 className="text-white text-xl font-semibold mb-4">Log session</h2>
      <div className="mb-4">
        <label className="text-gray-400 text-sm block mb-1">Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls + " w-40"} />
      </div>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase border-b border-gray-700">
              <th className="py-2 pr-2 text-left">Exercise</th>
              <th className="py-2 pr-2 text-left">Muscle Group</th>
              <th className="py-2 pr-2 text-left w-16">Sets</th>
              <th className="py-2 pr-2 text-left w-16">Reps</th>
              <th className="py-2 pr-2 text-left w-24">Weight (kg)</th>
              <th className="py-2 pr-2 text-left">Notes</th>
              <th className="py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-800">
                <td className="py-2 pr-2">
                  <input value={row.exercise} onChange={e => update(i, 'exercise', e.target.value)} placeholder="e.g. Bench Press" className={inputCls} />
                  {errors[i]?.exercise && <p className={errCls}>{errors[i].exercise}</p>}
                </td>
                <td className="py-2 pr-2">
                  <select value={row.muscle_group} onChange={e => update(i, 'muscle_group', e.target.value)} className={inputCls}>
                    {MUSCLE_GROUPS.map(mg => <option key={mg} value={mg}>{mg}</option>)}
                  </select>
                </td>
                <td className="py-2 pr-2">
                  <input type="number" value={row.sets} onChange={e => update(i, 'sets', e.target.value)} className={inputCls} min="1" />
                  {errors[i]?.sets && <p className={errCls}>{errors[i].sets}</p>}
                </td>
                <td className="py-2 pr-2">
                  <input type="number" value={row.reps} onChange={e => update(i, 'reps', e.target.value)} className={inputCls} min="1" />
                  {errors[i]?.reps && <p className={errCls}>{errors[i].reps}</p>}
                </td>
                <td className="py-2 pr-2">
                  <input type="number" value={row.weight_kg} onChange={e => update(i, 'weight_kg', e.target.value)} className={inputCls} min="0.1" step="0.5" />
                  {errors[i]?.weight_kg && <p className={errCls}>{errors[i].weight_kg}</p>}
                </td>
                <td className="py-2 pr-2">
                  <input value={row.notes} onChange={e => update(i, 'notes', e.target.value)} className={inputCls} />
                </td>
                <td className="py-2">
                  <button onClick={() => removeRow(i)} disabled={rows.length === 1} className="text-gray-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none">&times;</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={addRow} className="text-orange-500 hover:text-orange-400 text-sm">+ Add exercise</button>
        <p className="text-gray-400 text-sm">Session volume: <span className="text-white font-medium">{totalVolume.toLocaleString()} kg</span></p>
      </div>
      {submitError && <p className="text-red-400 text-sm mb-3">{submitError}</p>}
      <div className="flex justify-end">
        <button onClick={handleSubmit} disabled={submitting} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2 rounded font-medium transition-colors">
          {submitting ? 'Saving...' : 'Save session'}
        </button>
      </div>
    </div>
  );
}