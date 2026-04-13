import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock the BottomNav component since we don't want to test it in this specific test
vi.mock('./components/BottomNav', () => ({
  __esModule: true,
  default: () => <div data-testid="bottom-nav">Bottom Navigation</div>
}));

// Mock all page components to avoid complex rendering
const MockPage = ({ title }) => (
  <div data-testid="mock-page">{title}</div>
);

vi.mock('./pages/HomePage', () => ({
  __esModule: true,
  default: () => <MockPage title="Home" />
}));

vi.mock('./pages/WorkoutsPage', () => ({
  __esModule: true,
  default: () => <MockPage title="Workouts" />
}));

vi.mock('./pages/SessionPage', () => ({
  __esModule: true,
  default: () => <MockPage title="Session" />
}));

vi.mock('./pages/PlansPage', () => ({
  __esModule: true,
  default: () => <MockPage title="Plans" />
}));

vi.mock('./pages/WorkoutSummaryPage', () => ({
  __esModule: true,
  default: () => <MockPage title="Workout Summary" />
}));

vi.mock('./pages/NewPlanPage', () => ({
  __esModule: true,
  default: () => <MockPage title="New Plan" />
}));

vi.mock('./pages/NewProgramPage', () => ({
  __esModule: true,
  default: () => <MockPage title="New Program" />
}));

vi.mock('./pages/PlanDetailPage', () => ({
  __esModule: true,
  default: () => <MockPage title="Plan Detail" />
}));

vi.mock('./pages/ProgramDetailPage', () => ({
  __esModule: true,
  default: () => <MockPage title="Program Detail" />
}));

vi.mock('./pages/OneRMCalcPage', () => ({
  __esModule: true,
  default: () => <MockPage title="1RM Calculator" />
}));

vi.mock('./pages/RoutinesPage', () => ({
  __esModule: true,
  default: () => <MockPage title="Routines" />
}));

vi.mock('./pages/LogPage', () => ({
  __esModule: true,
  default: () => <MockPage title="Log" />
}));

describe('App Component', () => {
  test('renders without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-page')).toBeInTheDocument();
  });

  test('renders HomePage by default at root route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-page')).toHaveTextContent('Home');
  });

  test('renders WorkoutsPage at /workouts route', () => {
    render(
      <MemoryRouter initialEntries={['/workouts']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-page')).toHaveTextContent('Workouts');
  });

  test('renders PlansPage at /plans route', () => {
    render(
      <MemoryRouter initialEntries={['/plans']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-page')).toHaveTextContent('Plans');
  });

  test('renders WorkoutSummaryPage at /workouts/:id route', () => {
    render(
      <MemoryRouter initialEntries={['/workouts/123']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-page')).toHaveTextContent('Workout Summary');
  });

  test('renders SessionPage at /session/:date route', () => {
    render(
      <MemoryRouter initialEntries={['/session/2023-01-01']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-page')).toHaveTextContent('Session');
  });

  test('renders Layout with BottomNav', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
  });
});