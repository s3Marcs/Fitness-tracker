import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SessionPage from './SessionPage';
import { vi } from 'vitest';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderWithRoute(date) {
  return render(
    <MemoryRouter initialEntries={[`/session/${date}`]}>
      <Routes>
        <Route path="/session/:date" element={<SessionPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('SessionPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  test('shows loading state initially', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
    renderWithRoute('2026-04-12');
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('shows formatted date 12 Apr 2026', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue([]) }));
    renderWithRoute('2026-04-12');
    await waitFor(() => expect(screen.getByText('12 Apr 2026')).toBeInTheDocument());
  });

  test('shows error when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    renderWithRoute('2026-04-12');
    await waitFor(() => expect(screen.getByText(/Error: Network error/)).toBeInTheDocument());
  });

  test('renders exercise row data', async () => {
    const mockData = [{ id: 1, exercise: 'Bench Press', muscle_group: 'Chest', sets: 3, reps: 10, weight_kg: 80, notes: '' }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockData) }));
    renderWithRoute('2026-04-12');
    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.getByText('Chest')).toBeInTheDocument();
    });
  });
});