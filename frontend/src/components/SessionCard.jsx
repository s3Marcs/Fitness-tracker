import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SessionCard({ date, day, exercise_count, total_volume_kg, muscle_groups }) {
  const navigate = useNavigate();
  const formatted = new Date(date + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div
      onClick={() => navigate(`/session/${date}`)}
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-3 cursor-pointer hover:border-orange-500 transition-colors"
    >
      <p className="text-gray-400 text-sm mb-1">{day} &bull; {formatted}</p>
      <p className="text-white font-medium mb-2">{exercise_count} exercises &bull; {total_volume_kg.toLocaleString()} kg</p>
      <div className="flex flex-wrap gap-2">
        {muscle_groups.map(mg => (
          <span key={mg} className="text-xs bg-orange-950 text-orange-400 px-2 py-1 rounded-full">{mg}</span>
        ))}
      </div>
    </div>
  );
}
