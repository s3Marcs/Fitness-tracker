import React, { useEffect, useState } from 'react';
import SessionCard from '../components/SessionCard';

export default function FeedPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(data => { setSessions(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return <p className="text-gray-400 mt-8 text-center">Loading...</p>;
  if (error) return <p className="text-red-400 mt-8 text-center">Error: {error}</p>;
  if (sessions.length === 0) return <p className="text-gray-400 mt-8 text-center">No sessions logged yet.</p>;

  return (
    <div className="max-w-2xl mx-auto mt-6">
      {sessions.map(s => <SessionCard key={s.date} {...s} />)}
    </div>
  );
}
