import LearningJourney from './components/LearningJourney';
import QuestionDisplay from './components/QuestionDisplay';
import SempoaBoard from './components/SempoaBoard';
import { GameProvider, useGame } from './context/GameContext';
import { useAnswerChecking } from './hooks/useAnswerChecking';
import { useQuestionGeneration } from './hooks/useQuestionGeneration';
import { useUserProgress } from './hooks/useUserProgress';

function AppContent() {
  const { gameState } = useGame();
  const {
    userProgress,
    currentLevel,
    processAnswer,
    selectLevel,
    completionPercentage,
    sectionProgress,
  } = useUserProgress();
  const { generateNewQuestion } = useQuestionGeneration(currentLevel);
  const { handleCheckAnswer } = useAnswerChecking(
    userProgress,
    processAnswer,
    generateNewQuestion,
  );

  return (
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
              <QuestionDisplay
                currentQuestion={gameState.currentQuestion}
                currentLevel={currentLevel}
                onCheckAnswer={handleCheckAnswer}
              />
            </div>

            {/* Learning Journey - Below questions */}
            <LearningJourney
              userProgress={userProgress}
              selectLevel={selectLevel}
              currentLevel={currentLevel}
              completionPercentage={completionPercentage}
              sectionProgress={sectionProgress}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
