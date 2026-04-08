import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function SessionPage() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/sessions/${date}`)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(data => { setExercises(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [date]);

  const totalVolume = exercises.reduce((sum, e) => sum + e.sets * e.reps * e.weight_kg, 0);
  const formatted = date ? new Date(date + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  if (loading) return <p className="text-gray-400 mt-8 text-center">Loading...</p>;
  if (error) return <p className="text-red-400 mt-8 text-center">Error: {error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <button onClick={() => navigate('/')} className="text-orange-500 hover:text-orange-400 mb-4 flex items-center gap-1">&larr; Back</button>
      <h2 className="text-white text-xl font-semibold mb-4">{formatted}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase border-b border-gray-700">
            <tr>
              <th className="py-2 pr-4">Exercise</th>
              <th className="py-2 pr-4">Muscle Group</th>
              <th className="py-2 pr-4">Sets</th>
              <th className="py-2 pr-4">Reps</th>
              <th className="py-2 pr-4">Weight (kg)</th>
              <th className="py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map(e => (
              <tr key={e.id} className="border-b border-gray-800">
                <td className="py-2 pr-4 text-white">{e.exercise}</td>
                <td className="py-2 pr-4">{e.muscle_group}</td>
                <td className="py-2 pr-4">{e.sets}</td>
                <td className="py-2 pr-4">{e.reps}</td>
                <td className="py-2 pr-4">{e.weight_kg}</td>
                <td className="py-2 text-gray-500">{e.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
