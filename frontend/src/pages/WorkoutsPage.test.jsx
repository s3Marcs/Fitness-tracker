import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WorkoutsPage from './WorkoutsPage';
import { vi } from 'vitest';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockFetch = (exercisesRes = [], sessionsRes = [], scheduleRes = {}, programsRes = []) => {
  vi.stubGlobal('fetch', vi.fn()
    .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(exercisesRes) })
    .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(sessionsRes) })
    .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(scheduleRes) })
    .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(programsRes) })
  );
};

describe('WorkoutsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  test('shows WORKOUTS heading', async () => {
    mockFetch();
    render(<MemoryRouter><WorkoutsPage /></MemoryRouter>);
    expect(screen.getByText('WORKOUTS')).toBeInTheDocument();
  });

  test('shows Start a workout when no sessions and no schedule', async () => {
    mockFetch();
    render(<MemoryRouter><WorkoutsPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Start a workout')).toBeInTheDocument());
  });

  test('renders program names as buttons', async () => {
    mockFetch([], [], {}, [{ id: 1, name: 'Push Day' }, { id: 2, name: 'Pull Day' }]);
    render(<MemoryRouter><WorkoutsPage /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Push Day')).toBeInTheDocument();
      expect(screen.getByText('Pull Day')).toBeInTheDocument();
    });
  });

  test('shows Today section when completed session exists', async () => {
    const session = { id: 'abc123', date: '2026-04-13', exercise_count: 3, total_volume_kg: 2400, muscle_groups: ['Chest'] };
    mockFetch([], [session], {}, []);
    render(<MemoryRouter><WorkoutsPage /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  test('navigates to session detail when completed tile clicked', async () => {
    const session = { id: 'abc123', date: '2026-04-13', exercise_count: 3, total_volume_kg: 2400, muscle_groups: ['Chest'] };
    mockFetch([], [session], {}, []);
    render(<MemoryRouter><WorkoutsPage /></MemoryRouter>);
    await waitFor(() => screen.getByText('Completed'));
    screen.getByText('Completed').closest('button').click();
    expect(mockNavigate).toHaveBeenCalledWith('/workouts/abc123');
  });
});