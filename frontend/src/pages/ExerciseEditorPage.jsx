import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ExerciseEditorPage() {
  const [exercises, setExercises] = useState([]);
  const [exerciseName, setExerciseName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const res = await fetch('/api/exercises');
      if (!res.ok) throw new Error(`fetchExercises failed: ${res.status}`);
      const data = await res.json();
      setExercises(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load exercises.');
      setLoading(false);
    }
  };

  const handleAddExercise = async () => {
    if (!exerciseName.trim() || !muscleGroup.trim()) return;
    try {
      const res = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: exerciseName, muscle_group: muscleGroup }),
      });
      if (!res.ok) throw new Error(`addExercise failed: ${res.status}`);
      const newExercise = await res.json();
      setExercises([...exercises, newExercise]);
      setExerciseName('');
      setMuscleGroup('');
    } catch (err) {
      console.error(err);
      setError('Failed to add exercise.');
    }
  };

  const handleEditExercise = async (id, updatedName, updatedMuscleGroup) => {
    try {
      const res = await fetch(`/api/exercises/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: updatedName, muscle_group: updatedMuscleGroup }),
      });
      if (!res.ok) throw new Error(`editExercise failed: ${res.status}`);
      setExercises(exercises.map((ex) => (ex.id === id ? { ...ex, name: updatedName, muscle_group: updatedMuscleGroup } : ex)));
    } catch (err) {
      console.error(err);
      setError('Failed to edit exercise.');
    }
  };

  const handleDeleteExercise = async (id) => {
    try {
      const res = await fetch(`/api/exercises/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`deleteExercise failed: ${res.status}`);
      setExercises(exercises.filter((ex) => ex.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete exercise.');
    }
  };

  return (
    <div>
      <h1>Exercise Editor</h1>
      {error && <p>{error}</p>}
      <div>
        <input
          type="text"
          placeholder="Exercise Name"
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Muscle Group"
          value={muscleGroup}
          onChange={(e) => setMuscleGroup(e.target.value)}
        />
        <button onClick={handleAddExercise}>Add Exercise</button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {exercises.map((exercise) => (
            <li key={exercise.id}>
              <input
                type="text"
                value={exercise.name}
                onChange={(e) => handleEditExercise(exercise.id, e.target.value, exercise.muscle_group)}
              />
              <input
                type="text"
                value={exercise.muscle_group}
                onChange={(e) => handleEditExercise(exercise.id, exercise.name, e.target.value)}
              />
              <button onClick={() => handleDeleteExercise(exercise.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
