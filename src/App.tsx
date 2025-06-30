import LearningJourney from './components/LearningJourney';
import QuestionDisplay from './components/QuestionDisplay';
import SempoaBoard from './components/SempoaBoard';
import { GameProvider } from './context/GameContext';

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-100 p-4">
        <main data-testid="app-main-container" className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Sempoa Learning App
          </h1>
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            data-testid="app-grid-container"
          >
            {/* Sempoa Board - Takes up 2 columns on desktop, full width on mobile */}
            <div className="lg:col-span-2" data-testid="app-left-section">
              <SempoaBoard />
            </div>

            {/* Right column - Questions on top, Learning Journey below */}
            <div
              className="lg:col-span-1 space-y-4"
              data-testid="app-right-section"
            >
              {/* Questions - Top of right column */}
              <div data-testid="questions-container">
                <QuestionDisplay />
              </div>

              {/* Learning Journey - Below questions */}
              <LearningJourney />
            </div>
          </div>
        </main>
      </div>
    </GameProvider>
  );
}

export default App;
